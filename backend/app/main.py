from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
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
from app.api.v1.synthesis import router as synthesis_router
from app.api.v1.seed import router as seed_router


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
    )

    # CORS configuration
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Standardized Global Error Handlers (P0-15)
    @application.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        detail_msg = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        code_str = "HTTP_ERROR"
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            code_str = "UNAUTHORIZED"
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
    application.include_router(workspaces_router, prefix=settings.API_V1_STR)
    application.include_router(projects_router, prefix=settings.API_V1_STR)
    application.include_router(questions_router, prefix=settings.API_V1_STR)
    application.include_router(papers_router, prefix=settings.API_V1_STR)
    application.include_router(gaps_router, prefix=settings.API_V1_STR)
    application.include_router(hypotheses_router, prefix=settings.API_V1_STR)
    application.include_router(experiments_router, prefix=settings.API_V1_STR)
    application.include_router(results_router, prefix=settings.API_V1_STR)
    application.include_router(claims_router, prefix=settings.API_V1_STR)
    application.include_router(decisions_router, prefix=settings.API_V1_STR)
    application.include_router(graph_router, prefix=settings.API_V1_STR)
    application.include_router(relationships_router, prefix=settings.API_V1_STR)
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

    return application


app = create_application()
