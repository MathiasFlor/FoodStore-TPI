from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int):
        super().__init__(f"Usuario {usuario_id} no encontrado")


class AutoDesactivacionNoPermitida(Exception):
    def __init__(self) -> None:
        super().__init__("No podés desactivar tu propia cuenta")


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all_ordered()
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(usuario_id)
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise AutoDesactivacionNoPermitida()
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(usuario_id)
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)