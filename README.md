# Food Store — Trabajo Práctico Integrador (Programación 4)

Aplicación web full stack para la gestión de pedidos de comida desarrollada con **FastAPI + SQLModel + PostgreSQL** en el backend y **React + TypeScript + Tailwind CSS + TanStack + Zustand** en el frontend.

## Enlaces de entrega

- **Repositorio GitHub:** https://github.com/MathiasFlor/FoodStore-TPI
- **Video de demostración (10 a 15 min):** https://youtu.be/QnGbFJKGpGk

## Requisitos previos

- **Python** 3.11 a 3.13
- **PostgreSQL** 15 o superior (o SQLite para desarrollo local cambiando `DATABASE_URL`)
- **Node.js** 20.19 o superior
- **pnpm** 9 o superior

## Estructura del proyecto

```text
TPI_FoodStore/
├── backend/              # API REST FastAPI + SQLModel (arquitectura en capas + Unit of Work)
│   ├── app/
│   │   ├── core/         # config, database, security, deps, unit_of_work, base_repository
│   │   ├── db/           # seed.py idempotente
│   │   ├── modules/      # auth, usuarios, categorias, productos, pedidos
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/             # SPA React + TypeScript (arquitectura por features)
│   ├── src/
│   │   ├── features/     # auth, categorias, productos, usuarios, pedidos
│   │   ├── shared/       # api, ui, components, layout
│   │   ├── store/        # authStore y cartStore (Zustand + persist)
│   │   └── routes/       # AppRouter y ProtectedRoute
│   ├── .env.example
│   └── package.json
└── README.md
```

## Variables de entorno

### Backend (`backend/.env`)

Copiar `backend/.env.example` a `backend/.env` y completar los valores:

```env
DATABASE_URL=postgresql+psycopg2://postgres:TU_PASSWORD@localhost:5432/foodstore_db
SECRET_KEY=cambiar-esta-clave-de-al-menos-32-caracteres-seguros
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

Copiar `frontend/.env.example` a `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Instalación y ejecución del Backend

1. Crear una base de datos en PostgreSQL llamada `foodstore_db`.
2. Abrir una terminal en `backend/` y ejecutar:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

*(En Linux/macOS: `source .venv/bin/activate`)*

3. Cargar los datos iniciales (usuario administrador, 4 categorías y 9 productos con stock):

```powershell
python -m app.db.seed
```

4. Levantar el servidor:

```powershell
uvicorn app.main:app --reload
```

- API disponible en: `http://localhost:8000/api/v1`
- Documentación Swagger UI: `http://localhost:8000/docs`
- Documentación ReDoc: `http://localhost:8000/redoc`

### Usuario administrador creado por el seed

- **Usuario:** `admin`
- **Contraseña:** `Admin1234!`
- **Rol:** `admin`

## Instalación y ejecución del Frontend

Abrir otra terminal en `frontend/` y ejecutar:

```powershell
pnpm install
pnpm build
pnpm dev
```

Abrir en el navegador **`http://localhost:5173`** (usar `localhost` para que el navegador acepte y adjunte la cookie `HttpOnly`).

## Funcionalidades principales

- **Autenticación y roles:** JWT en cookie `HttpOnly`, registro público (rol `user`), login OAuth2, logout y verificación de sesión con `/api/v1/auth/me`.
- **Catálogo y carrito:** Listado público paginado en servidor con búsqueda y filtro por categoría, carrito persistido con Zustand y checkout con TanStack Form.
- **Pedidos transaccionales (Unit of Work):** Descuento de stock atómico al crear el pedido, copia inmutable de nombre y precio en `DetallePedido`, máquina de 4 estados (`PENDIENTE` → `EN_PREPARACION` → `ENTREGADO` / `CANCELADO`) y restitución de stock al cancelar.
- **Panel de administración:** Resumen de indicadores, ABM de categorías y productos (TanStack Table + TanStack Form), ajuste de stock y disponibilidad, gestión de estados de pedidos y activación/desactivación de usuarios.