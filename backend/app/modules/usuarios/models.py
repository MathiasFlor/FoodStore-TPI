from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    full_name: str = Field(max_length=150)
    email: str = Field(unique=True, index=True, max_length=150)
    hashed_password: str = Field(max_length=255)
    role: str = Field(default="user", max_length=20)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")