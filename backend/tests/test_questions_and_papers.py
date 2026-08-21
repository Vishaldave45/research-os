import pytest
from app.schemas.research_question_and_paper import (
    ResearchQuestionCreate,
    PaperCreate,
    ResearchQuestionRead,
    PaperRead,
)


def test_research_question_schema():
    q = ResearchQuestionCreate(
        title="Can structured layer folding reduce WCE inference latency without degrading diagnostic sensitivity?",
        description="Investigating depth reduction and pruning on capsule endoscopy classification models.",
        status="open",
        metadata={"domain": "medical_imaging", "target_fps": 30},
    )
    assert "layer folding" in q.title
    assert q.status == "open"
    assert q.metadata.get("target_fps") == 30


def test_paper_schema():
    p = PaperCreate(
        title="Deep Learning Approaches for Wireless Capsule Endoscopy: A Comprehensive Survey",
        authors=["A. Kumar", "M. Rostami", "D. Chen"],
        year=2023,
        venue="IEEE Transactions on Medical Imaging",
        doi="10.1109/TMI.2023.1234567",
        abstract="Wireless capsule endoscopy generates large video streams requiring real-time inference.",
    )
    assert len(p.authors) == 3
    assert p.year == 2023
    assert p.venue == "IEEE Transactions on Medical Imaging"
