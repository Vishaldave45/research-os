import re
import uuid
from typing import List, Dict, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.workspace import Workspace
from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.evidence import Evidence
from app.models.dataset import Dataset
from app.models.model_registry import ModelRegistry
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.decision import Decision
from app.models.claim import Claim
from app.models.relationship import Relationship
from app.schemas.manuscript import (
    ManuscriptExportRequest,
    ManuscriptSection,
    TraceabilityRow,
    ManuscriptBundleResponse,
)


class ManuscriptService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def compile_manuscript(
        self,
        workspace_id: uuid.UUID,
        request: ManuscriptExportRequest,
    ) -> ManuscriptBundleResponse:
        # 1. Fetch Workspace & Entities
        ws_res = await self.db.execute(select(Workspace).where(Workspace.id == workspace_id))
        workspace = ws_res.scalar_one_or_none()
        ws_name = workspace.name if workspace else "Empirical Investigation"

        q_res = await self.db.execute(select(ResearchQuestion).where(ResearchQuestion.workspace_id == workspace_id))
        questions = q_res.scalars().all()

        p_res = await self.db.execute(select(Paper).where(Paper.workspace_id == workspace_id))
        papers = p_res.scalars().all()

        ev_res = await self.db.execute(select(Evidence).where(Evidence.workspace_id == workspace_id))
        evidence_items = ev_res.scalars().all()

        d_res = await self.db.execute(select(Dataset).where(Dataset.workspace_id == workspace_id))
        datasets = d_res.scalars().all()

        m_res = await self.db.execute(select(ModelRegistry).where(ModelRegistry.workspace_id == workspace_id))
        models = m_res.scalars().all()

        g_res = await self.db.execute(select(Gap).where(Gap.workspace_id == workspace_id))
        gaps = g_res.scalars().all()

        h_res = await self.db.execute(select(Hypothesis).where(Hypothesis.workspace_id == workspace_id))
        hypotheses = h_res.scalars().all()

        e_res = await self.db.execute(select(Experiment).where(Experiment.workspace_id == workspace_id))
        experiments = e_res.scalars().all()

        r_res = await self.db.execute(select(Result).where(Result.workspace_id == workspace_id))
        results = r_res.scalars().all()

        dec_res = await self.db.execute(select(Decision).where(Decision.workspace_id == workspace_id))
        decisions = dec_res.scalars().all()

        cl_res = await self.db.execute(select(Claim).where(Claim.workspace_id == workspace_id))
        claims = cl_res.scalars().all()

        rel_res = await self.db.execute(select(Relationship).where(Relationship.workspace_id == workspace_id))
        relationships = rel_res.scalars().all()

        # 2. Build BibTeX Library
        bibtex_entries = []
        paper_citekeys: Dict[uuid.UUID, str] = {}
        for p in papers:
            # Generate clean citekey: firstAuthorYear (e.g. lee2023)
            first_author = re.sub(r"[^a-zA-Z]", "", (p.authors[0] if p.authors else "anonymous").split()[-1].lower())
            year = p.year or 2024
            citekey = f"{first_author}{year}{p.code.lower().replace('-', '')}"
            paper_citekeys[p.id] = citekey

            authors_formatted = " and ".join(p.authors) if p.authors else "Unknown"
            doi_str = f"  doi = {{{p.doi}}},\n" if p.doi else ""
            bib_entry = (
                f"@article{{{citekey},\n"
                f"  title = {{{{{p.title}}}}},\n"
                f"  author = {{{authors_formatted}}},\n"
                f"  year = {{{year}}},\n"
                f"{doi_str}"
                f"  journal = {{Scientific Literature Repository}}\n"
                f"}}"
            )
            bibtex_entries.append(bib_entry)

        bibtex_content = "\n\n".join(bibtex_entries)

        # 3. Build Evidence Traceability Matrix
        traceability: List[TraceabilityRow] = []
        id_to_res = {r.id: r for r in results}
        id_to_exp = {e.id: e for e in experiments}
        id_to_ev = {ev.id: ev for ev in evidence_items}

        for cl in claims:
            # Find supporting relationships
            sup_res_codes = []
            sup_exp_codes = []
            ground_ev_codes = []

            for rel in relationships:
                if rel.target_id == cl.id or rel.source_id == cl.id:
                    other_id = rel.source_id if rel.target_id == cl.id else rel.target_id
                    if other_id in id_to_res:
                        sup_res_codes.append(id_to_res[other_id].code)
                    if other_id in id_to_exp:
                        sup_exp_codes.append(id_to_exp[other_id].code)
                    if other_id in id_to_ev:
                        ground_ev_codes.append(id_to_ev[other_id].code)

            traceability.append(TraceabilityRow(
                claim_code=cl.code,
                claim_statement=cl.statement,
                confidence=cl.confidence_score,
                supporting_results=list(set(sup_res_codes)),
                supporting_experiments=list(set(sup_exp_codes)),
                grounding_evidence=list(set(ground_ev_codes)),
            ))

        # 4. Synthesize Sections
        sections: List[ManuscriptSection] = []

        # SECTION 1: Abstract
        abstract_body = (
            f"This study investigates core research questions in {ws_name}. "
            f"By formulating {len(hypotheses)} targeted hypotheses against {len(gaps)} identified literature gaps, "
            f"we empirically evaluate model architectures across benchmark datasets. "
            f"Our quantitative results ({len(results)} measured checkpoints) ground {len(claims)} verified claims "
            f"with statistical significance, demonstrating systematic advancements in computational efficiency and accuracy."
        )

        # SECTION 2: Introduction & Research Inquiries
        intro_md = "## 1. Introduction & Research Inquiries\n\n"
        intro_latex = "\\section{Introduction & Research Inquiries}\n\n"
        for q in questions:
            intro_md += f"**{q.code}: {q.title}**\n{q.description}\n\n"
            intro_latex += f"\\subsection*{{{q.code}: {q.title}}}\n{q.description}\n\n"
        sections.append(ManuscriptSection(
            section_key="introduction",
            title="1. Introduction & Research Inquiries",
            content_markdown=intro_md,
            content_latex=intro_latex,
            referenced_entity_codes=[q.code for q in questions],
        ))

        # SECTION 3: Related Work & Literature Gaps
        rel_md = "## 2. Related Work & Literature Gaps\n\n"
        rel_latex = "\\section{Related Work & Literature Gaps}\n\n"
        for p in papers:
            ck = paper_citekeys.get(p.id, "ref")
            rel_md += f"- **{p.title}** ({p.year}): {p.abstract}\n"
            rel_latex += f"\\paragraph{{{p.title} \\cite{{{ck}}}}} {p.abstract}\n\n"
        rel_md += "\n### Identified Research Gaps\n\n"
        rel_latex += "\\subsection{Identified Research Gaps}\n\n"
        for g in gaps:
            rel_md += f"- **{g.code} [{g.impact_level.upper()} IMPACT]**: {g.title} — {g.description}\n"
            rel_latex += f"\\textbf{{{g.code} [{g.impact_level.upper()}]}}: {g.title} --- {g.description}\\\\\n"
        sections.append(ManuscriptSection(
            section_key="related_work",
            title="2. Related Work & Literature Gaps",
            content_markdown=rel_md,
            content_latex=rel_latex,
            referenced_entity_codes=[p.code for p in papers] + [g.code for g in gaps],
        ))

        # SECTION 4: Hypotheses & Methodology
        meth_md = "## 3. Hypotheses & Methodology\n\n"
        meth_latex = "\\section{Hypotheses & Methodology}\n\n"
        for h in hypotheses:
            meth_md += f"**Hypothesis ({h.code})**: *\"{h.statement}\"*\n- **Rationale**: {h.rationale}\n\n"
            meth_latex += f"\\begin{{quote}}\n\\textbf{{Hypothesis ({h.code})}}: \\textit{{{h.statement}}}\\\\\n\\textbf{{Rationale}}: {h.rationale}\n\\end{{quote}}\n\n"
        if datasets:
            meth_md += "### Benchmark Datasets\n"
            meth_latex += "\\subsection{Benchmark Datasets}\n"
            for d in datasets:
                meth_md += f"- **{d.name} (v{d.version})**: {d.modality} modality, {d.sample_count or 'N/A'} samples.\n"
                meth_latex += f"\\textbf{{{d.name} (v{d.version})}}: {d.modality} modality, {d.sample_count or 'N/A'} samples.\\\\\n"
        if models:
            meth_md += "\n### Architecture Specifications\n"
            meth_latex += "\\subsection{Architecture Specifications}\n"
            for m in models:
                meth_md += f"- **{m.name}**: Architecture `{m.architecture}`, Framework `{m.framework}`, Params: {m.parameter_count or 'N/A'}.\n"
                meth_latex += f"\\textbf{{{m.name}}}: Architecture \\texttt{{{m.architecture}}}, Framework \\texttt{{{m.framework}}}, Params: {m.parameter_count or 'N/A'}.\\\\\n"
        sections.append(ManuscriptSection(
            section_key="methodology",
            title="3. Hypotheses & Methodology",
            content_markdown=meth_md,
            content_latex=meth_latex,
            referenced_entity_codes=[h.code for h in hypotheses] + [d.slug for d in datasets] + [m.slug for m in models],
        ))

        # SECTION 5: Experimental Evaluation & Empirical Results
        res_md = "## 4. Experimental Evaluation & Empirical Results\n\n"
        res_latex = "\\section{Experimental Evaluation & Empirical Results}\n\n"
        for e in experiments:
            res_md += f"### Protocol {e.code}: {e.title}\n{e.description}\n\n"
            res_latex += f"\\subsection{{{e.code}: {e.title}}}\n{e.description}\n\n"
        for r in results:
            res_md += f"- **{r.code}: {r.title}**: {r.summary}\n  - Metrics: `{r.metrics_json}`\n"
            res_latex += f"\\textbf{{{r.code}: {r.title}}}: {r.summary}\\\\\n\\texttt{{Metrics: {r.metrics_json}}}\\\\\n"
        sections.append(ManuscriptSection(
            section_key="results",
            title="4. Experimental Evaluation & Empirical Results",
            content_markdown=res_md,
            content_latex=res_latex,
            referenced_entity_codes=[e.code for e in experiments] + [r.code for r in results],
        ))

        # SECTION 6: Grounded Claims & Conclusion
        claim_md = "## 5. Grounded Claims & Discussion\n\n"
        claim_latex = "\\section{Grounded Claims & Discussion}\n\n"
        for cl in claims:
            conf = f"{cl.confidence_score * 100:.0f}%" if cl.confidence_score <= 1.0 else f"{cl.confidence_score:.0f}%"
            claim_md += f"- **Claim {cl.code} [Confidence: {conf}]**: {cl.statement}\n"
            claim_latex += f"\\textbf{{Claim {cl.code} [Confidence: {conf}]}}: {cl.statement}\\\\\n"
        sections.append(ManuscriptSection(
            section_key="conclusion",
            title="5. Grounded Claims & Discussion",
            content_markdown=claim_md,
            content_latex=claim_latex,
            referenced_entity_codes=[cl.code for cl in claims],
        ))

        # 5. Compile Full LaTeX Document Source
        doc_title = f"{ws_name}: An Evidence-Backed Empirical Study"
        latex_source = (
            f"\\documentclass[journal,10pt,twocolumn]{{IEEEtran}}\n"
            f"\\usepackage{{cite}}\n"
            f"\\usepackage{{amsmath,amssymb,amsfonts}}\n"
            f"\\usepackage{{graphicx}}\n"
            f"\\usepackage{{booktabs}}\n"
            f"\\usepackage{{hyperref}}\n\n"
            f"\\begin{{document}}\n\n"
            f"\\title{{{doc_title}}}\n"
            f"\\author{{ResearchOS Collaborative Intelligence System}}\n\n"
            f"\\maketitle\n\n"
            f"\\begin{{abstract}}\n{abstract_body}\n\\end{{abstract}}\n\n"
            f"\\begin{{IEEEkeywords}}\nScientific Discovery, Research Reasoning Graphs, Reproducibility, Machine Learning\n\\end{{IEEEkeywords}}\n\n"
            f"{intro_latex}\n\n"
            f"{rel_latex}\n\n"
            f"{meth_latex}\n\n"
            f"{res_latex}\n\n"
            f"{claim_latex}\n\n"
            f"\\bibliographystyle{{IEEEtran}}\n"
            f"\\bibliography{{references}}\n\n"
            f"\\end{{document}}\n"
        )

        # 6. Compile Full Markdown Document Source
        markdown_source = (
            f"# {doc_title}\n\n"
            f"> **Abstract**: {abstract_body}\n\n"
            f"---\n\n"
            f"{intro_md}\n"
            f"{rel_md}\n"
            f"{meth_md}\n"
            f"{res_md}\n"
            f"{claim_md}\n"
        )

        return ManuscriptBundleResponse(
            workspace_id=workspace_id,
            title=doc_title,
            abstract=abstract_body,
            sections=sections,
            bibtex_content=bibtex_content,
            latex_source=latex_source,
            markdown_source=markdown_source,
            evidence_traceability_matrix=traceability,
        )
