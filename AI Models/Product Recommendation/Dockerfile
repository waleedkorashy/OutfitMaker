FROM python:3.11-slim

# TensorFlow CPU build on slim images needs this shared lib.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV FLASK_DEBUG=0
ENV TF_CPP_MIN_LOG_LEVEL=2
# Hosts (SnapDeploy/Render/Koyeb/Northflank) inject their own $PORT at runtime,
# which overrides this fallback default when no PORT is provided.
ENV PORT=7860

COPY requirements.txt .
# TensorFlow wheels are platform-specific and there is no single PyPI package
# for every architecture: install the right build for the build host. TF and the
# rest are resolved in ONE pip call so numpy/ml-dtypes stay consistent.
RUN ARCH="$(uname -m)" \
    && if [ "$ARCH" = "x86_64" ]; then TF=tensorflow-cpu; else TF=tensorflow-aarch64; fi \
    && pip install --no-cache-dir -r requirements.txt "${TF}==2.16.1"
# Fail the build here, not at startup, if numpy/TensorFlow are ABI-incompatible.
RUN python -c "import numpy, tensorflow; from tensorflow.keras.applications import ResNet50; print('TensorFlow OK:', tensorflow.__version__, 'numpy:', numpy.__version__)"

COPY API.py .
COPY model.pkl .
COPY embeddings.pkl .
COPY filenames.pkl .

EXPOSE 7860

CMD gunicorn --workers 1 --threads 4 --timeout 300 --bind 0.0.0.0:${PORT} API:app