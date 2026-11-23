import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export function Navbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const totalItems = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.cantidad, 0),
  );
  const navigate = useNavigate();

  const isAdmin = usuario?.role === 'admin';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <NavLink
            to="/"
            className="text-xl font-extrabold text-indigo-700 tracking-tight mr-3"
          >
            Food Store
          </NavLink>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Catálogo
            </NavLink>
            <NavLink to="/carrito" className={linkClass}>
              Carrito
              {totalItems > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-slate-900">
                  {totalItems}
                </span>
              )}
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={linkClass}>
                Mis pedidos
              </NavLink>
            )}
            {isAdmin && (
              <>
                <span className="mx-1 text-slate-300">|</span>
                <NavLink to="/admin/resumen" className={linkClass}>
                  Resumen
                </NavLink>
                <NavLink to="/admin/categorias" className={linkClass}>
                  Categorías
                </NavLink>
                <NavLink to="/admin/productos" className={linkClass}>
                  Productos
                </NavLink>
                <NavLink to="/admin/pedidos" className={linkClass}>
                  Pedidos
                </NavLink>
                <NavLink to="/admin/usuarios" className={linkClass}>
                  Usuarios
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {usuario.full_name}
                </p>
                <p className="text-xs text-indigo-600 font-medium uppercase">
                  {usuario.role}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className={linkClass}>
                Iniciar sesión
              </NavLink>
              <NavLink
                to="/register"
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Registrarse
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}