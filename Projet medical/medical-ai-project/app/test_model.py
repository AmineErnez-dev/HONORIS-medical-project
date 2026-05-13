"""Quick test to diagnose model predictions on known dataset images."""
import os
import torch
import torch.nn as nn
from torchvision import transforms, datasets
from torch.utils.data import DataLoader

class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )
        self.fc = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 26 * 26, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, 2),
        )
    def forward(self, x):
        return self.fc(self.conv(x))

device = torch.device("cpu")
model = CNN().to(device)
model.load_state_dict(torch.load('../results/medical_xray_model.pth', map_location=device, weights_only=True))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
])

test_dataset = datasets.ImageFolder('../dataset/chest_xray/test', transform=transform)
print("Classes:", test_dataset.classes)
print("Class to idx:", test_dataset.class_to_idx)

loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

correct = 0
total = 0
normal_correct = 0
normal_total = 0
pneumonia_correct = 0
pneumonia_total = 0

with torch.no_grad():
    for images, labels in loader:
        outputs = model(images)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        _, predicted = torch.max(outputs, 1)
        
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        
        for i in range(labels.size(0)):
            if labels[i] == 0:  # NORMAL
                normal_total += 1
                if predicted[i] == 0:
                    normal_correct += 1
            else:  # PNEUMONIA
                pneumonia_total += 1
                if predicted[i] == 1:
                    pneumonia_correct += 1

print(f"\nOverall Accuracy: {correct}/{total} = {correct/total*100:.1f}%")
print(f"NORMAL accuracy:    {normal_correct}/{normal_total} = {normal_correct/normal_total*100:.1f}%")
print(f"PNEUMONIA accuracy: {pneumonia_correct}/{pneumonia_total} = {pneumonia_correct/pneumonia_total*100:.1f}%")
