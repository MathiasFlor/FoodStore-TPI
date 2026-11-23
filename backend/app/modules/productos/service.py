from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"Producto {producto_id} no encontrado")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in productos],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(data.categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada(data.categoria_id)

            nuevo = Producto(
                nombre=data.nombre.strip(),
                descripcion=data.descripcion.strip(),
                precio_base=data.precio_base,
                imagen_url=data.imagen_url.strip(),
                stock=data.stock,
                disponible=data.disponible,
                categoria_id=data.categoria_id,
                activo=True,
            )
            creado = uow.productos.add(nuevo)
            return ProductoRead.model_validate(creado)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)

            cambios = data.model_dump(exclude_unset=True)
            if "categoria_id" in cambios and cambios["categoria_id"] is not None:
                cat = uow.categorias.get_active_by_id(cambios["categoria_id"])
                if cat is None:
                    raise CategoriaNoEncontrada(cambios["categoria_id"])
                producto.categoria_id = cambios["categoria_id"]

            if "nombre" in cambios and cambios["nombre"] is not None:
                producto.nombre = cambios["nombre"].strip()
            if "descripcion" in cambios and cambios["descripcion"] is not None:
                producto.descripcion = cambios["descripcion"].strip()
            if "precio_base" in cambios and cambios["precio_base"] is not None:
                producto.precio_base = cambios["precio_base"]
            if "imagen_url" in cambios and cambios["imagen_url"] is not None:
                producto.imagen_url = cambios["imagen_url"].strip()
            if "stock" in cambios and cambios["stock"] is not None:
                producto.stock = cambios["stock"]
            if "disponible" in cambios and cambios["disponible"] is not None:
                producto.disponible = cambios["disponible"]

            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)
            producto.activo = False
            uow.productos.add(producto)