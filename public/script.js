/*
document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("dicom-container");

    // Vérifier si Cornerstone WADO est bien chargé
    if (typeof cornerstoneWADOImageLoader === 'undefined') {
        console.error("❌ cornerstoneWADOImageLoader n'est pas chargé !");
        return;
    }

    // Activer Cornerstone sur l'élément HTML
    cornerstone.enable(container);

    // Configuration du loader WADO
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.configure({
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Accept', 'application/dicom');
        }
    });

    // Vérifier que l'image est accessible
    const imageId = "wadouri:http://localhost:3000/dicom/image-00000.dcm";

    // Charger et afficher l’image DICOM
    cornerstone.loadImage(imageId).then(function(image) {
        cornerstone.displayImage(container, image);
    }).catch(error => {
        console.error("❌ Erreur lors du chargement de l'image DICOM :", error);
    });
});
*/