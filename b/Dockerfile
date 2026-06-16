# ---------- Base ----------
    FROM python:3.12-slim

    WORKDIR /code
    
    # Install system dependencies (for psycopg2, Pillow, etc.)
    RUN apt-get update && apt-get install -y \
        build-essential libpq-dev && \
        rm -rf /var/lib/apt/lists/*
    
    # ---------- Install Python deps ----------
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    
    # ---------- Copy source code ----------
    COPY . .
    
    # Make sure manage.py exists and is executable
    RUN chmod +x manage.py
    
    # Default command (overridden by docker-compose)
    CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
    