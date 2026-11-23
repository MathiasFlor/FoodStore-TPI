from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacionNoPermitida,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    assert admin.id is not None
    try:
        return service.desactivar(usuario_id, admin.id)
    except AutoDesactivacionNoPermitida as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))