from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    data: UserCreate,
    service: AuthService = Depends(get_auth_service),
):
    return service.register(data)


@router.post("/token", response_model=MessageResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    usuario = service.authenticate(form_data.username, form_data.password)
    access_token = create_access_token(data={"sub": usuario.username})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/", samesite="lax")
    return MessageResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: Usuario = Depends(get_current_active_user)):
    return UserPublic.model_validate(current_user)