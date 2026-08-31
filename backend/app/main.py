import logging
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.database import async_session_factory
from app.api.v1.auth import router as auth_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.research_questions_and_papers import (
    questions_router,
    papers_router,
)
from app.api.v1.gap_and_hypothesis import (
    gaps_router,
    hypotheses_router,
)
from app.api.v1.experiments_and_claims import (
    experiments_router,
    results_router,
    claims_router,
)
from app.api.v1.decisions import router as decisions_router
from app.api.v1.graph import router as graph_router
from app.api.v1.relationships import router as relationships_router
from app.api.v1.projects import router as projects_router
from app.api.v1.domains import router as domains_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.models import router as models_router
from app.api.v1.search import router as search_router
from app.api.v1.timeline import router as timeline_router
from app.api.v1.synthesis import router as synthesis_router
from app.api.v1.seed import router as seed_router

# Setup server-side logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
)
logger = logging.getLogger("app.middleware.auth")


def get_sanitized_headers(request: Request) -> dict[str, str]:
    """Helper to inspect all request headers while safely displaying token structures."""
    headers_dict = dict(request.headers)
    sanitized = {}
    for key, val in headers_dict.items():
        if key.lower() == "authorization":
            if val.startswith("Bearer "):
                token_body = val[7:]
                if len(token_body) > 12:
                    sanitized[key] = f"Bearer {token_body[:6]}...{token_body[-4:]} (len={len(token_body)})"
                else:
                    sanitized[key] = f"Bearer {token_body} (len={len(token_body)})"
            else:
                sanitized[key] = f"{val[:10]}... (len={len(val)}, non-bearer format)"
        elif key.lower() == "cookie":
            sanitized[key] = f"[Cookies present, len={len(val)}]"
        else:
            sanitized[key] = val
    return sanitized


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
    )

    # Middleware: Log headers on any 401 Unauthorized response
    @application.middleware("http")
    async def auth_debug_logging_middleware(request: Request, call_next):
        response = await call_next(request)
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            raw_headers = dict(request.headers)
            sanitized = get_sanitized_headers(request)
            auth_header_raw = raw_headers.get("authorization") or raw_headers.get("Authorization")
            has_auth = auth_header_raw is not None
            
            logger.warning(
                "===============================================================\n"
                "[AUTH MIDDLEWARE: 401 UNAUTHORIZED TRIGGERED]\n"
                "  -> Method & Path: %s %s\n"
                "  -> Client IP: %s\n"
                "  -> Has Authorization Header: %s\n"
                "  -> Raw Authorization Value: %s\n"
                "  -> All Received Header Keys: %s\n"
                "  -> Detailed Received Headers: %s\n"
                "===============================================================",
                request.method,
                request.url.path,
                request.client.host if request.client else "unknown",
                has_auth,
                sanitized.get("authorization") or sanitized.get("Authorization") or "<NONE>",
                list(raw_headers.keys()),
                sanitized,
            )
        return response

    # CORS configuration
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=[
            "Authorization",
            "X-Workspace-Id",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "*",
        ],
    )

    # Standardized Global Error Handlers (P0-15)
    @application.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        detail_msg = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        code_str = "HTTP_ERROR"
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            code_str = "UNAUTHORIZED"
            sanitized_hdrs = get_sanitized_headers(request)
            logger.warning(
                "[HTTP_EXCEPTION: 401 UNAUTHORIZED]\n"
                "  -> Path: %s %s\n"
                "  -> Reason: %s\n"
                "  -> Request Headers: %s",
                request.method,
                request.url.path,
                detail_msg,
                sanitized_hdrs,
            )
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            code_str = "FORBIDDEN"
        elif exc.status_code == status.HTTP_404_NOT_FOUND:
            code_str = "NOT_FOUND"
        elif exc.status_code == status.HTTP_409_CONFLICT:
            code_str = "CONFLICT"
        elif exc.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY:
            code_str = "UNPROCESSABLE_ENTITY"

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": code_str,
                    "message": detail_msg,
                }
            },
            headers=exc.headers,
        )

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        first_msg = errors[0].get("msg", "Validation error") if errors else "Invalid request format."
        field = ".".join(str(loc) for loc in errors[0].get("loc", [])) if errors else "body"
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": f"{field}: {first_msg}",
                    "details": errors,
                }
            },
        )

    @application.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected server error occurred. Please try again later.",
                }
            },
        )

    # Mount v1 routers
    application.include_router(auth_router, prefix=settings.API_V1_STR)
    application.include_router(auth_router, prefix="/api")
    application.include_router(auth_router)
    application.include_router(workspaces_router, prefix=settings.API_V1_STR)
    application.include_router(workspaces_router, prefix="/api")
    application.include_router(domains_router, prefix=settings.API_V1_STR)
    application.include_router(domains_router, prefix="/api")
    application.include_router(projects_router, prefix=settings.API_V1_STR)
    application.include_router(projects_router, prefix="/api")
    application.include_router(questions_router, prefix=settings.API_V1_STR)
    application.include_router(papers_router, prefix=settings.API_V1_STR)
    application.include_router(evidence_router, prefix=settings.API_V1_STR)
    application.include_router(datasets_router, prefix=settings.API_V1_STR)
    application.include_router(models_router, prefix=settings.API_V1_STR)
    application.include_router(gaps_router, prefix=settings.API_V1_STR)
    application.include_router(hypotheses_router, prefix=settings.API_V1_STR)
    application.include_router(experiments_router, prefix=settings.API_V1_STR)
    application.include_router(results_router, prefix=settings.API_V1_STR)
    application.include_router(claims_router, prefix=settings.API_V1_STR)
    application.include_router(decisions_router, prefix=settings.API_V1_STR)
    application.include_router(graph_router, prefix=settings.API_V1_STR)
    application.include_router(relationships_router, prefix=settings.API_V1_STR)
    application.include_router(search_router, prefix=settings.API_V1_STR)
    application.include_router(timeline_router, prefix=settings.API_V1_STR)
    application.include_router(synthesis_router, prefix=settings.API_V1_STR)
    application.include_router(seed_router, prefix=settings.API_V1_STR)

    # Health & Readiness Endpoints (P0-16)
    @application.get("/health", tags=["Health"])
    async def health_check():
        """Process liveness probe."""
        return {"status": "healthy", "service": settings.PROJECT_NAME}

    @application.get("/ready", tags=["Health"])
    async def readiness_check():
        """Readiness probe: validates database connectivity."""
        try:
            async with async_session_factory() as session:
                await session.execute(text("SELECT 1"))
            return {"status": "ready", "database": "connected"}
        except Exception as err:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"status": "not_ready", "error": "Database connection failed"},
            )

    # OAuth popup HTML callback handler
    async def oauth_popup_callback_page(request: Request):
        """Returns minimal HTML script that communicates auth code or status to parent opener and closes."""
        return HTMLResponse(
            content="""<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ResearchOS &bull; Authentication Complete</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0f172a;
        color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 24px;
        box-sizing: border-box;
      }
      .card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 32px 24px;
        text-align: center;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      }
      .spinner {
        display: inline-block;
        width: 36px;
        height: 36px;
        border: 3px solid rgba(99, 102, 241, 0.2);
        border-radius: 50%;
        border-top-color: #6366f1;
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 16px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      h2 { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #ffffff; }
      p { margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <h2>Authentication Completed</h2>
      <p>Synchronizing your research credentials with ResearchOS. This window will close automatically.</p>
    </div>
    <script>
      (function() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const error_description = params.get('error_description');
        const state = params.get('state');

        if (window.opener) {
          window.opener.postMessage({
            type: 'OAUTH_AUTH_SUCCESS',
            code: code,
            error: error,
            error_description: error_description,
            state: state
          }, '*');
          setTimeout(() => {
            try { window.close(); } catch (e) {}
          }, 800);
        } else {
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      })();
    </script>
  </body>
</html>"""
        )

    # Register the OAuth callback handler on multiple paths
    paths = ["/auth/callback", "/auth/callback/", "/api/auth/callback", "/api/v1/auth/callback"]
    for path in paths:
        application.add_api_route(path, oauth_popup_callback_page, methods=["GET"], response_class=HTMLResponse, tags=["Authentication"])

    return application


app = create_application()
