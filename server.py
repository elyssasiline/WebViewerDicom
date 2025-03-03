from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pydicom
import numpy as np
from io import BytesIO
import monai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Remplace "*" par ["http://localhost:3000"] si besoin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Serveur IA Médicale en ligne 🚀"}

@app.post("/analyze-dicom/")
async def analyze_dicom(file: UploadFile = File(...)):
    try:
        # Lire le fichier DICOM
        dicom_data = pydicom.dcmread(BytesIO(await file.read()))
        
        # Extraire des informations simples
        patient_name = dicom_data.PatientName if "PatientName" in dicom_data else "Inconnu"
        modality = dicom_data.Modality if "Modality" in dicom_data else "Inconnue"
        image_array = dicom_data.pixel_array  # Tableau numpy de l'image

        # Simuler une analyse (on prendra MONAI plus tard)
        mean_intensity = np.mean(image_array)
        
        return {
            "patient_name": str(patient_name),
            "modality": modality,
            "mean_intensity": float(mean_intensity),
            "status": "Analyse réussie 🚀"
        }

    except Exception as e:
        return {"error": str(e)}

# Lancer le serveur
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
