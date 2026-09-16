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
python API.py
```

Serves on `PORT` (default `5000`). Set `FLASK_DEBUG=1` only for development.

## Deploy to Render.com (free)

Hosted as a Docker web service on Render's free tier (no credit card needed for
the hobby/free web service):

1. Push this folder to GitHub (keep `Dockerfile`, `requirements.txt`, `API.py`,
   and the three `.pkl` files together in one directory).
2. In [dashboard.render.com](https://dashboard.render.com) → **New** →
   **Web Service** → connect the GitHub repo.
3. Under **Root Directory** select the folder that contains the `Dockerfile`
   (e.g. `AI Models/Product Recommendation`). Render builds from that
   `Dockerfile`.
4. **Runtime** is automatically detected as **Docker** from the Dockerfile.
5. Create the service. Render injects a `PORT` environment variable at runtime,
   which overrides the `7860` fallback in the Dockerfile — the container listens
   on whatever port Render assigns.
6. The service URL will be `https://<name>.onrender.com`.
   - `https://<name>.onrender.com/predict`
   - `https://<name>.onrender.com/recommend`
   - `https://<name>.onrender.com/health`

### Keep-alive (free tier sleeps after ~15 min idle)

Free instances go to sleep and cold-start in 30–60 s on the next request. To keep
it warm with a free monitor:

- Create a free [UptimeRobot](https://uptimerobot.com) HTTP monitor pinging
  `https://<name>.onrender.com/health` every 5 minutes — it wakes the instance
  before a real user hits it.

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