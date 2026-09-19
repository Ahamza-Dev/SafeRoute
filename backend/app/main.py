from fastapi import FastAPI

app = FastAPI(
    title="SafeRoute API",
    description="Backend API for the SafeRoute disaster risk intelligence platform.",
    version="0.1.0",
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "SafeRoute backend",
    }
