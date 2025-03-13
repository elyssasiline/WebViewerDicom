import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

// 📌 Configuration de Cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

const DICOMViewer = ({ dicomFiles = [] }) => {
    const viewerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!viewerRef.current || dicomFiles.length === 0) return;

        cornerstone.enable(viewerRef.current);
        loadDicomImage(currentIndex);
    }, [currentIndex, dicomFiles]);

    const loadDicomImage = async (index) => {
        if (!viewerRef.current || dicomFiles.length === 0) return;
        try {
            const imageId = `wadouri:${dicomFiles[index]}`;
            console.log("Chargement de l'image DICOM :", imageId);

            const image = await cornerstone.loadImage(imageId);
            const viewportElement = viewerRef.current;

            // ✅ Vérifier que viewerRef est bien activé avant d'afficher
            if (!cornerstone.getEnabledElement(viewportElement)) {
                console.warn("❌ Cornerstone non activé, tentative d'activation.");
                cornerstone.enable(viewportElement);
            }

            cornerstone.displayImage(viewportElement, image);

            // 📌 Activation des outils (Zoom, Pan)
            cornerstoneTools.addStackStateManager(viewportElement, ["stack"]);
            cornerstoneTools.addToolState(viewportElement, "stack", {
                imageIds: dicomFiles.map((url) => `wadouri:${url}`),
                currentImageIdIndex: index,
            });

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
            {/* 📌 Viewer DICOM */}
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
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                    disabled={currentIndex === 0}
                >
                    ↼
                </button>
                <button
                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, dicomFiles.length - 1))}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                    disabled={currentIndex === dicomFiles.length - 1}
                >
                    ⇀
                </button>
            </div>
        </div>
    );
};

export default DICOMViewer;
