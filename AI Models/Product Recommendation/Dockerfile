FROM python:3.11-slim

# TensorFlow CPU build on slim images needs this shared lib.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV FLASK_DEBUG=0
# Free-tier hosts (Render/Koyeb/Northflank) inject their own $PORT at
# runtime, which overrides this fallback default.
ENV PORT=7860

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY API.py .
COPY model.pkl .
COPY embeddings.pkl .
COPY filenames.pkl .

EXPOSE 7860

CMD gunicorn --workers 1 --threads 4 --timeout 300 --bind 0.0.0.0:${PORT} API:app