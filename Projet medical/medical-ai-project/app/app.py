"""
HONORIS Medical AI - Flask API Backend
Serves the trained PyTorch CNN model for chest X-ray classification.
"""

import os
import io
import torch
import torch.nn as nn
from torchvision import transforms
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# ====================================
# APP SETUP
# ====================================

app = Flask(__name__)
CORS(app)  # Allow requests from React dev server

# ====================================
# CNN MODEL (matching the saved model weights exactly)
# ====================================

class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), 
            nn.BatchNorm2d(32), 
            nn.ReLU(), 
            nn.MaxPool2d(2),
            
            nn.Conv2d(32, 64, 3, padding=1), 
            nn.BatchNorm2d(64), 
            nn.ReLU(), 
            nn.MaxPool2d(2),
            
            nn.Conv2d(64, 128, 3, padding=1), 
            nn.BatchNorm2d(128), 
            nn.ReLU(), 
            nn.MaxPool2d(2),
        )
        self.avgpool = nn.AdaptiveAvgPool2d((4, 4))
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 2),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = self.classifier(x)
        return x

# ====================================
# LOAD MODEL
# ====================================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "results",
    "medical_xray_model.pth"
)

model = CNN().to(device)

if os.path.exists(MODEL_PATH):
    model.load_state_dict(
        torch.load(MODEL_PATH, map_location=device, weights_only=True)
    )
    print(f"[OK] Model loaded successfully from {MODEL_PATH}")
else:
    print(f"[WARNING] Model file not found at {MODEL_PATH}")
    print("The API will still work but predictions will be random.")

model.eval()

CLASS_NAMES = ["NORMAL", "PNEUMONIA"]

# ====================================
# IMAGE TRANSFORM (same as test_transform)
# ====================================

transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.5, 0.5, 0.5],
        std=[0.5, 0.5, 0.5]
    ),
])

# ====================================
# ROUTES
# ====================================

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "online",
        "model": "HONORIS Medical AI CNN",
        "classes": CLASS_NAMES
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accepts an image file via POST and returns the prediction.
    """
    if "file" not in request.files:
        return jsonify({"error": "Aucun fichier envoyé"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Nom de fichier vide"}), 400

    try:
        # Read and preprocess the image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = transform(image).unsqueeze(0).to(device)

        # Run inference
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)

        predicted_class = CLASS_NAMES[predicted_idx.item()]
        confidence_value = round(confidence.item() * 100, 1)

        return jsonify({
            "success": True,
            "filename": file.filename,
            "prediction": predicted_class,
            "confidence": confidence_value,
            "details": {
                "NORMAL": round(probabilities[0][0].item() * 100, 1),
                "PNEUMONIA": round(probabilities[0][1].item() * 100, 1),
            }
        })

    except Exception as e:
        return jsonify({"error": f"Erreur de traitement: {str(e)}"}), 500


# ====================================
# MAIN
# ====================================

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("  HONORIS Medical AI - API Server")
    print("  http://localhost:5000")
    print("=" * 50 + "\n")
    app.run(debug=True, port=5000)
