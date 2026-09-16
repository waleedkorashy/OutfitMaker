import random
import numpy as np
import pandas as pd
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

random.seed(42)
np.random.seed(42)

SIZES = ['XXS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

# Waist ranges (cm) that define each letter size - standard clothing chart.
WAIST_BOUNDS = [
    ('XXS', 55, 62),
    ('S', 62.5, 68),
    ('M', 68.5, 74.5),
    ('L', 75, 81),
    ('XL', 81.5, 88),
    ('XXL', 88.5, 95),
    ('XXXL', 95.5, 108),
]

# Hip-to-waist ratio depends on body shape. Slim = smaller hips,
# Curvy = larger hips, Regular in between.
SHAPE_HIP_RATIO = {'Slim': (1.08, 1.18), 'Regular': (1.18, 1.28), 'Curvy': (1.28, 1.42)}

# Height (cm) sampling range for the synthetic population.
HEIGHT_MIN, HEIGHT_MAX = 148, 190


def sample_height():
    # Bell-ish spread around the mean adult height.
    return float(np.random.normal(168, 8))


def pick_waist_by_size(size):
    for name, lo, hi in WAIST_BOUNDS:
        if name == size:
            return np.random.uniform(lo, hi)


def weight_from_measurements(height_cm, waist_cm, hips_cm, shape):
    # A torso-circumference proxy. BMI correlates with waist/hips, so we
    # construct weight so that BMI mostly sits in 18-32.
    bmi = np.random.uniform(19, 27)
    weight = bmi * (height_cm / 100) ** 2
    return weight


rows = []
for _ in range(9000):
    height = sample_height()
    if height < HEIGHT_MIN or height > HEIGHT_MAX:
        height = float(np.random.uniform(HEIGHT_MIN, HEIGHT_MAX))

    # Pick a size by probability, then derive waist from it.
    size = np.random.choice(SIZES, p=[0.09, 0.16, 0.24, 0.22, 0.14, 0.09, 0.06])
    waist = pick_waist_by_size(size)

    shape = np.random.choice(['Slim', 'Regular', 'Curvy'], p=[0.3, 0.45, 0.25])
    lo, hi = SHAPE_HIP_RATIO[shape]
    hips = waist * np.random.uniform(lo, hi)

    # Slight natural bounce so the model sees variance inside a size.
    waist = waist + np.random.normal(0, 1.2)
    hips = hips + np.random.normal(0, 1.5)

    age = int(np.random.uniform(16, 70))
    weight = weight_from_measurements(height, waist, hips, shape)

    rows.append([weight, age, height, waist, hips, shape, size])

df = pd.DataFrame(rows, columns=['weight', 'age', 'height', 'waist', 'hips', 'Body_Shape', 'size'])

X = df[['weight', 'age', 'height', 'waist', 'hips', 'Body_Shape']].copy()
X['Body_Shape'] = X['Body_Shape'].map({'Slim': 0, 'Regular': 1, 'Curvy': 2})
y = df['size'].map({s: i for i, s in enumerate(SIZES)})

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=12)

model = RandomForestClassifier(n_estimators=200, random_state=12, max_depth=12)
model.fit(X_train, y_train)

train_acc = accuracy_score(y_train, model.predict(X_train))
test_acc = accuracy_score(y_test, model.predict(X_test))
print(f'train acc: {train_acc:.4f}  test acc: {test_acc:.4f}')

# Sanity: a 170cm Regular person with waist 72 -> M.
sample = np.array([[68, 28, 170, 72, 90, 1]]).reshape(1, -1)
print('M-check (waist 72):', SIZES[int(model.predict(sample)[0])])
sample = np.array([[80, 30, 172, 88, 108, 2]]).reshape(1, -1)
print('XL-check (waist 88, curvy):', SIZES[int(model.predict(sample)[0])])

import os, shutil
out_dir = os.path.join(os.path.dirname(__file__), '..', 'Product Recommendation')
with open(os.path.join(out_dir, 'model.pkl'), 'wb') as f:
    pickle.dump(model, f)
df.to_csv(os.path.join(os.path.dirname(__file__), 'sizing-dataset.csv'), index=False)
print('saved model.pkl + sizing-dataset.csv')