from sqlmodel import select
from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401


def seed() -> None:
    create_all_tables()

    with session_factory() as session:
        # 1. Usuario administrador obligatorio del enunciado
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()
        if admin is None:
            session.add(
                Usuario(
                    username="admin",
                    full_name="Administrador Food Store",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                    disabled=False,
                )
            )

        # 2. Categorías (al menos 3)
        categorias_data = [
            ("Pizzas", "Pizzas artesanales a la piedra y al molde"),
            ("Hamburguesas", "Medallones caseros con papas fritas"),
            ("Empanadas", "Al horno de barro y fritas"),
            ("Bebidas", "Gaseosas, aguas y cervezas bien frías"),
        ]
        categorias_map: dict[str, Categoria] = {}
        for nombre, desc in categorias_data:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=desc, activo=True)
                session.add(cat)
                session.flush()
            categorias_map[nombre] = cat

        # 3. Productos con stock (al menos 8)
        productos_data = [
            (
                "Pizzas",
                "Pizza Muzzarella",
                "Salsa de tomate casera, muzzarella, orégano y aceitunas verdes",
                8500.0,
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                15,
            ),
            (
                "Pizzas",
                "Pizza Napolitana",
                "Muzzarella, rodajas de tomate fresco, ajo y albahaca",
                9400.0,
                "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600",
                12,
            ),
            (
                "Pizzas",
                "Pizza Fugazzeta",
                "Doble muzzarella y cebolla caramelizada al orégano",
                9800.0,
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
                10,
            ),
            (
                "Hamburguesas",
                "Hamburguesa Clásica",
                "Medallón de 180g, cheddar, lechuga, tomate y salsa especial",
                7900.0,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                20,
            ),
            (
                "Hamburguesas",
                "Hamburguesa Doble Bacon",
                "Doble carne, doble cheddar, panceta crocante y barbacoa",
                10200.0,
                "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600",
                14,
            ),
            (
                "Empanadas",
                "Empanada de Carne Suave",
                "Carne picada a cuchillo, huevo duro y aceitunas",
                1300.0,
                "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
                40,
            ),
            (
                "Empanadas",
                "Empanada de Jamón y Queso",
                "Jamón cocido natural y queso muzzarella fundido",
                1250.0,
                "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600",
                35,
            ),
            (
                "Bebidas",
                "Gaseosa Cola 1.5L",
                "Botella familiar bien fría",
                3400.0,
                "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600",
                30,
            ),
            (
                "Bebidas",
                "Agua Mineral 500ml",
                "Agua sin gas refrigerada",
                1500.0,
                "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600",
                25,
            ),
        ]

        for cat_nombre, nombre, desc, precio, img, stock in productos_data:
            cat = categorias_map[cat_nombre]
            assert cat.id is not None
            existente = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()
            if existente is None:
                session.add(
                    Producto(
                        categoria_id=cat.id,
                        nombre=nombre,
                        descripcion=desc,
                        precio_base=precio,
                        imagen_url=img,
                        stock=stock,
                        disponible=True,
                        activo=True,
                    )
                )

        session.commit()
        print("Seed ejecutado correctamente.")
        print("Admin: admin / Admin1234!")


if __name__ == "__main__":
    seed()