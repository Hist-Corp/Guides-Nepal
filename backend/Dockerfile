FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p app/uploads && chmod 755 app/uploads

# Security: Create a non-root user and set ownership
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
