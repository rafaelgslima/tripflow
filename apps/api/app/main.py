from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.exceptions import TripFlowError
from app.routers import itinerary_items_router, travel_plan_shares_router, travel_plans_router
from app.schemas.common import ErrorEnvelope


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="TripFlow API",
        version="1.0.0",
        description="Backend API for collaborative travel planning.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.api_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(TripFlowError)
    async def handle_tripflow_error(_: Request, exc: TripFlowError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorEnvelope(
                code=exc.error_code,
                message=exc.message,
            ).model_dump(),
        )

    @app.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(travel_plans_router)
    app.include_router(travel_plan_shares_router)
    app.include_router(itinerary_items_router)

    return app


app = create_app()
