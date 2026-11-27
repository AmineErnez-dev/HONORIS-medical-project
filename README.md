# HONORIS Medical AI

An AI-assisted chest X-ray classification web application that analyzes pulmonary radiographs (`NORMAL` vs `PNEUMONIA`) using a PyTorch Convolutional Neural Network (CNN) served through a Flask API and a React + Tailwind CSS frontend.

> **Medical Disclaimer:** This project was built as an educational/hackathon prototype (`HONORIS - Projet Hackathon`). It is **not** a certified medical device and must **not** be used for real clinical diagnosis or treatment decisions.

---

## Features

- **Drag-and-Drop X-Ray Upload:** Upload `PNG` or `JPG` chest X-ray images with instant client-side preview.
- **Real-Time CNN Inference:** Sends uploaded images to a Flask REST API running a trained PyTorch CNN (`medical_xray_model.pth`).
- **Confidence & Class Breakdown:** Displays the predicted class (`NORMAL` or `PNEUMONIA`), overall model confidence, and individual class probability bars.
- **Session Statistics:** Tracks analyzed images, normal cases, and cases flagged for review in browser `localStorage` with a reset option.
- **Multi-Page UI:** Includes the diagnostic dashboard (`/`), sign-in (`/login`), and registration (`/signup`) pages (authentication pages are currently frontend UI mockups).

---

## Tech Stack

### Frontend (`Projet medical/`)
- **React 19** & **Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **React Router DOM v7**
- **Lucide React** icons

### Backend & AI (`Projet medical/medical-ai-project/`)
- **Python 3**
- **PyTorch** & **Torchvision**
- **Flask** & **Flask-CORS**
- **Pillow (PIL)**

---

## Project Structure

```text
HONORIS-medical-project/
├── package.json
└── Projet medical/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   └── logo.svg
    ├── src/
    │   ├── App.jsx                  # Router setup (/, /login, /signup)
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   └── pages/
    │       ├── Home.jsx             # X-ray upload, analysis UI, and local stats
    │       ├── Login.jsx            # Login UI page
    │       └── SignUp.jsx           # Registration UI page
    └── medical-ai-project/
        ├── app/
        │   ├── app.py               # Flask API server (port 5000)
        │   ├── retrain.py           # CPU-friendly 128x128 CNN training script
        │   ├── test_model.py        # Dataset evaluation diagnostic script
        │   └── requirements.txt     # Python dependencies
        ├── model/
        │   └── train_model.py       # Alternative 4-block 224x224 CNN training script
        └── results/
            ├── medical_xray_model.pth
            └── best_model.pth
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended) and **npm**
- **Python** (v3.10+ recommended) and **pip**

### 1. Clone the Repository

```bash
git clone https://github.com/AmineErnez-dev/HONORIS-medical-project.git
cd HONORIS-medical-project
```

### 2. Start the AI Backend (Flask + PyTorch)

Open a terminal in the backend directory:

```bash
cd "Projet medical/medical-ai-project/app"
pip install -r requirements.txt
python app.py
```

The API server starts on `http://localhost:5000` and loads `../results/medical_xray_model.pth`.

### 3. Start the Frontend (React + Vite)

Open a second terminal in the frontend directory:

```bash
cd "Projet medical"
npm install
npm run dev
```

Vite will print the local URL (typically `http://localhost:5173`). Open it in your browser, upload a chest X-ray (`PNG` or `JPG`), and click **"Voir le rapport complet"** to run inference against the Flask server.

#### Additional Frontend Scripts

```bash
npm run build   # Build for production
npm run lint    # Run ESLint
npm run preview # Preview the production build
```

---

## API Reference

The Flask server runs on `http://localhost:5000` with CORS enabled.

### `GET /`
Health check endpoint returning server status, model name, and supported classes:

```json
{
  "status": "online",
  "model": "HONORIS Medical AI CNN",
  "classes": ["NORMAL", "PNEUMONIA"]
}
```

### `POST /predict`
Accepts a `multipart/form-data` request with an image under the `file` field, resizes it to `128x128`, normalizes it, and returns the prediction:

```json
{
  "success": true,
  "filename": "xray_sample.jpeg",
  "prediction": "NORMAL",
  "confidence": 94.2,
  "details": {
    "NORMAL": 94.2,
    "PNEUMONIA": 5.8
  }
}
```

---

## Model & Retraining

The inference server (`app.py`) uses a 3-block Convolutional Neural Network (`32 -> 64 -> 128` channels with `BatchNorm2d`, `ReLU`, `MaxPool2d`, `AdaptiveAvgPool2d((4, 4))`, and a 2-layer linear classifier) trained on `128x128` RGB images for two classes: `NORMAL` and `PNEUMONIA`.

To retrain the model with `retrain.py`:

1. Place a chest X-ray dataset in `Projet medical/medical-ai-project/dataset/chest_xray/` with `train/`, `val/`, and `test/` subdirectories, each containing `NORMAL/` and `PNEUMONIA/` folders.
2. Run the training script:

```bash
cd "Projet medical/medical-ai-project/app"
python retrain.py
```

This trains for 10 epochs using class-weighted `CrossEntropyLoss` (`NORMAL=3.0`, `PNEUMONIA=1.0`) and saves the best validation weights to `../results/medical_xray_model.pth`.
