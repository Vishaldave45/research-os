import uuid
from typing import Dict, Any, List
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.decision import Decision
from app.models.claim import Claim
from app.models.relationship import Relationship


class SeedService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def seed_wce_dataset(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Seeds the canonical Wireless Capsule Endoscopy (WCE) Deep Learning research project.
        Creates complete 8-node hierarchy and all bidirectional reasoning relationships.
        """
        # 1. Research Question
        q1 = ResearchQuestion(
            workspace_id=workspace_id,
            code="Q-001",
            title="How can high-frame-rate Transformer architectures achieve real-time mucosal lesion detection within the ultra-low 2.5W thermal envelope of Wireless Capsule Endoscopy edge hardware?",
            description="Investigates algorithm-hardware co-design strategies to compress Vision Transformers for high-throughput in-vivo capsule endoscopy without diagnostic sensitivity loss.",
            status="open",
            metadata_json={
                "domain": "Biomedical AI & Embedded Edge Systems",
                "target_device": "NVIDIA Jetson Nano / Coral Edge TPU / ARM Cortex-M85",
                "clinical_target": "Small Bowel Mucosal Lesions & Vascular Ectasias",
            },
            created_by=user_id,
        )
        self.db.add(q1)
        await self.db.flush()

        # 2. Key Literature Papers
        p1 = Paper(
            workspace_id=workspace_id,
            code="P-001",
            title="Vision Transformers for Gastrointestinal Video Capsule Endoscopy: A Review of Latency Constraints",
            authors=["Almeida, R.", "Venkatesh, S.", "Kaur, P."],
            year=2023,
            venue="IEEE Transactions on Medical Imaging (TMI)",
            doi="10.1109/TMI.2023.3289110",
            url="https://doi.org/10.1109/TMI.2023.3289110",
            abstract="Evaluates standard Swin and ViT backbones on multi-center WCE datasets. Demonstrates that while attention mechanisms excel at long-range polyp boundary detection, standard floating-point architectures require >12W power, leading to immediate thermal failure in closed capsule environments.",
            notes="Identifies that memory bandwidth during self-attention computation is the primary thermal bottleneck on capsule SoCs.",
            metadata_json={"citation_count": 48, "tier": "A*"},
            created_by=user_id,
        )
        p2 = Paper(
            workspace_id=workspace_id,
            code="P-002",
            title="INT4 Post-Training Quantization of Attention Blocks in Resource-Constrained Medical Devices",
            authors=["Chen, H.", "Zhao, Y.", "Leung, T."],
            year=2023,
            venue="Medical Image Computing and Computer Assisted Intervention (MICCAI)",
            doi="10.1007/978-3-031-43907-0_24",
            url="https://doi.org/10.1007/978-3-031-43907-0_24",
            abstract="Presents 4-bit uniform integer quantization for Transformer projections. Demonstrates 3.8x memory reduction on simulated microcontrollers, but reports a 7.2% drop in sensitivity for faint mucosal vascular lesions due to activation outlier clamping.",
            notes="Crucial baseline for INT4 quantization trade-offs; notes catastrophic boundary loss when outliers are clipped.",
            metadata_json={"citation_count": 31, "tier": "A*"},
            created_by=user_id,
        )
        p3 = Paper(
            workspace_id=workspace_id,
            code="P-003",
            title="Spatial Patch Folding: Preserving High-Frequency Mucosal Boundaries Under Extreme Token Sparsification",
            authors=["Gupta, M.", "O'Connor, D.", "Sato, K."],
            year=2024,
            venue="Nature Machine Intelligence",
            doi="10.1038/s42256-024-00812-w",
            url="https://doi.org/10.1038/s42256-024-00812-w",
            abstract="Introduces multi-scale spatial patch folding, grouping adjacent mucosal textures into compressed folded tokens prior to linear projection. Preserves boundary gradients while reducing total sequence length by 50%.",
            notes="Forms the foundational theoretical method for our folded edge architecture.",
            metadata_json={"citation_count": 19, "tier": "Top Journal"},
            created_by=user_id,
        )
        p4 = Paper(
            workspace_id=workspace_id,
            code="P-004",
            title="In-Vivo Thermal Dissipation Thresholds for Ingestible Micro-Electronics in Gastrointestinal Lumens",
            authors=["Fischer, K.", "Moser, E.", "Zimmermann, T."],
            year=2022,
            venue="Journal of Biomedical Engineering",
            doi="10.1016/j.jbe.2022.104112",
            url="https://doi.org/10.1016/j.jbe.2022.104112",
            abstract="Establishes that capsule outer surface temperatures must not exceed 41.5°C for longer than 3 minutes to avoid localized mucosal thermal injury. Caps total continuous power dissipation at 2.4W in the small intestine.",
            notes="Dictates our strict 2.5W / 41.5°C empirical safety boundary.",
            metadata_json={"citation_count": 64, "tier": "Q1"},
            created_by=user_id,
        )
        self.db.add_all([p1, p2, p3, p4])
        await self.db.flush()

        # 3. Research Gaps
        g1 = Gap(
            workspace_id=workspace_id,
            code="G-001",
            title="Severe boundary degradation of mucosal vascular lesions under standard 4-bit INT quantization.",
            description="Existing INT4 quantization schemes clamp activation outliers uniformly across all token patches, eliminating the fine sub-millimeter color and texture gradients required to differentiate angiodysplasia from healthy mucosa.",
            impact_level="critical",
            status="open",
            metadata_json={"derived_from_papers": ["P-001", "P-002"]},
            created_by=user_id,
        )
        g2 = Gap(
            workspace_id=workspace_id,
            code="G-002",
            title="Thermal runaway exceeding 41.5°C when running standard self-attention at >=30 FPS.",
            description="Full-resolution multi-head attention creates Quadratic memory access overhead, spiking capsule skin temperature past the in-vivo 41.5°C thermal safety envelope within 90 seconds of continuous 30+ FPS capture.",
            impact_level="high",
            status="open",
            metadata_json={"derived_from_papers": ["P-001", "P-004"]},
            created_by=user_id,
        )
        self.db.add_all([g1, g2])
        await self.db.flush()

        # 4. Hypotheses
        h1 = Hypothesis(
            workspace_id=workspace_id,
            code="H-001",
            statement="Spatial patch folding combined with asymmetric 4-bit INT quantization preserves mucosal lesion boundary gradients while reducing memory traffic by >60%, maintaining AUC >= 0.95 at 2.1W.",
            rationale="By folding local spatial neighborhoods into multi-scale tokens before quantization, high-frequency textural variance is preserved in the mantissa, preventing the outlier clamping observed in uniform INT4.",
            expected_outcome="Throughput >= 45 FPS on Jetson Nano / Edge TPU with <=2.2W power draw and <=0.01 AUC drop compared to unquantized FP32 baseline.",
            status="supported",
            metadata_json={"confidence": 0.92, "validation_tier": "empirical"},
            created_by=user_id,
        )
        h2 = Hypothesis(
            workspace_id=workspace_id,
            code="H-002",
            statement="Dynamic token pruning during non-pathological frame sequences restricts peak capsule surface temperature below 39.8°C during sustained 4-hour WCE procedures.",
            rationale="Over 88% of small bowel frames contain normal mucosa; dynamic token gating can throttle inference frequency without missing clinical lesions.",
            expected_outcome="Steady-state temperature <= 39.5°C with zero false negatives on rapid transit bleeding frames.",
            status="testing",
            metadata_json={"confidence": 0.88, "validation_tier": "empirical"},
            created_by=user_id,
        )
        h3 = Hypothesis(
            workspace_id=workspace_id,
            code="H-003",
            statement="Standard post-training INT8 quantization yields superior diagnostic performance compared to INT4 within the capsule power envelope.",
            rationale="Preliminary literature claimed INT8 would retain higher sensitivity for subtle lesions without significant thermal penalties.",
            expected_outcome="INT8 will outperform INT4 in sensitivity with manageable power increase.",
            status="refuted",
            metadata_json={"confidence": 0.35, "validation_tier": "refuted"},
            created_by=user_id,
        )
        self.db.add_all([h1, h2, h3])
        await self.db.flush()

        # 5. Experiments
        e1 = Experiment(
            workspace_id=workspace_id,
            code="E-001",
            title="FoldedViT-INT4 vs. Standard ViT Benchmark on NVIDIA Jetson Nano & Coral Edge TPU",
            description="Empirical execution on edge WCE hardware testbed measuring frame latency (ms), power draw (W), and lesion detection AUC across 15,000 multi-center endoscopic frames.",
            status="completed",
            config_json={
                "architecture": "FoldedViT-Tiny",
                "quantization": "INT4_Asymmetric",
                "input_resolution": "256x256",
                "batch_size": 1,
                "dataset": "Kvasir-Capsule + KID Dataset (15,400 frames)",
                "learning_rate": 0.0003,
                "epochs": 50,
            },
            execution_metadata_json={
                "device": "NVIDIA Jetson Nano 4GB (5W mode) + Coral TPU",
                "duration_seconds": 3840,
                "power_analyzer": "Yokogawa WT310E Precision Power Meter",
                "commit_hash": "b7e41f92",
            },
            created_by=user_id,
        )
        e2 = Experiment(
            workspace_id=workspace_id,
            code="E-002",
            title="Thermal Dissipation & Surface Temperature Profiling in Simulated 37°C Saline Chamber",
            description="Capsule prototype submerged in viscous 37.0°C saline fluid bath running continuous 45 FPS inferencing over a 4-hour continuous capture cycle.",
            status="completed",
            config_json={
                "ambient_temp_c": 37.0,
                "fps_target": 45,
                "duration_minutes": 240,
                "sensor_array": "6x Micro-Thermocouples mounted on outer shell",
            },
            execution_metadata_json={
                "chamber": "Bio-Thermal In-Vitro Sim Chamber 4B",
                "logger": "Fluke Hydra 2635A",
                "peak_temp_logged_c": 39.2,
            },
            created_by=user_id,
        )
        e3 = Experiment(
            workspace_id=workspace_id,
            code="E-003",
            title="Comparative Diagnostic Sensitivity: INT8 vs. INT4 on Obscure Mucosal Bleeding",
            description="Head-to-head receiver operating characteristic (ROC) evaluation of INT8 vs INT4 quantization on 3,200 subtle mucosal bleeding and angioectasia frames.",
            status="completed",
            config_json={"test_frames": 3200, "confidence_threshold": 0.50},
            execution_metadata_json={"evaluator": "Double-Blind Clinical Endoscopist Consensus"},
            created_by=user_id,
        )
        self.db.add_all([e1, e2, e3])
        await self.db.flush()

        # 6. Results
        r1 = Result(
            workspace_id=workspace_id,
            experiment_id=e1.id,
            code="R-001",
            title="FoldedViT-INT4 Achieved 48.6 FPS at 2.1W with 0.952 AUC",
            summary="Demonstrated 48.6 FPS sustained throughput on Jetson Nano at 2.1W mean power draw. Mucosal lesion detection AUC reached 0.952 (vs. 0.956 for uncompressed FP32 baseline), verifying boundary preservation.",
            metrics_json={
                "throughput_fps": 48.6,
                "power_watts": 2.12,
                "auc": 0.952,
                "sensitivity": 0.941,
                "specificity": 0.963,
                "latency_ms": 10.3,
                "memory_footprint_mb": 14.8,
            },
            artifacts_json=[
                {
                    "type": "roc_curve",
                    "title": "FoldedViT_INT4_ROC.png",
                    "url": "https://storage.researchos.org/artifacts/wce/FoldedViT_INT4_ROC.png",
                },
                {
                    "type": "thermal_map",
                    "title": "Jetson_Thermal_Trace.csv",
                    "url": "https://storage.researchos.org/artifacts/wce/Jetson_Thermal_Trace.csv",
                },
            ],
            status="valid",
            created_by=user_id,
        )
        r2 = Result(
            workspace_id=workspace_id,
            experiment_id=e2.id,
            code="R-002",
            title="Capsule Surface Temperature Stabilized at 39.2°C Over 4 Hours",
            summary="Under sustained 45 FPS inferencing with spatial folding, maximum shell temperature plateaued at 39.2°C, safely below the 41.5°C mucosal thermal injury threshold.",
            metrics_json={
                "max_temperature_c": 39.2,
                "safety_margin_c": 2.3,
                "steady_state_time_min": 24.5,
                "delta_t_ambient_c": 2.2,
            },
            artifacts_json=[
                {
                    "type": "chart",
                    "title": "4Hour_Thermal_Plateau.svg",
                    "url": "https://storage.researchos.org/artifacts/wce/4Hour_Thermal_Plateau.svg",
                }
            ],
            status="valid",
            created_by=user_id,
        )
        r3 = Result(
            workspace_id=workspace_id,
            experiment_id=e3.id,
            code="R-003",
            title="INT8 Exceeded Thermal Ceiling (3.8W) with Marginal AUC Advantage (+0.004)",
            summary="While INT8 achieved 0.956 AUC, its 3.8W power draw caused thermal runaway to 43.1°C within 8 minutes, rendering INT8 physically unviable for in-vivo capsule deployment.",
            metrics_json={
                "power_watts": 3.82,
                "auc": 0.956,
                "peak_temperature_c": 43.1,
                "thermal_runaway": True,
            },
            artifacts_json=[],
            status="valid",
            created_by=user_id,
        )
        self.db.add_all([r1, r2, r3])
        await self.db.flush()

        # 7. Decisions
        d1 = Decision(
            workspace_id=workspace_id,
            code="D-001",
            title="Adopt Spatial Patch Folding + Asymmetric INT4 Quantization for Production Capsule Firmware",
            outcome="accepted",
            rationale="Empirical trials (R-001, R-002) confirmed 48.6 FPS throughput at 2.1W with 0.952 AUC and 39.2°C thermal ceiling, satisfying all clinical and hardware constraints.",
            implications="All downstream firmware kernels and FPGA/TPU execution graphs will target FoldedViT-INT4 quantization specs.",
            metadata_json={"reviewer": "Endoscopy Architecture Review Board", "phase": "Clinical Prototype"},
            created_by=user_id,
        )
        d2 = Decision(
            workspace_id=workspace_id,
            code="D-002",
            title="Reject Standard INT8 and Uncompressed FP32 Architectures for In-Vivo Telemetry",
            outcome="rejected",
            rationale="Trial R-003 proved INT8 causes thermal runaway to 43.1°C exceeding patient safety limits (P-004), despite minor +0.004 AUC score gain.",
            implications="Eliminates INT8 exploration for capsule SoCs; focuses all future work on INT4/INT2 hybrid topologies.",
            metadata_json={"safety_violation": "Thermal Threshold Exceeded"},
            created_by=user_id,
        )
        self.db.add_all([d1, d2])
        await self.db.flush()

        # 8. Claims
        c1 = Claim(
            workspace_id=workspace_id,
            code="C-001",
            statement="Spatial patch folding preserves multi-scale mucosal lesion boundaries under extreme 4-bit INT quantization with negligible diagnostic sensitivity loss (0.952 AUC vs 0.956 FP32 baseline).",
            confidence_score=0.96,
            status="verified",
            metadata_json={
                "evidence_type": "Empirical Hardware Validation",
                "cross_validated": True,
                "sample_size": 15400,
            },
            created_by=user_id,
        )
        c2 = Claim(
            workspace_id=workspace_id,
            code="C-002",
            statement="Real-time in-vivo Transformer inferencing at >=48 FPS is thermally safe and sustainable within a 2.1W power budget under continuous 4-hour capsule transit.",
            confidence_score=0.94,
            status="verified",
            metadata_json={
                "evidence_type": "In-Vitro Saline Chamber Thermal Profiling",
                "max_temp_c": 39.2,
                "safety_threshold_c": 41.5,
            },
            created_by=user_id,
        )
        self.db.add_all([c1, c2])
        await self.db.flush()

        # 9. Connective Polymorphic Relationships (The Core Research Graph)
        rels = [
            # Paper citations & inspirations for Question
            Relationship(
                workspace_id=workspace_id,
                source_type="paper",
                source_id=p1.id,
                target_type="question",
                target_id=q1.id,
                relation_type="cites",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="paper",
                source_id=p4.id,
                target_type="question",
                target_id=q1.id,
                relation_type="cites",
                created_by=user_id,
            ),
            # Papers informing Gaps
            Relationship(
                workspace_id=workspace_id,
                source_type="paper",
                source_id=p2.id,
                target_type="gap",
                target_id=g1.id,
                relation_type="informs",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="paper",
                source_id=p1.id,
                target_type="gap",
                target_id=g2.id,
                relation_type="informs",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="paper",
                source_id=p4.id,
                target_type="gap",
                target_id=g2.id,
                relation_type="informs",
                created_by=user_id,
            ),
            # Gaps motivating Hypotheses
            Relationship(
                workspace_id=workspace_id,
                source_type="gap",
                source_id=g1.id,
                target_type="hypothesis",
                target_id=h1.id,
                relation_type="motivates",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="gap",
                source_id=g2.id,
                target_type="hypothesis",
                target_id=h2.id,
                relation_type="motivates",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="paper",
                source_id=p3.id,
                target_type="hypothesis",
                target_id=h1.id,
                relation_type="informs",
                created_by=user_id,
            ),
            # Hypotheses addressing Question
            Relationship(
                workspace_id=workspace_id,
                source_type="hypothesis",
                source_id=h1.id,
                target_type="question",
                target_id=q1.id,
                relation_type="addresses",
                created_by=user_id,
            ),
            # Experiments testing Hypotheses
            Relationship(
                workspace_id=workspace_id,
                source_type="experiment",
                source_id=e1.id,
                target_type="hypothesis",
                target_id=h1.id,
                relation_type="tests",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="experiment",
                source_id=e2.id,
                target_type="hypothesis",
                target_id=h2.id,
                relation_type="tests",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="experiment",
                source_id=e3.id,
                target_type="hypothesis",
                target_id=h3.id,
                relation_type="tests",
                created_by=user_id,
            ),
            # Results supporting / refuting Hypotheses
            Relationship(
                workspace_id=workspace_id,
                source_type="result",
                source_id=r1.id,
                target_type="hypothesis",
                target_id=h1.id,
                relation_type="supports",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="result",
                source_id=r2.id,
                target_type="hypothesis",
                target_id=h2.id,
                relation_type="supports",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="result",
                source_id=r3.id,
                target_type="hypothesis",
                target_id=h3.id,
                relation_type="refutes",
                created_by=user_id,
            ),
            # Results informing Decisions
            Relationship(
                workspace_id=workspace_id,
                source_type="result",
                source_id=r1.id,
                target_type="decision",
                target_id=d1.id,
                relation_type="informs",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="result",
                source_id=r2.id,
                target_type="decision",
                target_id=d1.id,
                relation_type="informs",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="result",
                source_id=r3.id,
                target_type="decision",
                target_id=d2.id,
                relation_type="informs",
                created_by=user_id,
            ),
            # Results supporting Claims
            Relationship(
                workspace_id=workspace_id,
                source_type="result",
                source_id=r1.id,
                target_type="claim",
                target_id=c1.id,
                relation_type="supports",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="result",
                source_id=r2.id,
                target_type="claim",
                target_id=c2.id,
                relation_type="supports",
                created_by=user_id,
            ),
            # Claims derived from Hypotheses
            Relationship(
                workspace_id=workspace_id,
                source_type="claim",
                source_id=c1.id,
                target_type="hypothesis",
                target_id=h1.id,
                relation_type="derived_from",
                created_by=user_id,
            ),
            Relationship(
                workspace_id=workspace_id,
                source_type="claim",
                source_id=c2.id,
                target_type="hypothesis",
                target_id=h2.id,
                relation_type="derived_from",
                created_by=user_id,
            ),
            # Paper citing Claims
            Relationship(
                workspace_id=workspace_id,
                source_type="paper",
                source_id=p3.id,
                target_type="claim",
                target_id=c1.id,
                relation_type="cites",
                created_by=user_id,
            ),
        ]
        self.db.add_all(rels)
        await self.db.commit()

        return {
            "workspace_id": str(workspace_id),
            "seeded_entities": {
                "questions": 1,
                "papers": 4,
                "gaps": 2,
                "hypotheses": 3,
                "experiments": 3,
                "results": 3,
                "decisions": 2,
                "claims": 2,
                "relationships": len(rels),
            },
            "status": "success",
            "message": "Wireless Capsule Endoscopy (WCE) seed dataset successfully initialized.",
        }
