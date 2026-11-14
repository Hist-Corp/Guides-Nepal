"""Host-managed guides: creation (mirrors BecomeGuidePage) + experience assignment."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.host import current_host
from app.core.database import get_db
from app.models.user import User
from app.schemas.host_guide import (
    HostExperienceGuideAssign,
    HostExperienceGuideResponse,
    HostGuideCreate,
    HostGuideResponse,
)
from app.services.host_guide_service import HostGuideService

router = APIRouter(prefix="/host/guides", tags=["host-guides"])


@router.get("", response_model=list[HostGuideResponse])
def list_guides(db: Session = Depends(get_db), host: User = Depends(current_host)):
    return HostGuideService(db).list_guides(int(host.id))


@router.post("", response_model=HostGuideResponse, status_code=status.HTTP_201_CREATED)
def create_guide(payload: HostGuideCreate, db: Session = Depends(get_db), host: User = Depends(current_host)):
    return HostGuideService(db).create_guide(host, payload)


@router.post("/{host_guide_id}/suspend", response_model=HostGuideResponse)
def suspend_guide(host_guide_id: int, db: Session = Depends(get_db), host: User = Depends(current_host)):
    return HostGuideService(db).suspend_guide(int(host.id), host_guide_id)


@router.post("/{host_guide_id}/reactivate", response_model=HostGuideResponse)
def reactivate_guide(host_guide_id: int, db: Session = Depends(get_db), host: User = Depends(current_host)):
    return HostGuideService(db).reactivate_guide(int(host.id), host_guide_id)


@router.get("/experiences/{experience_id}/guides")
def list_experience_guides(experience_id: int, db: Session = Depends(get_db), host: User = Depends(current_host)):
    return HostGuideService(db).list_experience_guides(int(host.id), experience_id)


@router.post("/experiences/{experience_id}/guides", response_model=HostExperienceGuideResponse, status_code=status.HTTP_201_CREATED)
def assign_experience_guide(
    experience_id: int,
    payload: HostExperienceGuideAssign,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    return HostGuideService(db).assign_guide(int(host.id), experience_id, payload)


@router.delete("/experiences/{experience_id}/guides/{guide_id}")
def unassign_experience_guide(
    experience_id: int,
    guide_id: int,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    return HostGuideService(db).unassign_guide(int(host.id), experience_id, guide_id)
