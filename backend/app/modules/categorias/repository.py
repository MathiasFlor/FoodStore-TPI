from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

    def get_all_active(self) -> list[Categoria]:
        stmt = (
            select(Categoria)
            .where(Categoria.activo == True)  # noqa: E712
            .order_by(Categoria.id)
        )
        return list(self.session.exec(stmt).all())

    def get_active_by_id(self, categoria_id: int) -> Categoria | None:
        cat = self.get_by_id(categoria_id)
        if cat is None or not cat.activo:
            return None
        return cat