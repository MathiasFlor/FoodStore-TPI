from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int):
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all_active()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(categoria_id)
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        nombre_clean = data.nombre.strip()
        with self.uow as uow:
            if uow.categorias.get_by_nombre(nombre_clean):
                raise NombreDuplicado(nombre_clean)
            nueva = Categoria(
                nombre=nombre_clean,
                descripcion=data.descripcion.strip(),
                activo=True,
            )
            creada = uow.categorias.add(nueva)
            return CategoriaRead.model_validate(creada)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(categoria_id)

            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] is not None:
                nuevo_nombre = cambios["nombre"].strip()
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente and existente.id != categoria.id:
                    raise NombreDuplicado(nuevo_nombre)
                categoria.nombre = nuevo_nombre

            if "descripcion" in cambios and cambios["descripcion"] is not None:
                categoria.descripcion = cambios["descripcion"].strip()

            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)