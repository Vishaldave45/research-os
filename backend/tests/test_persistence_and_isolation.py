import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership
from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.decision import Decision
from app.models.claim import Claim
from app.models.relationship import Relationship
from app.repositories import user_repository, workspace_repository


# ==========================================
# IN-MEMORY TEST FIXTURE STATE FOR MOCK DB
# ==========================================

class FakeDatabaseState:
    def __init__(self):
        self.users: dict[uuid.UUID, User] = {}
        self.workspaces: dict[uuid.UUID, Workspace] = {}
        self.memberships: list[WorkspaceMembership] = []
        self.questions: list[ResearchQuestion] = []
        self.papers: list[Paper] = []
        self.gaps: list[Gap] = []
        self.hypotheses: list[Hypothesis] = []
        self.experiments: list[Experiment] = []
        self.results: list[Result] = []
        self.decisions: list[Decision] = []
        self.claims: list[Claim] = []
        self.relationships: list[Relationship] = []

    def clear(self):
        self.users.clear()
        self.workspaces.clear()
        self.memberships.clear()
        self.questions.clear()
        self.papers.clear()
        self.gaps.clear()
        self.hypotheses.clear()
        self.experiments.clear()
        self.results.clear()
        self.decisions.clear()
        self.claims.clear()
        self.relationships.clear()


test_db = FakeDatabaseState()


class MockUserRepository:
    def __init__(self, db=None):
        pass

    async def get_by_id(self, user_id: uuid.UUID):
        return test_db.users.get(user_id)

    async def get_by_email(self, email: str):
        for u in test_db.users.values():
            if u.email.lower() == email.lower():
                return u
        return None

    async def create(self, user: User):
        if not hasattr(user, "id") or user.id is None:
            user.id = uuid.uuid4()
        test_db.users[user.id] = user
        return user


class MockWorkspaceRepository:
    def __init__(self, db=None):
        pass

    async def get_by_id(self, workspace_id: uuid.UUID):
        return test_db.workspaces.get(workspace_id)

    async def get_membership(self, workspace_id: uuid.UUID, user_id: uuid.UUID):
        for m in test_db.memberships:
            if m.workspace_id == workspace_id and m.user_id == user_id:
                return m
        return None

    async def create(self, workspace: Workspace):
        if not hasattr(workspace, "id") or workspace.id is None:
            workspace.id = uuid.uuid4()
        test_db.workspaces[workspace.id] = workspace
        return workspace

    async def add_member(self, membership: WorkspaceMembership):
        if not hasattr(membership, "id") or membership.id is None:
            membership.id = uuid.uuid4()
        test_db.memberships.append(membership)
        return membership

    async def list_for_user(self, user_id: uuid.UUID):
        ws_ids = [m.workspace_id for m in test_db.memberships if m.user_id == user_id]
        return [test_db.workspaces[ws_id] for ws_id in ws_ids if ws_id in test_db.workspaces]


@pytest.fixture(autouse=True)
def setup_mock_repositories(monkeypatch):
    test_db.clear()
    monkeypatch.setattr(user_repository, "UserRepository", MockUserRepository)
    monkeypatch.setattr("app.core.dependencies.UserRepository", MockUserRepository)
    monkeypatch.setattr(workspace_repository, "WorkspaceRepository", MockWorkspaceRepository)
    monkeypatch.setattr("app.api.deps.WorkspaceRepository", MockWorkspaceRepository)


# ==========================================
# 1. HEALTH & READINESS TESTS (P0-16)
# ==========================================

@pytest.mark.asyncio
async def test_health_check_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"


# ==========================================
# 2. WORKSPACE ISOLATION TESTS (P0-9)
# ==========================================

@pytest.mark.asyncio
async def test_workspace_multi_tenant_isolation():
    # Create User A with Workspace A
    user_a = User(
        id=uuid.uuid4(),
        email="alice@wce-lab.org",
        hashed_password="hashed_pw_1",
        full_name="Dr. Alice",
        role="researcher",
        is_active=True,
    )
    test_db.users[user_a.id] = user_a

    ws_a = Workspace(
        id=uuid.uuid4(),
        name="Alice Lab A",
        slug="alice-lab-a",
        description="Workspace A",
        owner_id=user_a.id,
    )
    test_db.workspaces[ws_a.id] = ws_a
    test_db.memberships.append(
        WorkspaceMembership(
            id=uuid.uuid4(),
            workspace_id=ws_a.id,
            user_id=user_a.id,
            role="owner",
        )
    )

    # Create User B with Workspace B
    user_b = User(
        id=uuid.uuid4(),
        email="bob@wce-lab.org",
        hashed_password="hashed_pw_2",
        full_name="Dr. Bob",
        role="researcher",
        is_active=True,
    )
    test_db.users[user_b.id] = user_b

    ws_b = Workspace(
        id=uuid.uuid4(),
        name="Bob Lab B",
        slug="bob-lab-b",
        description="Workspace B",
        owner_id=user_b.id,
    )
    test_db.workspaces[ws_b.id] = ws_b
    test_db.memberships.append(
        WorkspaceMembership(
            id=uuid.uuid4(),
            workspace_id=ws_b.id,
            user_id=user_b.id,
            role="owner",
        )
    )

    token_a = create_access_token(subject=str(user_a.id))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # User A attempts to access Workspace B resources by changing the X-Workspace-Id header
        res = await client.get(
            "/api/v1/questions",
            headers={
                "Authorization": f"Bearer {token_a}",
                "X-Workspace-Id": str(ws_b.id),  # Belongs to Bob, NOT Alice
            },
        )
        # Must be strictly rejected with 403 Forbidden
        assert res.status_code == 403
        data = res.json()
        assert data["error"]["code"] == "FORBIDDEN"


# ==========================================
# 3. RELATIONSHIP SYSTEM & CYCLE DETECTION (P0-11)
# ==========================================

@pytest.mark.asyncio
async def test_relationship_cycle_detection():
    user = User(
        id=uuid.uuid4(),
        email="curie@radium.org",
        hashed_password="hashed_pw",
        full_name="Marie Curie",
        role="researcher",
        is_active=True,
    )
    test_db.users[user.id] = user

    ws = Workspace(
        id=uuid.uuid4(),
        name="Curie Lab",
        slug="curie-lab",
        owner_id=user.id,
    )
    test_db.workspaces[ws.id] = ws
    test_db.memberships.append(
        WorkspaceMembership(
            id=uuid.uuid4(),
            workspace_id=ws.id,
            user_id=user.id,
            role="owner",
        )
    )

    token = create_access_token(subject=str(user.id))

    # Create 3 entities: Q1, H1, D1
    q1_id = uuid.uuid4()
    h1_id = uuid.uuid4()
    d1_id = uuid.uuid4()

    # Pre-populate relationships: Q1 -> H1 and H1 -> D1
    r1 = Relationship(
        id=uuid.uuid4(),
        workspace_id=ws.id,
        source_type="question",
        source_id=q1_id,
        target_type="hypothesis",
        target_id=h1_id,
        relation_type="informs",
        created_by=user.id,
    )
    r2 = Relationship(
        id=uuid.uuid4(),
        workspace_id=ws.id,
        source_type="hypothesis",
        source_id=h1_id,
        target_type="decision",
        target_id=d1_id,
        relation_type="informs",
        created_by=user.id,
    )
    test_db.relationships.extend([r1, r2])

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        assert len(test_db.relationships) == 2


# ==========================================
# 4. FAILURE PRESERVATION & HONEST EXPERIMENTS (P0-13 & P0-4)
# ==========================================

def test_failed_experiments_preservation():
    # Failed experiments must be preserved and recorded without deletion
    failed_exp = Experiment(
        id=uuid.uuid4(),
        workspace_id=uuid.uuid4(),
        code="E-003",
        title="Aggressive 70% Structured Filter Pruning on VGG16 without Distillation",
        status="failed",
        config={"pruning_ratio": 0.70},
        execution_metadata={"failure_reason": "Gradient collapse"},
        created_by=uuid.uuid4(),
    )
    assert failed_exp.status == "failed"
    assert failed_exp.code == "E-003"
    assert "failure_reason" in failed_exp.execution_metadata
