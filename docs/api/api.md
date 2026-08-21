# ResearchOS REST API Specification (v1)

Base URL: `/api/v1`

## 1. Authentication & Workspaces
- `POST /api/v1/auth/register` - Create user account
- `POST /api/v1/auth/login` - Obtain JWT access + refresh token
- `POST /api/v1/auth/refresh` - Rotate refresh token & issue new access token
- `GET  /api/v1/auth/me` - Current authenticated user profile
- `GET  /api/v1/workspaces` - List user workspaces
- `POST /api/v1/workspaces` - Create new workspace
- `GET  /api/v1/workspaces/{id}/members` - List workspace members
- `POST /api/v1/workspaces/{id}/members` - Invite member with role ('owner' | 'researcher' | 'reviewer')

## 2. Research Entities (Workspace Scoped)
All endpoints require `X-Workspace-Id` header or query context and bearer token.

- **Questions**:
  - `GET  /api/v1/questions` - List questions (filter by status, search)
  - `POST /api/v1/questions` - Create question
  - `GET  /api/v1/questions/{id}` - Question details & linked graph context
  - `PUT  /api/v1/questions/{id}` - Update question
- **Papers**:
  - `GET  /api/v1/papers`
  - `POST /api/v1/papers`
  - `GET  /api/v1/papers/{id}`
  - `PUT  /api/v1/papers/{id}`
- **Gaps**:
  - `GET  /api/v1/gaps`
  - `POST /api/v1/gaps`
  - `GET  /api/v1/gaps/{id}`
  - `PUT  /api/v1/gaps/{id}`
- **Hypotheses**:
  - `GET  /api/v1/hypotheses`
  - `POST /api/v1/hypotheses`
  - `GET  /api/v1/hypotheses/{id}`
  - `PUT  /api/v1/hypotheses/{id}`
- **Experiments**:
  - `GET  /api/v1/experiments`
  - `POST /api/v1/experiments`
  - `GET  /api/v1/experiments/{id}`
  - `PUT  /api/v1/experiments/{id}`
- **Results**:
  - `GET  /api/v1/results`
  - `POST /api/v1/results`
  - `GET  /api/v1/results/{id}`
  - `PUT  /api/v1/results/{id}`
- **Decisions**:
  - `GET  /api/v1/decisions`
  - `POST /api/v1/decisions`
  - `GET  /api/v1/decisions/{id}`
  - `PUT  /api/v1/decisions/{id}`

## 3. Relationships & Graph Traversal
- `POST /api/v1/relationships` - Link two entities (`source_type`, `source_id`, `target_type`, `target_id`, `relation_type`)
- `DELETE /api/v1/relationships/{id}` - Remove link
- `GET  /api/v1/research-graph` - Full or filtered workspace graph (nodes + edges formatted for visual canvas)
- `GET  /api/v1/decisions/{id}/evidence-chain` - Complete recursive upstream reasoning chain from decision back to origin research questions and papers.

## 4. Search
- `GET  /api/v1/search?q={query}&types={types}` - Full-text and metadata search across all workspace entities.
