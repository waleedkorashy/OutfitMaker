import os
import sys
import numpy as np
import pickle
from flask import Flask, request, jsonify
from numpy.linalg import norm
from sklearn.neighbors import NearestNeighbors

# Cap TensorFlow's thread pools: keeps the RSS footprint small enough for
# 512 MB free-tier containers (must be set before tensorflow is imported).
os.environ.setdefault('TF_NUM_INTRAOP_THREADS', '1')
os.environ.setdefault('TF_NUM_INTEROP_THREADS', '1')
os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '2')

# Make all paths relative to this file so the app works regardless of the
# current working directory (important when running in a container).
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Windows consoles default to cp1252/charmap which cannot encode the Unicode
# spinner/box-drawing chars printed by TensorFlow's progress bars. Force UTF-8
# so model.predict() inside /recommend does not raise UnicodeEncodeError.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, 'reconfigure'):
        try:
            _stream.reconfigure(encoding='utf-8', errors='replace')
        except (ValueError, OSError):
            pass

app = Flask(__name__)


@app.after_request
def add_cors_headers(resp):
    # The AI endpoints are consumed directly from the browser (frontend on
    # Cloudflare), bypassing the ASP.NET proxy which Cloudflare bot-fight
    # blocks. Allow any origin — the model responses carry no credentials.
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    resp.headers['Access-Control-Max-Age'] = '86400'
    return resp


def _handle_options():
    return ('', 204)

# The visual-recommendation stack (TensorFlow + MobileNetV2 + embeddings +
# nearest-neighbours) is loaded lazily on the first /recommend request instead
# of at startup. Startup only needs the tiny scikit-learn size model, keeping
# boot time and peak memory low on free-tier containers.
_recommender = None


def _get_recommender():
    """Build (once) the lazy MobileNetV2 feature extractor + index."""
    global _recommender
    if _recommender is not None:
        return _recommender

    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.layers import GlobalMaxPooling2D
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
    import tensorflow

    extractor = MobileNetV2(weights='imagenet', include_top=False,
                            input_shape=(224, 224, 3))
    extractor.trainable = False
    extractor = tensorflow.keras.Sequential([extractor, GlobalMaxPooling2D()])

    feature_list = pickle.load(open(os.path.join(BASE_DIR, 'embeddings.pkl'), 'rb'))
    filenames = pickle.load(open(os.path.join(BASE_DIR, 'filenames.pkl'), 'rb'))

    neighbors = NearestNeighbors(n_neighbors=6, algorithm='brute', metric='euclidean')
    neighbors.fit(feature_list)

    _recommender = {
        'extractor': extractor,
        'preprocess_input': preprocess_input,
        'image': image,
        'neighbors': neighbors,
        'filenames': filenames,
    }
    return _recommender


@app.route('/health', methods=['GET', 'OPTIONS'])
def health():
    if request.method == 'OPTIONS':
        return _handle_options()

    # Used by uptime keep-alive monitors (e.g. UptimeRobot) so a free-tier
    # host that sleeps on idle is woken back up. 200 = healthy.
    return jsonify({'status': 'ok'})


@app.route('/recommend', methods=['POST', 'OPTIONS'])
def recommend():
    if request.method == 'OPTIONS':
        return _handle_options()

    # Check if an image file is uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    # Check if the file is an image
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # Save the uploaded image
    file_path = os.path.join(UPLOADS_DIR, file.filename)
    file.save(file_path)

    rec = _get_recommender()

    # Extract features from the uploaded image
    img = rec['image'].load_img(file_path, target_size=(224, 224))
    img_array = rec['image'].img_to_array(img)
    expanded_img_array = np.expand_dims(img_array, axis=0)
    preprocessed_img = rec['preprocess_input'](expanded_img_array)
    result = rec['extractor'].predict(preprocessed_img, verbose=0).flatten()
    query_features = result / norm(result)

    # Find nearest neighbors
    distances, indices = rec['neighbors'].kneighbors([query_features])

    # Prepare recommended image paths
    recommended_images = [rec['filenames'][idx] for idx in indices[0]]

    return jsonify({'recommended_images': recommended_images})


# Load the model from the file
with open(os.path.join(BASE_DIR, 'model.pkl'), 'rb') as f:
    loaded_model = pickle.load(f)


@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return _handle_options()

    # Get data from the request
    data = request.json
    input_data = tuple(data['input_data'])
    input_data_as_numpy_array = np.asarray(input_data)
    input_data_reshaped = input_data_as_numpy_array.reshape(1, -1)

    # Make prediction
    prediction = loaded_model.predict(input_data_reshaped)
    predicted_class = prediction[0]
    classes = ['XXS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    class_name = classes[predicted_class]
    print(predicted_class, class_name)

    # Return the prediction
    return jsonify({'predicted_class': int(predicted_class),
                    "class_name": class_name,
                    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0').lower() in ('1', 'true', 'yes')
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)