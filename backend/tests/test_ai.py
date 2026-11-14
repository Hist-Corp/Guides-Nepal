from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ai_chat_fallback() -> None:
    # Without OPENAI_API_KEY set, endpoint should still return a fallback reply
    payload = {
        "messages": [
            {"role": "user", "content": "What is the best food tour in Kathmandu?"}
        ],
        "temperature": 0.7,
    }
    resp = client.post("/api/v1/ai/chat", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "Maila Dai" in data["reply"]
