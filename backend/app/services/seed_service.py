import uuid
import re
from typing import Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.decision import Decision
from app.models.claim import Claim
from app.models.dataset import Dataset
from app.models.model_registry import ModelRegistry
from app.models.evidence import Evidence
from app.models.relationship import Relationship


class SeedService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def seed_wce_dataset(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Seeds the canonical Wireless Capsule Endoscopy (WCE) Deep Learning research project:
        'Depth-Reduced Deep Learning Models via Structured Pruning, Knowledge Distillation,
        and Layer Folding for Wireless Capsule Endoscopy'.

        Deterministic and Idempotent across the entire 10-archetype scientific graph:
        Question -> Paper -> Evidence -> Gap -> Hypothesis -> Dataset -> Model -> Experiment -> Result -> Decision -> Claim.
        """
        # 0. Canonical Research Project (Idempotent check)
        project = await self.db.scalar(
            select(Project).where(
                Project.workspace_id == workspace_id,
                Project.slug == "wce-model-compression",
            )
        )
        if not project:
            project = Project(
                workspace_id=workspace_id,
                name="WCE Model Compression",
                slug="wce-model-compression",
                research_area="Medical AI & Model Compression",
                description="Depth-reduced deep learning models via structured pruning, knowledge distillation, and layer folding for wireless capsule endoscopy.",
                status="active",
                created_by=user_id,
            )
            self.db.add(project)
            await self.db.flush()

        # 1. Primary Research Question
        q1 = await self.db.scalar(
            select(ResearchQuestion).where(
                ResearchQuestion.workspace_id == workspace_id,
                ResearchQuestion.code == "Q-001",
            )
        )
        if not q1:
            q1 = ResearchQuestion(
                workspace_id=workspace_id,
                code="Q-001",
                title="How can depth-reduction techniques (layer folding, structured pruning, and knowledge distillation) compress deep convolutional backbones (VGG16, ResNet50, DenseNet121) for real-time Wireless Capsule Endoscopy without losing diagnostic fidelity on Kvasir-Capsule?",
                description="Investigates systematic model compression and depth-reduction architectures to enable low-latency, energy-efficient inference for in-vivo endoscopic video analysis on resource-constrained hardware.",
                status="active",
                metadata_json={
                    "domain": "Biomedical Computer Vision & Embedded Deep Learning",
                    "target_models": ["VGG16", "ResNet50", "DenseNet121"],
                    "benchmark_datasets": ["Kvasir", "Kvasir-Capsule"],
                    "compression_methods": ["Layer Folding", "Structured Pruning", "Knowledge Distillation"],
                },
                created_by=user_id,
            )
            self.db.add(q1)
            await self.db.flush()

        # 2. Key Literature Papers
        p1 = await self.db.scalar(select(Paper).where(Paper.workspace_id == workspace_id, Paper.code == "P-001"))
        if not p1:
            p1 = Paper(
                workspace_id=workspace_id,
                code="P-001",
                title="Kvasir-Capsule: A Video Capsule Endoscopy Dataset",
                authors=["Smedsrud, P. H.", "Thambawita, V.", "Hicks, S. A.", "Halvorsen, P."],
                year=2021,
                venue="Nature Scientific Data",
                doi="10.1038/s41597-021-00920-z",
                url="https://doi.org/10.1038/s41597-021-00920-z",
                abstract="Presents an open-access dataset containing 47,238 labeled bounding-box and multi-class clinical frames from capsule endoscopy procedures, serving as standard benchmark for gastrointestinal abnormality classification.",
                notes="Standard target benchmark dataset for our model training and evaluation protocols.",
                metadata_json={"citation_count": 142, "dataset_split": "14 anomaly classes"},
                created_by=user_id,
            )
            self.db.add(p1)

        p2 = await self.db.scalar(select(Paper).where(Paper.workspace_id == workspace_id, Paper.code == "P-002"))
        if not p2:
            p2 = Paper(
                workspace_id=workspace_id,
                code="P-002",
                title="Pruning Filters for Efficient ConvNets",
                authors=["Li, H.", "Kadav, A.", "Durdanovic, I.", "Samet, H.", "Graf, H. P."],
                year=2017,
                venue="International Conference on Learning Representations (ICLR)",
                doi="10.48550/arXiv.1608.08710",
                url="https://arxiv.org/abs/1608.08710",
                abstract="Introduces structured filter pruning based on L1-norm magnitude to eliminate redundant convolutional feature maps without requiring specialized sparse matrix computation hardware.",
                notes="Methodological foundation for structured pruning baseline on VGG16 and ResNet50.",
                metadata_json={"citation_count": 2850, "technique": "Structured Pruning"},
                created_by=user_id,
            )
            self.db.add(p2)

        p3 = await self.db.scalar(select(Paper).where(Paper.workspace_id == workspace_id, Paper.code == "P-003"))
        if not p3:
            p3 = Paper(
                workspace_id=workspace_id,
                code="P-003",
                title="Distilling the Knowledge in a Neural Network",
                authors=["Hinton, G.", "Vinyals, O.", "Dean, J."],
                year=2015,
                venue="NIPS Deep Learning and Representation Learning Workshop",
                doi="10.48550/arXiv.1503.02531",
                url="https://arxiv.org/abs/1503.02531",
                abstract="Establishes dark-knowledge transfer from heavy ensemble teacher networks to compact student models via temperature-scaled soft probability logits.",
                notes="Foundational formulation for logit and feature-based teacher-student distillation.",
                metadata_json={"citation_count": 18400, "technique": "Knowledge Distillation"},
                created_by=user_id,
            )
            self.db.add(p3)
        await self.db.flush()

        # 3. Evidence Items
        ev1 = await self.db.scalar(select(Evidence).where(Evidence.workspace_id == workspace_id, Evidence.code == "EV-001"))
        if not ev1:
            ev1 = Evidence(
                workspace_id=workspace_id,
                code="EV-001",
                title="Full-Precision ResNet50 achieves 94.2% diagnostic AUC on Kvasir-Capsule",
                summary="Standard unpruned deep convolutional architectures achieve clinically viable pathology classification but require >140ms per frame on edge embedded processors.",
                evidence_type="empirical",
                strength="strong",
                source_type="paper",
                source_id=p1.id if p1 else None,
                citation_doi="10.1038/s41597-021-00920-z",
                confidence_score=95,
                metadata_json={"target_metric": "AUC", "score": 0.942},
                created_by=user_id,
            )
            self.db.add(ev1)
            await self.db.flush()

        # 4. Gaps in Literature
        g1 = await self.db.scalar(select(Gap).where(Gap.workspace_id == workspace_id, Gap.code == "G-001"))
        if not g1:
            g1 = Gap(
                workspace_id=workspace_id,
                code="G-001",
                title="Deep architectural depth in standard ResNet50 incurs sequential latency bottleneck exceeding sub-2W capsule telemetry envelopes.",
                description="Conventional deep networks have large layer depths that create memory read/write latency bottlenecks and high battery consumption during continuous in-vivo capsule traversal.",
                impact_level="critical",
                status="open",
                created_by=user_id,
            )
            self.db.add(g1)

        g2 = await self.db.scalar(select(Gap).where(Gap.workspace_id == workspace_id, Gap.code == "G-002"))
        if not g2:
            g2 = Gap(
                workspace_id=workspace_id,
                code="G-002",
                title="Unstructured pruning produces sparse matrices without real speedups on edge micro-accelerators.",
                description="Without structured channel/layer reduction or dedicated hardware sparse engines, theoretical parameter drops do not provide real-world frame rate speedups.",
                impact_level="high",
                status="open",
                created_by=user_id,
            )
            self.db.add(g2)
        await self.db.flush()

        # 5. Hypotheses
        h1 = await self.db.scalar(select(Hypothesis).where(Hypothesis.workspace_id == workspace_id, Hypothesis.code == "H-001"))
        if not h1:
            h1 = Hypothesis(
                workspace_id=workspace_id,
                code="H-001",
                title="Layer Folding Depth Reduction with Feature Re-use",
                statement="Applying progressive layer folding to collapse sequential residual stages in ResNet50 while retaining cross-layer feature re-use will reduce inference latency below 20ms with negligible loss in diagnostic classification accuracy on Kvasir-Capsule.",
                rationale="Layer folding compresses the sequential pipeline depth while maintaining receptive field representation via fused convolution blocks.",
                expected_outcome="Substantial reduction in inference latency and model parameter footprint while preserving multi-class lesion recognition sensitivity.",
                status="active",
                confidence_score=0.85,
                created_by=user_id,
            )
            self.db.add(h1)

        h2 = await self.db.scalar(select(Hypothesis).where(Hypothesis.workspace_id == workspace_id, Hypothesis.code == "H-002"))
        if not h2:
            h2 = Hypothesis(
                workspace_id=workspace_id,
                code="H-002",
                title="Sequential Pruning with Logit-and-Feature Distillation",
                statement="Structured L1 filter pruning combined with feature-level knowledge distillation from unpruned DenseNet121 teachers will recover subtle mucosal lesion discrimination lost during aggressive channel removal.",
                rationale="Distillation supervises the intermediate activation maps of the pruned student, compensating for reduced channel capacity.",
                expected_outcome="Pruned student model matches teacher discrimination thresholds on rare mucosal pathologies.",
                status="active",
                confidence_score=0.80,
                created_by=user_id,
            )
            self.db.add(h2)
        await self.db.flush()

        # 6. Datasets
        ds1 = await self.db.scalar(select(Dataset).where(Dataset.workspace_id == workspace_id, Dataset.slug == "kvasir-capsule-v1"))
        if not ds1:
            ds1 = Dataset(
                workspace_id=workspace_id,
                name="Kvasir-Capsule Video Endoscopy Benchmark",
                slug="kvasir-capsule-v1",
                version="1.0.0",
                modality="image",
                description="47,238 clinical video capsule endoscopy frames classified across 14 anatomical and pathological findings.",
                source_url="https://doi.org/10.1038/s41597-021-00920-z",
                license="CC-BY-4.0",
                sample_count=47238,
                size_bytes=4294967296,
                preprocessing_spec={"resize": [224, 224], "normalization": "ImageNet"},
                split_spec={"train": 0.70, "val": 0.15, "test": 0.15},
                metadata_json={"organ": "Gastrointestinal tract", "modality": "VCE"},
                created_by=user_id,
            )
            self.db.add(ds1)
            await self.db.flush()

        # 7. Model Registries
        m1 = await self.db.scalar(select(ModelRegistry).where(ModelRegistry.workspace_id == workspace_id, ModelRegistry.slug == "resnet50-baseline"))
        if not m1:
            m1 = ModelRegistry(
                workspace_id=workspace_id,
                name="ResNet50 Baseline Backbone",
                slug="resnet50-baseline",
                version="1.0.0",
                architecture="ResNet50",
                framework="pytorch",
                parameter_count=25600000,
                code_commit_hash="git-a19f802",
                description="Full-depth 50-layer baseline convolutional backbone without depth reduction or pruning.",
                hyperparameters={"depth": 50, "precision": "FP32", "initial_lr": 1e-4},
                metadata_json={"flops_g": 4.12, "target_device": "RTX 4090 / Jetson"},
                created_by=user_id,
            )
            self.db.add(m1)

        m2 = await self.db.scalar(select(ModelRegistry).where(ModelRegistry.workspace_id == workspace_id, ModelRegistry.slug == "resnet-folded-18"))
        if not m2:
            m2 = ModelRegistry(
                workspace_id=workspace_id,
                name="ResNet-Folded-18 (Depth-Reduced)",
                slug="resnet-folded-18",
                version="1.0.0",
                architecture="ResNet-Folded-18",
                framework="pytorch",
                parameter_count=8900000,
                code_commit_hash="git-b44c911",
                description="Progressive layer-folded compact backbone with fused residual stages and cross-layer feature distillation.",
                hyperparameters={"depth": 18, "folding_stages": [2, 3], "precision": "FP16"},
                metadata_json={"flops_g": 1.42, "target_device": "Jetson Orin Nano / Micro-accelerator"},
                created_by=user_id,
            )
            self.db.add(m2)
        await self.db.flush()

        # 8. Experiments
        e1 = await self.db.scalar(select(Experiment).where(Experiment.workspace_id == workspace_id, Experiment.code == "E-001"))
        if not e1:
            e1 = Experiment(
                workspace_id=workspace_id,
                code="E-001",
                title="Baseline Evaluation of Uncompressed ResNet50 Backbone on Kvasir-Capsule",
                description="Establish baseline accuracy, parameter counts, and inference times for full-depth backbone models on standardized Kvasir-Capsule splits.",
                status="completed",
                config={
                    "model": "ResNet50",
                    "dataset": "Kvasir-Capsule",
                    "image_size": [224, 224],
                    "batch_size": 32,
                    "optimizer": "AdamW",
                    "learning_rate": 0.0001,
                },
                execution_metadata={
                    "status": "completed",
                    "hardware_target": "NVIDIA Jetson Orin Nano",
                    "device": "Jetson Orin Nano",
                },
                created_by=user_id,
            )
            self.db.add(e1)

        e2 = await self.db.scalar(select(Experiment).where(Experiment.workspace_id == workspace_id, Experiment.code == "E-002"))
        if not e2:
            e2 = Experiment(
                workspace_id=workspace_id,
                code="E-002",
                title="Progressive Layer Folding Depth Reduction Architecture on ResNet50",
                description="Execute layer folding transformation reducing 50-layer depth into folded 18-layer equivalent, measuring representation retention.",
                status="completed",
                config={
                    "base_model": "ResNet50",
                    "folding_strategy": "progressive_stage_merge",
                    "target_depth": 18,
                    "dataset": "Kvasir-Capsule",
                },
                execution_metadata={
                    "status": "completed",
                    "hardware_target": "NVIDIA Jetson Orin Nano",
                    "device": "Jetson Orin Nano",
                },
                created_by=user_id,
            )
            self.db.add(e2)
        await self.db.flush()

        # 9. Results (Empirically Logged)
        r1 = await self.db.scalar(select(Result).where(Result.workspace_id == workspace_id, Result.code == "R-001"))
        if not r1:
            r1 = Result(
                workspace_id=workspace_id,
                code="R-001",
                title="Baseline Accuracy and Latency Profile on Kvasir-Capsule",
                summary="Full uncompressed ResNet50 achieved 93.8% accuracy with 48.2ms per-frame latency (4.12 GFLOPs, 25.6M parameters) on Jetson Orin Nano.",
                metrics={
                    "accuracy": 93.8,
                    "top1_accuracy": 93.8,
                    "f1_score": 0.912,
                    "latency_ms": 48.2,
                    "flops_g": 4.12,
                    "memory_mb": 256.0,
                    "power_watts": 4.8,
                    "fps": 20.7,
                    "dataset": "Kvasir-Capsule",
                    "hardware": "NVIDIA Jetson Orin Nano",
                    "architecture": "ResNet50",
                    "depth": 50,
                    "is_baseline": True,
                    "is_pareto": False,
                },
                artifacts=[{"type": "confusion_matrix", "title": "Baseline CM", "url": "/artifacts/r1_cm.png"}],
                status="valid",
                created_by=user_id,
            )
            self.db.add(r1)

        r2 = await self.db.scalar(select(Result).where(Result.workspace_id == workspace_id, Result.code == "R-002"))
        if not r2:
            r2 = Result(
                workspace_id=workspace_id,
                code="R-002",
                title="Layer-Folded ResNet18 Latency Speedup and Sensitivity",
                summary="Folded 18-layer equivalent retained 92.4% accuracy (0.931 AUC) with inference latency reduced to 16.4ms (61.0 FPS, 1.42 GFLOPs, 8.9M parameters, 1.91W power envelope).",
                metrics={
                    "accuracy": 92.4,
                    "top1_accuracy": 92.4,
                    "f1_score": 0.898,
                    "latency_ms": 16.4,
                    "flops_g": 1.42,
                    "memory_mb": 88.0,
                    "power_watts": 1.91,
                    "fps": 61.0,
                    "dataset": "Kvasir-Capsule",
                    "hardware": "NVIDIA Jetson Orin Nano",
                    "architecture": "ResNet-Folded-18",
                    "depth": 18,
                    "is_baseline": False,
                    "is_pareto": True,
                },
                artifacts=[{"type": "latency_trace", "title": "Folded Profile", "url": "/artifacts/r2_latency.png"}],
                status="valid",
                created_by=user_id,
            )
            self.db.add(r2)
        await self.db.flush()

        # 10. Decisions
        dec1 = await self.db.scalar(select(Decision).where(Decision.workspace_id == workspace_id, Decision.code == "D-001"))
        if not dec1:
            dec1 = Decision(
                workspace_id=workspace_id,
                code="D-001",
                title="Adopt Progressive Layer Folding as Core Compression Architecture",
                outcome="accepted",
                rationale="Layer folding delivers a 2.94x latency reduction (16.4ms vs 48.2ms) while maintaining 92.4% diagnostic accuracy on Kvasir-Capsule within the 2W power budget.",
                implications="All subsequent distillation pipelines will use the 18-layer folded backbone as primary student architecture.",
                metadata_json={"target_hardware": "Jetson Orin Nano", "validated_by": "Dr. Lead Researcher"},
                created_by=user_id,
            )
            self.db.add(dec1)
            await self.db.flush()

        # 11. Claims
        c1 = await self.db.scalar(select(Claim).where(Claim.workspace_id == workspace_id, Claim.code == "C-001"))
        if not c1:
            c1 = Claim(
                workspace_id=workspace_id,
                code="C-001",
                statement="Progressive layer folding combined with cross-stage feature re-use reduces convolutional backbone inference latency below 20ms (61 FPS) on edge hardware without clinically significant loss in gastrointestinal abnormality classification on Kvasir-Capsule.",
                confidence_score=0.94,
                status="verified",
                metadata_json={"supporting_results": ["R-002"], "supporting_decisions": ["D-001"]},
                created_by=user_id,
            )
            self.db.add(c1)
            await self.db.flush()

        # 12. Directed Provenance Relationships
        existing_rel_count = await self.db.scalar(select(Relationship).where(Relationship.workspace_id == workspace_id))
        if not existing_rel_count:
            rels = [
                Relationship(workspace_id=workspace_id, source_type="paper", source_id=p1.id, target_type="question", target_id=q1.id, relation_type="cites", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="paper", source_id=p2.id, target_type="gap", target_id=g2.id, relation_type="informs", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="evidence", source_id=ev1.id, target_type="question", target_id=q1.id, relation_type="informs", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="gap", source_id=g1.id, target_type="hypothesis", target_id=h1.id, relation_type="motivates", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="gap", source_id=g2.id, target_type="hypothesis", target_id=h2.id, relation_type="motivates", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="hypothesis", source_id=h1.id, target_type="question", target_id=q1.id, relation_type="addresses", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="hypothesis", source_id=h2.id, target_type="question", target_id=q1.id, relation_type="addresses", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="dataset", source_id=ds1.id, target_type="experiment", target_id=e1.id, relation_type="informs", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="dataset", source_id=ds1.id, target_type="experiment", target_id=e2.id, relation_type="informs", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="model", source_id=m1.id, target_type="experiment", target_id=e1.id, relation_type="tests", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="model", source_id=m2.id, target_type="experiment", target_id=e2.id, relation_type="tests", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="experiment", source_id=e1.id, target_type="hypothesis", target_id=h1.id, relation_type="tests", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="experiment", source_id=e2.id, target_type="hypothesis", target_id=h1.id, relation_type="tests", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="experiment", source_id=e1.id, target_type="result", target_id=r1.id, relation_type="produces", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="experiment", source_id=e2.id, target_type="result", target_id=r2.id, relation_type="produces", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="result", source_id=r2.id, target_type="decision", target_id=dec1.id, relation_type="informs", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="decision", source_id=dec1.id, target_type="claim", target_id=c1.id, relation_type="leads_to", created_by=user_id),
                Relationship(workspace_id=workspace_id, source_type="result", source_id=r2.id, target_type="claim", target_id=c1.id, relation_type="supports", created_by=user_id),
            ]
            self.db.add_all(rels)
            await self.db.flush()

        await self.db.commit()

        return {
            "status": "success",
            "message": "Canonical WCE Depth-Reduction research project graph seeded successfully into PostgreSQL.",
            "workspace_id": str(workspace_id),
        }
