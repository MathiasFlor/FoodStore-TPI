from datetime import datetime, timezone
from sqlalchemy import func
from sqlmodel import Session, col, desc, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        self.session.refresh(detalle)
        return detalle

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        conditions = []
        if usuario_id is not None:
            conditions.append(Pedido.usuario_id == usuario_id)
        if estado:
            conditions.append(Pedido.estado == estado)

        count_stmt = select(func.count(col(Pedido.id))).where(*conditions)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Pedido)
            .where(*conditions)
            .order_by(desc(col(Pedido.created_at)), desc(col(Pedido.id)))
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        stmt = select(Pedido.estado, func.count(col(Pedido.id))).group_by(Pedido.estado)
        rows = self.session.exec(stmt).all()
        conteos = {
            "PENDIENTE": 0,
            "EN_PREPARACION": 0,
            "ENTREGADO": 0,
            "CANCELADO": 0,
        }
        for estado, cantidad in rows:
            conteos[str(estado)] = int(cantidad)
        return conteos

    def count_hoy(self) -> int:
        inicio_hoy = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        stmt = select(func.count(col(Pedido.id))).where(
            col(Pedido.created_at) >= inicio_hoy
        )
        return int(self.session.exec(stmt).one())

    def sum_ingresos_entregados(self) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
            Pedido.estado == "ENTREGADO"
        )
        return round(float(self.session.exec(stmt).one()), 2)