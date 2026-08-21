# ResearchOS Security Architecture

## Authentication & Authorization Model
1. **Password Security**: Passwords hashed using standard Passlib / bcrypt with work factor >= 12.
2. **Stateless JWT Tokens**:
   - Access Token: Short-lived (15 minutes).
   - Refresh Token: Long-lived (7 days) with strict single-use rotation and revocation tracking.
3. **Multi-Tenant Workspace Isolation**:
   - Every research query MUST filter by `workspace_id`.
   - Backend dependency `verify_workspace_membership(workspace_id, current_user)` executes on every protected route.
   - Cross-workspace data leakage is physically prevented at the repository layer.
4. **Input Validation**: All payloads validated using strict Pydantic schemas. Raw SQL queries are forbidden; all database interactions go through SQLAlchemy ORM with parameterized inputs.
5. **CORS & Headers**: Strict CORS origin limits, CSP headers, rate-limiting on authentication endpoints.
