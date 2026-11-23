from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables

# Registrar los 5 modelos del UML en SQLModel
from app.modules.usuarios.models import Usuario  # noqa: F401
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401

from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API - TPI Programación 4",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(auth_router)
api_v1.include_router(usuarios_router)
api_v1.include_router(categorias_router)
api_v1.include_router(productos_router)
api_v1.include_router(pedidos_router)

app.include_router(api_v1)


@app.get("/health")
def health():
    return {"status": "ok"}