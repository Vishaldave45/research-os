# Database ER Model & Domain Specification

## Core Tables & Fields

### 1. `users`
- `id` (UUID, PK)
- `email` (VARCHAR(255), UNIQUE, NOT NULL, INDEXED)
- `hashed_password` (VARCHAR(255), NOT NULL)
- `full_name` (VARCHAR(255), NOT NULL)
- `role` (VARCHAR(50), DEFAULT 'researcher')
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 2. `workspaces`
- `id` (UUID, PK)
- `name` (VARCHAR(255), NOT NULL)
- `slug` (VARCHAR(255), UNIQUE, NOT NULL, INDEXED)
- `description` (TEXT)
- `owner_id` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 3. `workspace_memberships`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `user_id` (UUID, FK -> users.id, NOT NULL, INDEXED)
- `role` (VARCHAR(50), NOT NULL: 'owner' | 'researcher' | 'reviewer')
- `created_at` (TIMESTAMPTZ, NOT NULL)
- UNIQUE CONSTRAINT (`workspace_id`, `user_id`)

### 4. `research_questions`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `code` (VARCHAR(32), NOT NULL) -- e.g. "Q-001"
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `status` (VARCHAR(50), DEFAULT 'open')
- `metadata` (JSONB, DEFAULT '{}')
- `created_by` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 5. `papers`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `code` (VARCHAR(32), NOT NULL) -- e.g. "P-001"
- `title` (TEXT, NOT NULL)
- `authors` (TEXT[])
- `year` (INTEGER)
- `venue` (VARCHAR(255))
- `doi` (VARCHAR(255))
- `url` (TEXT)
- `abstract` (TEXT)
- `notes` (TEXT)
- `metadata` (JSONB, DEFAULT '{}')
- `created_by` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 6. `gaps`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `code` (VARCHAR(32), NOT NULL) -- e.g. "G-001"
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `impact_level` (VARCHAR(50), DEFAULT 'high')
- `status` (VARCHAR(50), DEFAULT 'open')
- `metadata` (JSONB, DEFAULT '{}')
- `created_by` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 7. `hypotheses`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `code` (VARCHAR(32), NOT NULL) -- e.g. "H-001"
- `statement` (TEXT, NOT NULL)
- `rationale` (TEXT)
- `expected_outcome` (TEXT)
- `status` (VARCHAR(50), DEFAULT 'draft') -- 'draft' | 'testing' | 'supported' | 'refuted' | 'abandoned'
- `metadata` (JSONB, DEFAULT '{}')
- `created_by` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 8. `experiments`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `code` (VARCHAR(32), NOT NULL) -- e.g. "E-001"
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `status` (VARCHAR(50), DEFAULT 'planned') -- 'planned' | 'running' | 'completed' | 'failed' | 'aborted'
- `config` (JSONB, DEFAULT '{}') -- hyperparameters, architecture, seed, dataset
- `execution_metadata` (JSONB, DEFAULT '{}') -- platform, run_id, duration
- `created_by` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 9. `results`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `code` (VARCHAR(32), NOT NULL) -- e.g. "R-001"
- `title` (TEXT, NOT NULL)
- `summary` (TEXT, NOT NULL)
- `metrics` (JSONB, NOT NULL, DEFAULT '{}') -- e.g. {"accuracy": 0.942, "flops_reduction": "42%"}
- `artifacts` (JSONB, DEFAULT '[]') -- URLs, Drive references
- `status` (VARCHAR(50), DEFAULT 'valid') -- 'valid' | 'inconclusive' | 'invalid'
- `created_by` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 10. `decisions`
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `code` (VARCHAR(32), NOT NULL) -- e.g. "D-001"
- `title` (TEXT, NOT NULL)
- `outcome` (VARCHAR(50), NOT NULL) -- 'accepted' | 'rejected' | 'pivoted' | 'deferred'
- `rationale` (TEXT, NOT NULL)
- `implications` (TEXT)
- `created_by` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 11. `relationships` (The Connective Graph Core)
- `id` (UUID, PK)
- `workspace_id` (UUID, FK -> workspaces.id, NOT NULL, INDEXED)
- `source_type` (VARCHAR(50), NOT NULL) -- 'question' | 'paper' | 'gap' | 'hypothesis' | 'experiment' | 'result' | 'decision'
- `source_id` (UUID, NOT NULL)
- `target_type` (VARCHAR(50), NOT NULL)
- `target_id` (UUID, NOT NULL)
- `relation_type` (VARCHAR(50), NOT NULL) -- 'supports' | 'tests' | 'derived_from' | 'informs' | 'cited_by' | 'produces' | 'motivates' | 'contradicts' | 'depends_on'
- `metadata` (JSONB, DEFAULT '{}')
- `created_by` (UUID, FK -> users.id, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- INDEX on (`workspace_id`, `source_type`, `source_id`)
- INDEX on (`workspace_id`, `target_type`, `target_id`)
- INDEX on (`workspace_id`, `relation_type`)
