from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
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

    # Mount v1 routers
    application.include_router(auth_router, prefix=settings.API_V1_STR)
    application.include_router(workspaces_router, prefix=settings.API_V1_STR)
    application.include_router(questions_router, prefix=settings.API_V1_STR)
    application.include_router(papers_router, prefix=settings.API_V1_STR)
    application.include_router(gaps_router, prefix=settings.API_V1_STR)
    application.include_router(hypotheses_router, prefix=settings.API_V1_STR)
    application.include_router(experiments_router, prefix=settings.API_V1_STR)
    application.include_router(results_router, prefix=settings.API_V1_STR)
    application.include_router(claims_router, prefix=settings.API_V1_STR)

    @application.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "service": settings.PROJECT_NAME}

    return application


app = create_application()

