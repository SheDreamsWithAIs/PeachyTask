from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .utils.database import connect_to_mongo, close_mongo_connection
from .routes import auth as auth_routes
from .routes import tasks as task_routes
from .routes import labels as label_routes


app = FastAPI(title="PeachyTask API")

# CORS configuration for local development; adjust origins as needed for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Basic health check endpoint used by tests and uptime checks."""
    return {
        "status": "ok",
        "service": "peachy-task-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.on_event("startup")
async def on_startup() -> None:
    # establish database connection
    await connect_to_mongo()
    # include routers after DB is ready
    app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
    app.include_router(task_routes.router, tags=["tasks"])
    app.include_router(label_routes.router, tags=["labels"])


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await close_mongo_connection()


