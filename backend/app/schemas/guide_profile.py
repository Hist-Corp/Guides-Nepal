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


class GuideProfileDocDeleteResponse(BaseModel):
    status: str = "ok"
