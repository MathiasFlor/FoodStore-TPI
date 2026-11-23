from sqlalchemy import func
from sqlmodel import Session, col, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_active_by_id(self, producto_id: int) -> Producto | None:
        prod = self.get_by_id(producto_id)
        if prod is None or not prod.activo:
            return None
        return prod

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        conditions = [Producto.activo == True]  # noqa: E712

        if search and search.strip():
            conditions.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            conditions.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            conditions.append(Producto.disponible == disponible)

        count_stmt = select(func.count(col(Producto.id))).where(*conditions)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Producto)
            .where(*conditions)
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items