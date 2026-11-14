from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import AsyncIterator
from app.schemas.ai import ChatRequest, ChatResponse
from app.core.config import settings
import httpx
from datetime import datetime, timedelta, timezone

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    api_key = settings.OPENAI_API_KEY
    provider = settings.AI_PROVIDER
    ollama_url = settings.OLLAMA_URL
    last_user = next(
        (m.content for m in reversed(req.messages) if m.role == "user"), ""
    )
    if not last_user:
        raise HTTPException(status_code=400, detail="No user message provided")
    use_ollama = (provider == "ollama") or bool(ollama_url)
    if provider == "auto" and not use_ollama and not api_key:
        base_try = "http://localhost:11434"
        try:
            async with httpx.AsyncClient(timeout=2) as client:
                ping = await client.get(f"{base_try}/api/tags")
                if ping.status_code == 200:
                    ollama_url = base_try
                    use_ollama = True
        except Exception:
            ollama_url = None
    if use_ollama:
        base = ollama_url or "http://localhost:11434"
        model = req.model or settings.OLLAMA_MODEL
        payload = {
            "model": model,
            "messages": [{"role": "system", "content": settings.AI_SYSTEM_PROMPT}]
            + [m.dict() for m in req.messages],
            "stream": False,
            "options": {"temperature": req.temperature or 0.7},
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(f"{base}/api/chat", json=payload)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            data = resp.json()
            reply = (data.get("message") or {}).get("content") or ""
            if not reply:
                raise HTTPException(status_code=500, detail="Empty response from model")
            return ChatResponse(reply=reply)

    if api_key:
        model = req.model or settings.AI_MODEL
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [{"role": "system", "content": settings.AI_SYSTEM_PROMPT}]
            + [m.dict() for m in req.messages],
            "temperature": req.temperature or 0.7,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            data = resp.json()
            reply = data["choices"][0]["message"]["content"]
            return ChatResponse(reply=reply)

    q = last_user.lower()
    if any(word in q for word in ["temperature", "weather"]) and "kathmandu" in q:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params={
                        "latitude": 27.7172,
                        "longitude": 85.3240,
                        "current": "temperature_2m",
                    },
                )
                if r.status_code == 200:
                    current = r.json().get("current", {})
                    temp = current.get("temperature_2m")
                    if temp is not None:
                        return ChatResponse(reply=f"Kathmandu right now: ~{temp}°C.")
        except Exception:
            return ChatResponse(
                reply="Typical Kathmandu daytime: ~18–26°C depending on season; mornings are cooler."
            )
        return ChatResponse(
            reply="Typical Kathmandu daytime: ~18–26°C depending on season; mornings are cooler."
        )
    if "time" in q and "kathmandu" in q:
        ktm_tz = timezone(timedelta(hours=5, minutes=45))
        now_ktm = datetime.utcnow().replace(tzinfo=timezone.utc).astimezone(ktm_tz)
        return ChatResponse(
            reply=f"Kathmandu time: {now_ktm.strftime('%I:%M %p')} (UTC+5:45)."
        )
    if "food" in q or any(word in q for word in ["eat", "restaurant", "cuisine"]):
        return ChatResponse(
            reply="Maila Dai recommends Newari cuisine—bara, yomari, choila—plus momos and thukpa. Prefer street eats or sit-down places? I can tailor a mini food crawl in your area."
        )
    if "culture" in q or any(word in q for word in ["heritage", "temple", "history"]):
        return ChatResponse(
            reply="We can do a heritage walk through the old squares—Durbar areas, hidden courtyards, and temples. Do you want a relaxed stroll or a deeper history-focused tour?"
        )
    if "adventure" in q or any(word in q for word in ["hike", "trek", "paragliding"]):
        return ChatResponse(
            reply="Feeling adventurous? Short hikes around the valley, sunrise viewpoints, or day trips—what’s your vibe and fitness level? I’ll pick a route that fits."
        )
    if any(word in q for word in ["hi", "hello", "namaste", "hey"]):
        return ChatResponse(
            reply="Namaste! Tell me what you’re planning—food, culture, or a bit of adventure—and I’ll set you up with friendly local guidance."
        )
    return ChatResponse(
        reply="Got it. Tell me a bit more—where you’ll be, your interests, and timing—and I’ll suggest the best local options."
    )


@router.post("/chat/stream")
async def chat_stream(req: ChatRequest) -> StreamingResponse:
    api_key = settings.OPENAI_API_KEY
    provider = settings.AI_PROVIDER
    ollama_url = settings.OLLAMA_URL
    use_ollama = (provider == "ollama") or bool(ollama_url)
    if provider == "auto" and not use_ollama and not api_key:
        base_try = "http://localhost:11434"
        try:
            async with httpx.AsyncClient(timeout=2) as client:
                ping = await client.get(f"{base_try}/api/tags")
                if ping.status_code == 200:
                    ollama_url = base_try
                    use_ollama = True
        except Exception:
            ollama_url = None

    async def streamer() -> AsyncIterator[str]:
        try:
            if use_ollama:
                base = ollama_url or "http://localhost:11434"
                model = req.model or settings.OLLAMA_MODEL
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": settings.AI_SYSTEM_PROMPT}
                    ]
                    + [m.dict() for m in req.messages],
                    "stream": True,
                    "options": {"temperature": req.temperature or 0.7},
                }
                async with httpx.AsyncClient(timeout=60) as client:
                    async with client.stream(
                        "POST", f"{base}/api/chat", json=payload
                    ) as resp:
                        async for line in resp.aiter_lines():
                            if not line:
                                continue
                            data = None
                            try:
                                data = httpx.Response(200, text=line).json()
                            except Exception:
                                data = None
                            if not data:
                                continue
                            msg = data.get("message")
                            if msg and msg.get("content"):
                                yield msg["content"]
                            elif data.get("response"):
                                yield data["response"]
                return
            if api_key:
                model = req.model or settings.AI_MODEL
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": settings.AI_SYSTEM_PROMPT}
                    ]
                    + [m.dict() for m in req.messages],
                    "temperature": req.temperature or 0.7,
                    "stream": True,
                }
                async with httpx.AsyncClient(timeout=30) as client:
                    async with client.stream(
                        "POST",
                        "https://api.openai.com/v1/chat/completions",
                        headers=headers,
                        json=payload,
                    ) as resp:
                        async for line in resp.aiter_lines():
                            if not line.startswith("data: "):
                                continue
                            data_str = line[len("data: ") :]
                            if data_str.strip() == "[DONE]":
                                break
                            obj = None
                            try:
                                obj = httpx.Response(200, text=data_str).json()
                            except Exception:
                                obj = None
                            if not obj:
                                continue
                            delta = obj.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content")
                            if content:
                                yield content
                return
        except Exception:
            last = next(
                (m.content for m in reversed(req.messages) if m.role == "user"), ""
            )
            q = last.lower()
            if (
                any(w in q for w in ["temperature", "weather", "hot", "cold"])
                and "kathmandu" in q
            ):
                try:
                    async with httpx.AsyncClient(timeout=10) as client:
                        r = await client.get(
                            "https://api.open-meteo.com/v1/forecast",
                            params={
                                "latitude": 27.7172,
                                "longitude": 85.3240,
                                "current": "temperature_2m",
                            },
                        )
                        if r.status_code == 200:
                            current = r.json().get("current", {})
                            temp = current.get("temperature_2m")
                            if temp is not None:
                                yield f"Right now in Kathmandu, it’s about {temp}°C. Want suggestions for what to wear or places to visit today?"
                                return
                except Exception:
                    yield "I can’t fetch the exact number at the moment, but Kathmandu is mild overall—cool mornings, warmer afternoons. If you share your dates, I’ll tailor what to wear and a light itinerary."
                    return
            yield "I’m here and ready to help. Tell me your interests—food, culture, or adventure—and I’ll suggest great local options."
            return
        last = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
        q = last.lower()
        if (
            any(w in q for w in ["temperature", "weather", "hot", "cold"])
            and "kathmandu" in q
        ):
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    r = await client.get(
                        "https://api.open-meteo.com/v1/forecast",
                        params={
                            "latitude": 27.7172,
                            "longitude": 85.3240,
                            "current": "temperature_2m",
                        },
                    )
                    if r.status_code == 200:
                        current = r.json().get("current", {})
                        temp = current.get("temperature_2m")
                        if temp is not None:
                            yield f"Right now in Kathmandu, it’s about {temp}°C. Want suggestions for what to wear or places to visit today?"
                            return
            except Exception:
                yield "I can’t fetch the exact number at the moment, but Kathmandu is mild overall—cool mornings, warmer afternoons. If you share your dates, I’ll tailor what to wear and a light itinerary."
                return
            yield "I can’t fetch the exact number at the moment, but Kathmandu is mild overall—cool mornings, warmer afternoons. If you share your dates, I’ll tailor what to wear and a light itinerary."
            return
        yield "I’m here and ready to help. Tell me your interests—food, culture, or adventure—and I’ll suggest great local options."

    return StreamingResponse(streamer(), media_type="text/plain; charset=utf-8")
