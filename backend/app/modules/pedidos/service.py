from datetime import datetime, timezone
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

TRANSICIONES_VALIDAS: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("No tenés permiso para acceder a este pedido")


class ProductoRepetido(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, disponible: int):
        super().__init__(
            f"Stock insuficiente para '{nombre}' (disponible: {disponible})"
        )


class TransicionInvalida(Exception):
    def __init__(self, mensaje: str):
        super().__init__(mensaje)


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega.strip(),
                    notas=data.notas.strip(),
                    total=0.0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_active_by_id(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total = round(total + subtotal, 2)

            pedido.total = total
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            assert uow.session is not None
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        filtro_usuario = None if usuario.role == "admin" else usuario.id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario,
                skip=skip,
                limit=limit,
                estado=estado,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)

            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if data.estado not in permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar de {pedido.estado} a {data.estado}"
                )

            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo podés cancelar pedidos en estado PENDIENTE"
                )

            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos["PENDIENTE"],
                en_preparacion=conteos["EN_PREPARACION"],
                entregados=conteos["ENTREGADO"],
                cancelados=conteos["CANCELADO"],
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.sum_ingresos_entregados(),
            )