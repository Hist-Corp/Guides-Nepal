from pydantic import BaseModel, Field
from typing import List


class GuideProfileDoc(BaseModel):
    id: int
    label: str
    doc_type: str
    stored_name: str
    content_type: str
    uploaded_at: str

    class Config:
        from_attributes = True


class GuideProfileDocsResponse(BaseModel):
    profile_documents: List[GuideProfileDoc] = []
    # Free text the guide wrote about the support they offer during a trip.
    trip_support: str = ""


class GuideProfileDocDeleteResponse(BaseModel):
    status: str = "ok"


class GuideTripSupportUpdate(BaseModel):
    trip_support: str = Field(default="", max_length=1000)


class GuideTripSupportResponse(BaseModel):
    trip_support: str = ""
