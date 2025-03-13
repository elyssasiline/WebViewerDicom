# Viewerdicom

Viewerdicom est une application web conçue pour afficher des images DICOM avec des fonctionnalités interactives telles que le pan, le zoom, et l'ajout d'annotations (texte et lignes de mesure). L'application permet également de fusionner l'image DICOM avec les annotations pour télécharger un rendu final.

## Fonctionnement du Code

### 1. Initialisation et Affichage de l'Image

- **Cornerstone**  
  Le projet utilise [Cornerstone](https://github.com/cornerstonejs/cornerstone) pour charger et afficher l'image DICOM.  
  - **Chargement de l'image** : La fonction `cornerstone.loadImage` est utilisée pour charger l'image à partir d'une URL.  
  - **Affichage** : `cornerstone.displayImage` affiche l'image dans un conteneur HTML.
- **PixelSpacing**  
  Lors du chargement, le code vérifie si le DICOM contient le tag `PixelSpacing` (0028,0030). Ce tag donne la dimension physique d'un pixel (en millimètres).  
  - Cette information est utilisée pour convertir les distances mesurées en pixels en centimètres (en divisant par 10 après conversion en mm).

### 2. Gestion des Modes d'Interaction

Pour éviter les conflits entre les différentes actions, l'application utilise des boutons pour activer des modes exclusifs :

- **Pan**  
  En mode **Pan**, l'utilisateur peut déplacer l'image en modifiant le viewport de Cornerstone (c'est-à-dire les valeurs de `translation.x` et `translation.y`).  
- **Zoom**  
  Le mode **Zoom** permet d'utiliser la molette de la souris pour agrandir ou réduire l'image.  
- **Annotation Texte**  
  En mode **Annotation Texte**, un clic sur l'image affiche une invite pour saisir du texte. La position du clic est convertie en coordonnées image grâce à `cornerstone.pageToPixel`.  
- **Annotation Ligne**  
  Ce mode permet de tracer une ligne de mesure. La ligne est dessinée en direct (live) pendant que l'utilisateur déplace la souris, et est finalisée lors du relâchement du clic.  
  - La distance est calculée en pixels, convertie en millimètres (en tenant compte du `PixelSpacing`), puis en centimètres.

### 3. Conversion des Coordonnées

L'une des clés du projet est la conversion des coordonnées afin que les annotations suivent parfaitement l'image lors des transformations (pan, zoom) :

- **`cornerstone.pageToPixel(container, pageX, pageY)`**  
  Convertit les coordonnées de la page (issue d'un événement de souris) en coordonnées image. Ces coordonnées sont stockées dans les annotations.
- **`cornerstone.pixelToCanvas(container, { x, y })`**  
  Convertit les coordonnées image en coordonnées canvas lors du rendu, garantissant ainsi que les annotations soient correctement positionnées sur l'écran, même après transformation.

### 4. Fusion et Téléchargement de l'Image Annotée

Pour permettre à l'utilisateur de sauvegarder le résultat, le code fusionne :

- Le canvas de l'image (géré par Cornerstone)  
- Le canvas des annotations  
  
La fusion est effectuée sur un canvas temporaire, qui est ensuite converti en image PNG via `toDataURL` et proposé en téléchargement.

## Pourquoi ces Choix ?

### Utilisation de Cornerstone et des Conversions de Coordonnées

- **Précision** : Cornerstone gère nativement les transformations (zoom, pan, rotation) et permet d'utiliser des fonctions de conversion (`pageToPixel` et `pixelToCanvas`) garantissant une correspondance exacte entre l'image et les annotations.
- **Simplicité** : En se reposant sur l'API de Cornerstone, on évite de recalculer manuellement les transformations, ce qui réduit les erreurs et simplifie le code.

### Modes Exclusifs via Boutons

- **Clarté et Contrôle** : En activant un mode à la fois (pan, zoom, annotation texte, annotation ligne), l'application évite les conflits d'interaction. Cela rend l'expérience utilisateur plus intuitive, car l'action désirée est isolée.
- **Flexibilité** : L'utilisateur peut facilement basculer entre les différentes fonctionnalités en utilisant des boutons dédiés.

### Mesure Physique en Centimètres

- **Utilité Clinique** : La conversion de la distance mesurée en centimètres (en se basant sur le tag `PixelSpacing`) permet d'obtenir des mesures réalistes, essentielles en contexte médical.
- **Précision** : En utilisant les valeurs réelles de l'espacement des pixels, la mesure correspond exactement aux dimensions physiques de l'image.

### Rendu en Direct et Téléchargement

- **Feedback Immédiat** : Le rendu en direct des lignes lors du tracé permet à l'utilisateur de visualiser instantanément la distance mesurée, améliorant ainsi l'interaction.
- **Fusion des Canvases** : La méthode de fusion garantit que le téléchargement inclut à la fois l'image DICOM et toutes les annotations, pour un rendu final complet.

## Conclusion

Le projet **Viewerdicom** combine les puissantes fonctionnalités de Cornerstone avec une interface utilisateur claire et moderne. Grâce à l'utilisation de modes exclusifs et de conversions précises des coordonnées, l'application garantit que les annotations restent parfaitement synchronisées avec l'image DICOM, même lors des opérations de pan et de zoom. La conversion des mesures en centimètres offre par ailleurs des résultats réalistes et utiles en contexte médical.

N'hésitez pas à adapter ce code et à ajouter d'autres fonctionnalités selon vos besoins.