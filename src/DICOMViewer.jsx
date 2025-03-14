import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

// 📌 Configuration de Cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

const DICOMViewer = ({ dicomFiles = [] }) => {
    const viewerRef = useRef(null);
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [annotations, setAnnotations] = useState([]);
    const [tool, setTool] = useState(null);
    const [drawing, setDrawing] = useState(false);
    const [startCoords, setStartCoords] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [pencilSize, setPencilSize] = useState(2);
    const [pencilColor, setPencilColor] = useState("#000000");
    const [pencilOpacity, setPencilOpacity] = useState(1);

    useEffect(() => {
        if (!viewerRef.current || dicomFiles.length === 0) return;

        cornerstone.enable(viewerRef.current);
        loadDicomImage(0);

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

    const startDrawing = (event) => {
        if (!tool) return;
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;
        setStartCoords({ x, y });

        if (tool === "eraser") {
            setAnnotations(prev => {
                const updatedAnnotations = prev.filter(ann => {
                    if (ann.type === "text") return Math.abs(ann.x - x) > 10 || Math.abs(ann.y - y) > 10;
                    if (ann.type === "pen") {
                        ann.path = ann.path.filter(p => Math.abs(p.x - x) > 10 || Math.abs(p.y - y) > 10);
                        return ann.path.length > 0;
                    }
                    return true;
                });
                saveToHistory(updatedAnnotations);
                return updatedAnnotations;
            });
            return;
        }

        if (tool === "text") {
            const text = prompt("Entrez votre texte :");
            if (text) {
                setAnnotations(prev => {
                    const updatedAnnotations = [...prev, { type: "text", x, y, text, color: pencilColor }];
                    saveToHistory(updatedAnnotations);
                    return updatedAnnotations;
                });
            }
        } else {
            setDrawing(true);
        }
    };

    const draw = (event) => {
        if (!drawing || !tool) return;
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;

        setAnnotations(prev => {
            const updatedAnnotations = [...prev];

            if (tool === "pen") {
                if (updatedAnnotations.length > 0 && updatedAnnotations[updatedAnnotations.length - 1].type === "pen") {
                    updatedAnnotations[updatedAnnotations.length - 1].path.push({ x, y });
                } else {
                    updatedAnnotations.push({ 
                        type: "pen", 
                        path: [{ x, y }], 
                        color: pencilColor, 
                        size: pencilSize, 
                        opacity: pencilOpacity 
                    });
                }
            } else if (tool === "rectangle" || tool === "line") {
                if (updatedAnnotations.length > 0 && updatedAnnotations[updatedAnnotations.length - 1].temp) {
                    updatedAnnotations.pop();
                }
                updatedAnnotations.push({
                    type: tool,
                    start: startCoords,
                    end: { x, y },
                    color: pencilColor,
                    size: pencilSize,
                    opacity: pencilOpacity,
                    temp: true
                });
            }

            drawAnnotations(updatedAnnotations);
            return updatedAnnotations;
        });
    };

    const stopDrawing = () => {
        if (!drawing || !tool || !startCoords) return;
        setDrawing(false);
        setStartCoords(null);

        setAnnotations(prev => {
            const updatedAnnotations = prev.map(ann => ({ ...ann, temp: false }));
            saveToHistory(updatedAnnotations);
            return updatedAnnotations;
        });

        drawAnnotations();
    };

    const drawAnnotations = (annotationsToDraw = annotations) => {
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        annotationsToDraw.forEach((ann) => {
            ctx.globalAlpha = ann.opacity;
            ctx.strokeStyle = ann.color;
            ctx.lineWidth = ann.size;

            if (ann.type === "text") {
                ctx.fillStyle = ann.color;
                ctx.font = "14px Arial";
                ctx.fillText(ann.text, ann.x, ann.y);
            } else if (ann.type === "rectangle") {
                ctx.strokeRect(ann.start.x, ann.start.y, ann.end.x - ann.start.x, ann.end.y - ann.start.y);
            } else if (ann.type === "line") {
                ctx.beginPath();
                ctx.moveTo(ann.start.x, ann.start.y);
                ctx.lineTo(ann.end.x, ann.end.y);
                ctx.stroke();
            } else if (ann.type === "pen") {
                ctx.beginPath();
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

    const saveToHistory = (newAnnotations) => {
        setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newAnnotations]);
        setHistoryIndex(prevIndex => prevIndex + 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prevIndex => prevIndex - 1);
            setAnnotations(history[historyIndex - 1]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prevIndex => prevIndex + 1);
            setAnnotations(history[historyIndex + 1]);
        }
    };

    const clearCanvas = () => {
        setAnnotations([]);
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

            {/* Barre d'outils */}
            <div className="flex gap-2 mt-2">
                <button onClick={() => setTool("pen")}>✍️ Stylo</button>
                <button onClick={() => setTool("eraser")}>🧽 Gomme</button>
                <button onClick={() => setTool("rectangle")}>▭ Rectangle</button>
                <button onClick={() => setTool("line")}>➖ Ligne</button>
                <button onClick={undo}>↩️ Annuler</button>
                <button onClick={redo}>↪️ Rétablir</button>
                <button onClick={clearCanvas}>🗑️ Effacer</button>
            </div>

            {/* Interface de personnalisation */}
            <div className="flex gap-4 mt-4 bg-gray-100 p-2 rounded">
                <label className="flex items-center">
                    Couleur
                    <input 
                        type="color" 
                        value={pencilColor} 
                        onChange={(e) => setPencilColor(e.target.value)} 
                        className="ml-2"
                    />
                </label>

                <label className="flex items-center">
                    Épaisseur
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={pencilSize} 
                        onChange={(e) => setPencilSize(Number(e.target.value))} 
                        className="ml-2"
                    />
                </label>

                <label className="flex items-center">
                    Opacité
                    <input 
                        type="range" 
                        min="0.1" 
                        max="1" 
                        step="0.1" 
                        value={pencilOpacity} 
                        onChange={(e) => setPencilOpacity(Number(e.target.value))} 
                        className="ml-2"
                    />
                </label>
            </div>
        </div>
    );
};

export default DICOMViewer;