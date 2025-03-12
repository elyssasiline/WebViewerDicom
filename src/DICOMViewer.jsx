import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

// 📌 Configuration de Cornerstone v4 et du WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.configure({
    beforeSend: (xhr) => {
        xhr.setRequestHeader("Accept", "application/dicom");
    },
});

const DICOMViewer = () => {
    const viewerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!viewerRef.current) return;

        cornerstone.enable(viewerRef.current); // Active le rendering
        loadDicomImage(currentIndex);
    }, [currentIndex]);

    const getDicomUrl = (index) => {
        return `wadouri:dicom-files/image-${String(index).padStart(5, "0")}.dcm`;
    };    

    const loadDicomImage = async (index) => {
        try {
            const imageId = getDicomUrl(index);
            console.log("Chargement de l'image DICOM :", imageId);

            const image = await cornerstone.loadImage(imageId);
            const viewportElement = viewerRef.current;
            
            cornerstone.displayImage(viewportElement, image); // Affiche l'image

            // 📌 Activation des outils (Zoom, Pan)
            const stackToolState = cornerstoneTools.getToolState(viewportElement, "stack");
            if (!stackToolState) {
                cornerstoneTools.addStackStateManager(viewportElement, ["stack"]);
                cornerstoneTools.addToolState(viewportElement, "stack", {
                    imageIds: [imageId],
                    currentImageIdIndex: 0,
                });
            }

            // 📌 Active les interactions utilisateur
            cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 2 });
            cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 4 });
        } catch (error) {
            console.error("❌ Erreur lors du chargement de l'image DICOM :", error);
        }
    };

    // 📌 Activation des outils via boutons
    const activatePan = () => cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
    const activateZoom = () => cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 1 });

    return (
        <div className="flex flex-col items-center gap-2">
            {/* 📌 Viewer DICOM (Sans titre ni description) */}
            <div className="w-96 h-96 border border-gray-400" ref={viewerRef}></div>

            {/* 📌 Boutons pour activer Zoom et Pan */}
            <div className="flex gap-4 mt-2">
                <button onClick={activateZoom} className="px-3 py-1 bg-blue-500 text-white rounded-md">
                    🔍 Zoom
                </button>
                <button onClick={activatePan} className="px-3 py-1 bg-green-500 text-white rounded-md">
                    ✋ Pan
                </button>
            </div>

            {/* 📌 Navigation entre les images */}
            <div className="flex gap-4 mt-2">
                <button
                    onClick={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                >
                    ⬅️
                </button>
                <button
                    onClick={() => setCurrentIndex(Math.min(currentIndex + 1, 29))}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                >
                    ➡️
                </button>
            </div>
        </div>
    );
};

export default DICOMViewer;
