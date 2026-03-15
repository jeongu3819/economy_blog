"""
FastAPI 메인 애플리케이션
기존 server/server.js 의 Python/FastAPI 포팅
"""

import asyncio
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from app.api.routes.stock import router as stock_router
from app.core.logger import log_manager
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행"""
    print("")
    print("--------------------------------------------------")
    print("        StockBlog AI Server is Running!          ")
    print("--------------------------------------------------")
    print(f"   Local:     http://localhost:{settings.BACKEND_PORT}                ")
    print("   API Docs:  /docs                               ")
    print("--------------------------------------------------")
    print("")
    yield


app = FastAPI(
    title="StockBlog AI",
    description="주식 분석 & 자동 블로깅 플랫폼 — Backend API",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS: 프론트엔드에서 접근 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 라우트 등록 ──
app.include_router(stock_router)


# ── Health Check ──
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
    }


# ── SSE 로그 스트림 ──
@app.get("/api/logs")
async def log_stream():
    """실시간 로그 SSE 스트림"""
    queue = log_manager.add_client()

    async def event_generator():
        try:
            import json

            # 초기 연결 메시지
            data = json.dumps(
                {"message": "로그 스트림 연결됨", "type": "system"},
                ensure_ascii=False,
            )
            yield f"data: {data}\n\n"

            while True:
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=30)
                    yield msg
                except asyncio.TimeoutError:
                    # keepalive
                    yield ": keepalive\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            log_manager.remove_client(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    )
