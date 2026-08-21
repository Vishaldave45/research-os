import pytest
from app.schemas.workspace import WorkspaceCreate, WorkspaceMemberInvite, WorkspaceRead
from app.services.workspace_service import generate_slug


def test_slug_generation():
    assert generate_slug("WCE Compression Lab") == "wce-compression-lab"
    assert generate_slug("Special Characters! & Symbols @ 2026") == "special-characters-symbols-2026"
    assert generate_slug("   Padded Workspace Name   ") == "padded-workspace-name"


def test_workspace_schemas():
    ws_create = WorkspaceCreate(
        name="WCE Compression Lab",
        description="Efficient Deep Learning for Capsule Endoscopy",
    )
    assert ws_create.name == "WCE Compression Lab"

    invite = WorkspaceMemberInvite(
        email="collaborator@researchos.org",
        role="researcher",
    )
    assert invite.role == "researcher"
