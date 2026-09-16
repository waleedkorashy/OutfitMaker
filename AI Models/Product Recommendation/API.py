import os
import sys
import numpy as np
import pickle
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPooling2D
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from numpy.linalg import norm
from sklearn.neighbors import NearestNeighbors
import tensorflow

# Make all paths relative to this file so the app works regardless of the
# current working directory (important when running in a container / HF Space).
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


@app.route('/health', methods=['GET'])
def health():
    # Used by uptime keep-alive monitors (e.g. UptimeRobot) so a free-tier
    # host (Render) that sleeps on idle is woken back up. 200 = healthy.
    return jsonify({'status': 'ok'})

# Load pre-trained ResNet50 model
model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
model.trainable = False

model = tensorflow.keras.Sequential([
    model,
    GlobalMaxPooling2D()
])

# Load pre-computed feature vectors and filenames
feature_list = pickle.load(open(os.path.join(BASE_DIR, 'embeddings.pkl'), 'rb'))
filenames = pickle.load(open(os.path.join(BASE_DIR, 'filenames.pkl'), 'rb'))

# Initialize NearestNeighbors model
neighbors = NearestNeighbors(n_neighbors=6, algorithm='brute', metric='euclidean')
neighbors.fit(feature_list)


def extract_features(img_path, model):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    expanded_img_array = np.expand_dims(img_array, axis=0)
    preprocessed_img = preprocess_input(expanded_img_array)
    result = model.predict(preprocessed_img, verbose=0).flatten()
    normalized_result = result / norm(result)
    return normalized_result


@app.route('/recommend', methods=['POST'])
def recommend():
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

    # Extract features from the uploaded image
    query_features = extract_features(file_path, model)

    # Find nearest neighbors
    distances, indices = neighbors.kneighbors([query_features])

    # Prepare recommended image paths
    recommended_images = [filenames[idx] for idx in indices[0]]

    return jsonify({'recommended_images': recommended_images})


# Load the model from the file
with open(os.path.join(BASE_DIR, 'model.pkl'), 'rb') as f:
    loaded_model = pickle.load(f)


@app.route('/predict', methods=['POST'])
def predict():
    # Get data from the request
    data = request.json
    input_data = tuple(data['input_data'])
    input_data_as_numpy_array = np.asarray(input_data)
    input_data_reshaped = input_data_as_numpy_array.reshape(1, -1)

    # Make prediction
    prediction = loaded_model.predict(input_data_reshaped)
    predicted_class = prediction[0]
    classes=['XXS','S','M','L','XL','XXL','XXXL']
    class_name=classes[predicted_class]
    print(predicted_class, class_name)

    # Return the prediction
    return jsonify({'predicted_class': int(predicted_class),
                    "class_name": class_name,
                    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0').lower() in ('1', 'true', 'yes')
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)
