import os
import sys
import pickle
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPooling2D
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from numpy.linalg import norm
import tensorflow

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, 'reconfigure'):
        try:
            _stream.reconfigure(encoding='utf-8', errors='replace')
        except (ValueError, OSError):
            pass

IMAGES_DIR = r'E:\EELU\4\gradution project\OutFit Maker\OutFit_Maker_DotNet\OutfitMaker.API\Images'

model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
model.trainable = False
model = tensorflow.keras.Sequential([model, GlobalMaxPooling2D()])


def extract_features(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    expanded = np.expand_dims(img_array, axis=0)
    preprocessed = preprocess_input(expanded)
    result = model.predict(preprocessed, verbose=0).flatten()
    normalized = result / norm(result)
    return normalized


feature_list = []
filenames = []

for name in sorted(os.listdir(IMAGES_DIR)):
    if not name.lower().endswith(('.png', '.jpg', '.jpeg')):
        continue
    full = os.path.join(IMAGES_DIR, name)
    try:
        vec = extract_features(full)
        feature_list.append(vec)
        filenames.append(name)
        print(f'extracted: {name}')
    except Exception as e:
        print(f'skipped {name}: {e}')

if not feature_list:
    print('ERROR: no images extracted')
    sys.exit(1)

pickle.dump(np.array(feature_list), open('embeddings.pkl', 'wb'))
pickle.dump(filenames, open('filenames.pkl', 'wb'))
print(f'DONE: {len(filenames)} images saved to embeddings.pkl / filenames.pkl')