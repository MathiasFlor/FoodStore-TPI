from typing import Callable
from fastapi import Depends, HTTPException, Request, status
from sqlmodel import select
from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(request: Request) -> Usuario:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )

    payload = decode_access_token(token)
    username = payload.get("sub")
    if not isinstance(username, str) or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )

    with session_factory() as session:
        usuario = session.exec(
            select(Usuario).where(Usuario.username == username)
        ).first()
        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado",
            )
        session.expunge(usuario)
        return usuario


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(roles_permitidos: list[str]) -> Callable[[Usuario], Usuario]:
    def role_checker(
        current_user: Usuario = Depends(get_current_active_user),
    ) -> Usuario:
        if current_user.role not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return current_user

    return role_checker