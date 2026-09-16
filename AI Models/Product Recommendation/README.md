# OutFitMaker Size & Style AI

Flask API powering two features of the OutFitMaker storefront:

- **`POST /predict`** — predicts clothing size from
  `weight, age, height, waist, hips, Body_Shape`
  using a RandomForest classifier (`model.pkl`, retrained on a synthetic dataset
  derived from standard size charts with waist/hip ratios).
- **`POST /recommend`** — upload a picture and get 6 visually-similar product
  images using a ResNet50 (ImageNet) feature extractor + nearest-neighbours lookup
  against pre-computed catalog embeddings (`embeddings.pkl`, `filenames.pkl`).
- **`GET /health`** — returns `{"status":"ok"}`; used by uptime keep-alive
  monitors.

## Run locally

```bash
pip install -r requirements.txt
pip install tensorflow-cpu==2.16.1   # Windows/local; the Dockerfile picks the right TF for the container arch
python API.py
```

Serves on `PORT` (default `5000`). Set `FLASK_DEBUG=1` only for development.

## Deploy to a container host (Render / SnapDeploy / similar)

Hosted as a Docker web service. Works with any host that builds a Dockerfile from
this folder (namespace the folder as the build root, e.g. Render or SnapDeploy
"root directory"). Nothing host-specific is baked in: the container binds
`0.0.0.0:$PORT` (hosts inject their port, or it falls back to `7860`).

1. Push this folder to GitHub (keep `Dockerfile`, `requirements.txt`, `API.py`,
   and the three `.pkl` files together in one directory).
2. Point the host at the repo (e.g. Render: **New → Web Service**; SnapDeploy:
   **New container**), and set **Root Directory** to the folder containing this
   `Dockerfile` (`AI Models/Product Recommendation`).
3. The host detects **Docker** from the Dockerfile and builds it. TensorFlow is
   installed per build architecture (x86_64 → `tensorflow-cpu`, aarch64 →
   `tensorflow-aarch64`), so the image builds on both.
4. Uploaded env vars are optional: `FLASK_APP=app.py`, `FLASK_DEBUG=0`,
   `FLASK_ENV=production`, `PORT` (auto or `7860`). A `SECRET_KEY` is not used by
   this service — set any value if a host requires one.
5. The service URL will be
   `https://<name>.onrender.com` / `https://<name>.containers.snapdeploy.app`.
   - `<url>/predict`
   - `<url>/recommend`
   - `<url>/health`

### Keep-alive (free tiers sleep when idle)

Free instances go to sleep and cold-start on the next request. To keep it warm:

- A free [UptimeRobot](https://uptimerobot.com) HTTP monitor pinging
  `<url>/health` every 5 minutes wakes the instance before a real user hits it.

The `.NET` backend calls these endpoints with generous timeouts, so a cold start
is tolerated, but the monitor avoids the wait entirely.

## Model artifacts

| File               | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| `model.pkl`        | Size-prediction classifier (scikit-learn)                |
| `embeddings.pkl`   | ResNet50 feature vectors of all catalog products         |
| `filenames.pkl`    | Image filenames matching the embeddings                  |
| `retrain_embeddings.py` | Script used to rebuild embeddings for the catalog   |

The size model was retrained from the Kaggle `Size-with-Shape.csv` dataset used in
the original notebook — parameterized with standard waist/hip ranges for each body
shape (`Slim`, `Regular`, `Curvy`).