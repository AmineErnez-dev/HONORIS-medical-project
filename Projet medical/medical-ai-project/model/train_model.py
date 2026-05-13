import os
import copy
import torch
import numpy as np
import matplotlib.pyplot as plt

import torch.nn as nn
import torch.optim as optim

from torchvision import datasets, transforms
from torch.utils.data import DataLoader

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

# ====================================
# DEVICE
# ====================================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Using device:", device)

# ====================================
# PATHS
# ====================================

train_path = "../dataset/chest_xray/train"
val_path   = "../dataset/chest_xray/val"
test_path  = "../dataset/chest_xray/test"

save_dir = "../results"
os.makedirs(save_dir, exist_ok=True)

# ====================================
# TRANSFORMS
# ====================================

train_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.RandomHorizontalFlip(),

    transforms.RandomRotation(10),

    transforms.RandomAffine(
        degrees=0,
        translate=(0.05, 0.05)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.5, 0.5, 0.5],
        std=[0.5, 0.5, 0.5]
    )
])

test_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.5, 0.5, 0.5],
        std=[0.5, 0.5, 0.5]
    )
])

# ====================================
# DATASETS
# ====================================

train_dataset = datasets.ImageFolder(
    train_path,
    transform=train_transform
)

val_dataset = datasets.ImageFolder(
    val_path,
    transform=test_transform
)

test_dataset = datasets.ImageFolder(
    test_path,
    transform=test_transform
)

train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=32,
    shuffle=False
)

test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False
)

class_names = train_dataset.classes

print("Classes:", class_names)

# ====================================
# IMPROVED CNN
# ====================================

class CNN(nn.Module):

    def __init__(self):

        super(CNN, self).__init__()

        self.features = nn.Sequential(

            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )

        self.avgpool = nn.AdaptiveAvgPool2d((7, 7))

        self.classifier = nn.Sequential(

            nn.Flatten(),

            nn.Linear(256 * 7 * 7, 512),
            nn.ReLU(),

            nn.Dropout(0.5),

            nn.Linear(512, 128),
            nn.ReLU(),

            nn.Dropout(0.3),

            nn.Linear(128, 2)
        )

    def forward(self, x):

        x = self.features(x)

        x = self.avgpool(x)

        x = self.classifier(x)

        return x

model = CNN().to(device)

# ====================================
# LOSS + OPTIMIZER
# ====================================

criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=0.0001
)

scheduler = optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode='min',
    factor=0.5,
    patience=2
)

# ====================================
# TRAINING
# ====================================

epochs = 10

best_val_acc = 0

best_model_wts = copy.deepcopy(model.state_dict())

train_acc_history = []
val_acc_history = []

train_loss_history = []
val_loss_history = []

for epoch in range(epochs):

    print(f"\nEpoch {epoch+1}/{epochs}")

    # =========================
    # TRAIN
    # =========================

    model.train()

    running_loss = 0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

    train_loss = running_loss / len(train_loader)

    train_acc = correct / total

    train_loss_history.append(train_loss)
    train_acc_history.append(train_acc)

    # =========================
    # VALIDATION
    # =========================

    model.eval()

    running_loss = 0
    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            loss = criterion(outputs, labels)

            running_loss += loss.item()

            _, predicted = torch.max(outputs, 1)

            total += labels.size(0)

            correct += (predicted == labels).sum().item()

    val_loss = running_loss / len(val_loader)

    val_acc = correct / total

    val_loss_history.append(val_loss)
    val_acc_history.append(val_acc)

    scheduler.step(val_loss)

    print(f"Train Loss        : {train_loss:.4f}")
    print(f"Train Accuracy    : {train_acc:.4f}")

    print(f"Validation Loss   : {val_loss:.4f}")
    print(f"Validation Accuracy : {val_acc:.4f}")

    # SAVE BEST MODEL

    if val_acc > best_val_acc:

        best_val_acc = val_acc

        best_model_wts = copy.deepcopy(model.state_dict())

        torch.save(
            model.state_dict(),
            os.path.join(save_dir, "best_model.pth")
        )

        print("Best model saved!")

# ====================================
# LOAD BEST MODEL
# ====================================

model.load_state_dict(best_model_wts)

# ====================================
# TEST
# ====================================

model.eval()

y_true = []
y_pred = []

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(device)

        outputs = model(images)

        _, predicted = torch.max(outputs, 1)

        y_true.extend(labels.numpy())

        y_pred.extend(predicted.cpu().numpy())

# ====================================
# METRICS
# ====================================

test_acc = accuracy_score(y_true, y_pred)

precision = precision_score(y_true, y_pred)

recall = recall_score(y_true, y_pred)

f1 = f1_score(y_true, y_pred)

print("\n========== TEST RESULTS ==========")

print(f"Accuracy  : {test_acc:.4f}")

print(f"Precision : {precision:.4f}")

print(f"Recall    : {recall:.4f}")

print(f"F1-score  : {f1:.4f}")

print("\nClassification Report:\n")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names
    )
)

# ====================================
# CONFUSION MATRIX
# ====================================

cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(6, 5))

plt.imshow(cm, cmap="Blues")

plt.title("Confusion Matrix")

plt.xlabel("Predicted")

plt.ylabel("True")

plt.xticks([0, 1], class_names)

plt.yticks([0, 1], class_names)

for i in range(2):
    for j in range(2):

        plt.text(
            j,
            i,
            cm[i, j],
            ha="center",
            va="center"
        )

plt.colorbar()

plt.tight_layout()

plt.savefig(
    os.path.join(save_dir, "confusion_matrix.png")
)

plt.show()

# ====================================
# CURVES
# ====================================

plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)

plt.plot(train_loss_history, label="Train Loss")

plt.plot(val_loss_history, label="Validation Loss")

plt.xlabel("Epoch")

plt.ylabel("Loss")

plt.title("Loss Curves")

plt.legend()

plt.grid()

plt.subplot(1, 2, 2)

plt.plot(train_acc_history, label="Train Accuracy")

plt.plot(val_acc_history, label="Validation Accuracy")

plt.xlabel("Epoch")

plt.ylabel("Accuracy")

plt.title("Accuracy Curves")

plt.legend()

plt.grid()

plt.tight_layout()

plt.savefig(
    os.path.join(save_dir, "training_curves.png")
)

plt.show()

print("\nTraining finished successfully!")