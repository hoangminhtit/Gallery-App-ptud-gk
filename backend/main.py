"""
Gallery App API - Main Application
Organized with modular structure for scalability
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from database import engine, Base
from config import ALLOWED_ORIGINS, ALLOWED_ORIGIN_REGEX, UPLOAD_FOLDER
from routers import auth, photos, users, admin

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Gallery App API",
    description="A simple photo gallery application",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(photos.router)
app.include_router(users.router)
app.include_router(admin.router)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")


# Root endpoint
@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to Gallery App API",
        "docs": "/docs",
    }


# Health check
@app.get("/health", tags=["Root"])
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host='localhost', port=8001, reload=True)

