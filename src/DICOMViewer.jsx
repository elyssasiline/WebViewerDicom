import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneTools from "cornerstone-tools";

// 📌 Configuration de Cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstone = cornerstone;

const DICOMViewer = ({ dicomFiles = [] }) => {
    const viewerRef = useRef(null);
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [annotations, setAnnotations] = useState([]);
    const [tool, setTool] = useState(null);
    const [drawing, setDrawing] = useState(false);
    const [startCoords, setStartCoords] = useState(null);

    useEffect(() => {
        if (!viewerRef.current || dicomFiles.length === 0) return;

        cornerstone.enable(viewerRef.current);
        loadDicomImage(0);

        // Ajouter les outils Pan et Zoom
        cornerstoneTools.addTool(cornerstoneTools.PanTool);
        cornerstoneTools.addTool(cornerstoneTools.ZoomTool);

        // Activer Pan (clic gauche) et Zoom (molette)
        cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 }); // Clic gauche pour déplacer
        cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 4 }); // Molette pour zoomer

        const canvas = canvasRef.current;
        ctxRef.current = canvas.getContext("2d");
        canvas.width = viewerRef.current.clientWidth;
        canvas.height = viewerRef.current.clientHeight;
    }, [dicomFiles]);

    useEffect(() => {
        drawAnnotations();
    }, [annotations]);

    const loadDicomImage = async (index) => {
        try {
            const imageId = `wadouri:${dicomFiles[index]}`;
            const image = await cornerstone.loadImage(imageId);
            cornerstone.displayImage(viewerRef.current, image);
        } catch (error) {
            console.error("❌ Erreur chargement DICOM :", error);
        }
    };

    const activateTool = (selectedTool) => {
        setTool(selectedTool);

        if (selectedTool === "pan") {
            cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
        } else if (selectedTool === "zoom") {
            cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 1 });
        } else {
            cornerstoneTools.setToolPassive("Pan");
            cornerstoneTools.setToolPassive("Zoom");
        }
    };

    const startDrawing = (event) => {
        if (!tool) return;
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;
        setStartCoords({ x, y });

        if (tool === "eraser") {
            setAnnotations((prev) => prev.filter(ann => {
                if (ann.type === "text") return Math.abs(ann.x - x) > 10 || Math.abs(ann.y - y) > 10;
                if (ann.type === "pen") {
                    ann.path = ann.path.filter(p => Math.abs(p.x - x) > 10 || Math.abs(p.y - y) > 10);
                    return ann.path.length > 0;
                }
                return true;
            }));
            return;
        }

        if (tool === "text") {
            const text = prompt("Entrez votre texte :");
            if (text) setAnnotations(prev => [...prev, { type: "text", x, y, text }]);
        } else {
            setDrawing(true);
        }
    };

    const draw = (event) => {
        if (!drawing || !tool) return;
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;
    
        const tempAnnotations = [...annotations];
    
        if (tool === "pen") {
            if (tempAnnotations.length > 0 && tempAnnotations[tempAnnotations.length - 1].type === "pen") {
                tempAnnotations[tempAnnotations.length - 1].path.push({ x, y });
            } else {
                tempAnnotations.push({ type: "pen", path: [{ x, y }] });
            }
        } else if (tool === "rectangle") {
            tempAnnotations.pop();
            tempAnnotations.push({ type: "rectangle", start: startCoords, end: { x, y } });
        } else if (tool === "line") {
            tempAnnotations.pop();
            tempAnnotations.push({ type: "line", start: startCoords, end: { x, y } });
        }
    
        setAnnotations(tempAnnotations);
        drawAnnotations();
    };
    
    const stopDrawing = () => {
        if (!drawing || !tool || !startCoords) return;
        setDrawing(false);
        setStartCoords(null);
        
        setAnnotations(prev => [
            ...prev,
            prev[prev.length - 1]
        ]);
        
        drawAnnotations();
    };    

    const drawAnnotations = () => {
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
        annotations.filter(ann => ann).forEach((ann) => { // Ajout du filtrage
            if (ann.type === "text") {
                ctx.fillStyle = "white";
                ctx.font = "14px Arial";
                ctx.fillText(ann.text, ann.x, ann.y);
            } else if (ann.type === "rectangle") {
                ctx.strokeStyle = "yellow";
                ctx.strokeRect(ann.start.x, ann.start.y, ann.end.x - ann.start.x, ann.end.y - ann.start.y);
            } else if (ann.type === "line") {
                ctx.strokeStyle = "yellow";
                ctx.beginPath();
                ctx.moveTo(ann.start.x, ann.start.y);
                ctx.lineTo(ann.end.x, ann.end.y);
                ctx.stroke();
            } else if (ann.type === "pen") {
                ctx.beginPath();
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 2;
                ann.path.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.stroke();
            }
        });
    };
    

    const clearCanvas = () => {
        setAnnotations([]);
    };

    const downloadAnnotatedImage = () => {
        const dicomCanvas = viewerRef.current.querySelector("canvas");
        const annotationCanvas = canvasRef.current;

        const mergedCanvas = document.createElement("canvas");
        mergedCanvas.width = dicomCanvas.width;
        mergedCanvas.height = dicomCanvas.height;

        const ctx = mergedCanvas.getContext("2d");
        ctx.drawImage(dicomCanvas, 0, 0);
        ctx.drawImage(annotationCanvas, 0, 0);

        const link = document.createElement("a");
        link.download = "dicom_annotated.png";
        link.href = mergedCanvas.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-96 h-96 border border-gray-400">
                <div
                    ref={viewerRef}
                    className="absolute inset-0"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                ></div>
                <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none"></canvas>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={() => activateTool("pen")}>✍️ Stylo</button>
                <button onClick={() => activateTool("eraser")}>🧽 Gomme</button>
                <button onClick={() => activateTool("rectangle")}>▭ Rectangle</button>
                <button onClick={() => activateTool("line")}>➖ Ligne</button>
                <button onClick={() => activateTool("text")}>🔤 Texte</button>
                <button onClick={clearCanvas}>🗑️ Effacer</button>
                <button onClick={downloadAnnotatedImage}>📥 Enregistrer</button>
                <button onClick={() => activateTool("pan")}>🖱️ Pan</button>
                <button onClick={() => activateTool("zoom")}>🔍 Zoom</button>
            </div>
        </div>
    );
};

export default DICOMViewer;