# 🟢 Explication du Projet de Visualisation DICOM

## 📝 **Présentation du Projet**
Ce projet consiste à créer une **application web** permettant de **visualiser des images médicales DICOM**. Il utilise la bibliothèque **Cornerstone.js**, spécialisée dans l'affichage d'images médicales dans le navigateur.

## 📌 **Objectifs du Projet**
- ✅ **Charger** et **afficher** des images DICOM.
- ✅ **Interagir** avec les images (Zoom et Pan).
- ✅ **Afficher les logs** dans la console pour suivre les actions.

---

## 📚 **Outils et Bibliothèques Utilisés**
### 1️⃣ `cornerstone-core` *(Cœur de l'affichage)*
- **Affiche l'image** dans le conteneur HTML.
- Fournit les outils principaux : **Zoom, Pan**.
- **Pourquoi ?** : Indispensable pour afficher les images DICOM.

### 2️⃣ `cornerstone-wado-image-loader` *(Chargement des images DICOM)*
- **Charge** les images DICOM depuis un **serveur via WADO**.
- Compatible avec les serveurs **PACS** (utilisés dans les hôpitaux).
- **Pourquoi ?** : Facilite l'accès aux images DICOM en réseau.

### 3️⃣ `cornerstone-math` *(Mathématiques pour l'image)*
- Fournit des **outils mathématiques** (coordonnées, zoom, déplacements).
- Utile pour **calculer les mouvements (Pan) et le zoom**.
- **Pourquoi ?** : Essentiel pour gérer les interactions utilisateur.

### 4️⃣ `dicom-parser` *(Lecture des métadonnées)*
- **Lit les fichiers DICOM** (nom du patient, type de scan, etc.).
- Analyse les **en-têtes DICOM**.
- **Pourquoi ?** : Utile pour l'affichage des informations médicales.

### 5️⃣ `cornerstone-tools` *(Outils interactifs)*
- Ajoute des **interactions avancées** : **Zoom, Pan, Mesures, Annotations**.
- Permet d’**écouter les événements** de la souris (molette, clic, glisser).
- **Pourquoi ?** : Gère toute l’interactivité sur l’image.


## 🟢 **Structure du Script**
### 1️⃣ **Chargement du Script (`DOMContentLoaded`)**
- Écoute l'événement `DOMContentLoaded` et **exécute le script une fois la page chargée**.
- Permet de **garantir que le DOM est prêt** avant d'utiliser `#dicom-container`.

### 2️⃣ **Vérification des Bibliothèques (`cornerstone`, `cornerstoneTools`)**
- Vérifie que `cornerstone` et `cornerstoneTools` sont chargés.
- Affiche une **erreur** (`console.error()`) si elles sont absentes.

### 3️⃣ **Initialisation de Cornerstone (`cornerstone.enable()`)**
- **Active** le moteur de rendu **sur l’élément HTML** `#dicom-container`.
- Prépare l’élément pour **afficher une image DICOM**.

### 4️⃣ **Chargement de l'Image DICOM (`cornerstone.loadImage()`)**
- **Configure** le `WADO` loader (`cornerstoneWADOImageLoader`).
- **Charge** l’image via l’URL avec `wadouri:`.
- **Affiche** l’image avec `cornerstone.displayImage()`.
- **Gère les erreurs** (`try...catch`).

### 5️⃣ **Gestion du Zoom (`wheel` event)**
- Écoute **l’événement `wheel`** (molette ou pinch).
- **Empêche le défilement** de la page (`event.preventDefault()`).
- **Modifie** l’échelle (`viewport.scale`).
- **Applique** le zoom (`cornerstone.setViewport()`).

### 6️⃣ **Gestion du Déplacement (Pan) (`mousedown`, `mousemove`, `mouseup`)**
- **Début (`mousedown`)** : Active le mode `Pan` et enregistre la position initiale.
- **Déplacement (`mousemove`)** : Calcule les mouvements (`deltaX`, `deltaY`) et déplace l’image.
- **Fin (`mouseup`)** : Désactive le mode `Pan`.