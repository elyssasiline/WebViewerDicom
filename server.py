import torch
import numpy as np
import pydicom
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from monai.transforms import Compose, ScaleIntensity, ToTensor
from monai.networks.nets import UNet

app = FastAPI()

# 🔹 Activer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Définition du modèle UNet
model = UNet(
    spatial_dims=2,
    in_channels=1,
    out_channels=1,
    channels=(16, 32, 64, 128, 256),
    strides=(2, 2, 2, 2)
)

# 🔹 Charger le modèle MONAI si disponible
try:
    model.load_state_dict(torch.load("monai_pretrained_model.pth", map_location=torch.device("cpu")))
    model.eval()
    print("✅ Modèle MONAI chargé avec succès !")
except FileNotFoundError:
    print("❌ Aucun modèle MONAI trouvé. Téléchargez-le plus tard.")

@app.post("/analyze-dicom/")
async def analyze_dicom(file: UploadFile = File(...)):
    try:
        # 🔹 Lire le fichier DICOM
        dicom_data = pydicom.dcmread(BytesIO(await file.read()))

        # ✅ Extraction correcte des métadonnées
        patient_name = getattr(dicom_data, "PatientName", "Anonyme")
        modality = getattr(dicom_data, "Modality", "Inconnu")

        print(f"📌 Patient Name: {patient_name}")
        print(f"📌 Modality: {modality}")

        # 🔹 Extraction de l'image
        if hasattr(dicom_data, "pixel_array"):
            image_array = dicom_data.pixel_array.astype(np.float32)
        else:
            raise ValueError("Le fichier DICOM ne contient pas d'image.")

        # ✅ Correction : S'assurer que l'image est bien en 2D
        if image_array.ndim == 3:
            print("⚠️ Image 3D détectée, extraction de la première slice")
            image_array = image_array[0]  

        print(f"📌 Image shape après correction: {image_array.shape}")

        # ✅ Vérification et correction avant MONAI
        if image_array.ndim == 2:  # Si l'image est en (H, W)
            image_array = np.expand_dims(image_array, axis=0)  # Ajoute une dimension (C, H, W)

        print(f"📌 Image shape après ajout de channel : {image_array.shape}")

        # ✅ Correction MONAI - Appliquer les transformations de manière sécurisée
        transform = Compose([
            ScaleIntensity(),  # Normaliser les valeurs des pixels entre 0 et 1
            ToTensor(dtype=torch.float32)  # Convertir en tenseur PyTorch
        ])

        transformed_image = transform(image_array)
        transformed_image = transformed_image.unsqueeze(0)  # Ajouter une dimension batch

        print(f"📌 Image après transformation MONAI: {transformed_image.shape}")

        # 🔹 Appliquer le modèle MONAI
        with torch.no_grad():
            prediction = model(transformed_image)

        # 🔹 Vérifier si une anomalie est détectée
        anomaly_detected = torch.max(prediction).item() > 0.5  # Seuil arbitraire

        # ✅ Vérification avant d'envoyer au frontend
        result = {
            "patient_name": str(patient_name),  # ✅ S'assurer que c'est une string
            "modality": str(modality),  # ✅ S'assurer que c'est une string
            "mean_intensity": float(np.mean(image_array)),
            "anomaly_detected": bool(anomaly_detected),
            "status": "Analyse réussie 🚀"
        }

        print(f"✅ Résultat envoyé au frontend : {result}")  # Vérification

        return result  # Renvoyer un JSON structuré

    except Exception as e:
        print(f"❌ Erreur : {str(e)}")
        return {"error": str(e)}

# Lancer le serveur FastAPI
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
