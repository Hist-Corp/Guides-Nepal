from pydantic import BaseModel
from typing import List, Literal, Optional


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = None
    temperature: Optional[float] = 0.7


class ChatResponse(BaseModel):
    reply: str
