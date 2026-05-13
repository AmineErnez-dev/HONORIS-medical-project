"""
HONORIS Medical AI - Fast CPU Retraining
Optimized for speed on CPU: smaller image size (128x128), fewer workers.
"""
import os
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import time

# ====================================
# DEVICE
# ====================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ====================================
# PATHS
# ====================================
base = os.path.join(os.path.dirname(__file__), "..")
train_path = os.path.join(base, "dataset", "chest_xray", "train")
val_path   = os.path.join(base, "dataset", "chest_xray", "val")
test_path  = os.path.join(base, "dataset", "chest_xray", "test")
save_dir   = os.path.join(base, "results")
os.makedirs(save_dir, exist_ok=True)

# ====================================
# TRANSFORMS (128x128 for speed)
# ====================================
IMG_SIZE = 128

train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
])

test_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
])

# ====================================
# DATASETS
# ====================================
train_dataset = datasets.ImageFolder(train_path, transform=train_transform)
val_dataset   = datasets.ImageFolder(val_path, transform=test_transform)
test_dataset  = datasets.ImageFolder(test_path, transform=test_transform)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
val_loader   = DataLoader(val_dataset, batch_size=64, shuffle=False)
test_loader  = DataLoader(test_dataset, batch_size=64, shuffle=False)

class_names = train_dataset.classes
print(f"Classes: {class_names}")
print(f"Train: {len(train_dataset)} | Val: {len(val_dataset)} | Test: {len(test_dataset)}")

# ====================================
# CLASS WEIGHTS (PNEUMONIA has ~3x more samples)
# ====================================
weights = torch.tensor([3.0, 1.0]).to(device)
print(f"Class weights: NORMAL={weights[0]:.1f}, PNEUMONIA={weights[1]:.1f}")

# ====================================
# CNN MODEL
# ====================================
class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(), nn.MaxPool2d(2),
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

model = CNN().to(device)
total_params = sum(p.numel() for p in model.parameters())
print(f"Model parameters: {total_params:,}")

# ====================================
# LOSS + OPTIMIZER
# ====================================
criterion = nn.CrossEntropyLoss(weight=weights)
optimizer = optim.Adam(model.parameters(), lr=0.001)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)

# ====================================
# TRAINING
# ====================================
epochs = 10
best_val_acc = 0
best_model_wts = None
start_time = time.time()

for epoch in range(epochs):
    epoch_start = time.time()

    # TRAIN
    model.train()
    running_loss, correct, total = 0, 0, 0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
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

    # VALIDATION
    model.eval()
    running_loss, correct, total = 0, 0, 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    val_loss = running_loss / len(val_loader)
    val_acc = correct / total
    scheduler.step(val_loss)
    elapsed = time.time() - epoch_start

    print(f"Epoch {epoch+1:2d}/10 | Train: loss={train_loss:.3f} acc={train_acc:.3f} | Val: loss={val_loss:.3f} acc={val_acc:.3f} | {elapsed:.0f}s")

    if val_acc >= best_val_acc:
        best_val_acc = val_acc
        best_model_wts = copy.deepcopy(model.state_dict())
        torch.save(model.state_dict(), os.path.join(save_dir, "medical_xray_model.pth"))
        print(f"         >>> Model saved! (val_acc={val_acc:.3f})")

total_time = time.time() - start_time
print(f"\nTraining completed in {total_time/60:.1f} minutes")

# ====================================
# TEST
# ====================================
model.load_state_dict(best_model_wts)
model.eval()

correct, total = 0, 0
normal_correct, normal_total = 0, 0
pneumonia_correct, pneumonia_total = 0, 0

with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        outputs = model(images)
        _, predicted = torch.max(outputs, 1)
        predicted = predicted.cpu()
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        for i in range(labels.size(0)):
            if labels[i] == 0:
                normal_total += 1
                if predicted[i] == 0: normal_correct += 1
            else:
                pneumonia_total += 1
                if predicted[i] == 1: pneumonia_correct += 1

print(f"\n{'='*50}")
print(f"  FINAL TEST RESULTS")
print(f"{'='*50}")
print(f"Overall:   {correct}/{total} = {correct/total*100:.1f}%")
print(f"NORMAL:    {normal_correct}/{normal_total} = {normal_correct/normal_total*100:.1f}%")
print(f"PNEUMONIA: {pneumonia_correct}/{pneumonia_total} = {pneumonia_correct/pneumonia_total*100:.1f}%")
print(f"\nModel saved to: {os.path.join(save_dir, 'medical_xray_model.pth')}")
