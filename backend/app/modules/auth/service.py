from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        username_clean = data.username.strip()
        email_clean = data.email.lower().strip()

        with self.uow as uow:
            if uow.usuarios.get_by_username(username_clean):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya está registrado",
                )
            if uow.usuarios.get_by_email(email_clean):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya está registrado",
                )

            nuevo = Usuario(
                username=username_clean,
                full_name=data.full_name.strip(),
                email=email_clean,
                hashed_password=hash_password(data.password),
                role="user",
                disabled=False,
            )
            creado = uow.usuarios.add(nuevo)
            return UserPublic.model_validate(creado)

    def authenticate(self, username: str, password: str) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            if not usuario or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                )
            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )
            return UserPublic.model_validate(usuario)