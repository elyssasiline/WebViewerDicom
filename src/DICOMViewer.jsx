import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import dicomParser from "dicom-parser";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

// Configuration de Cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

function DICOMViewer({ dicomFiles = [] }) {
  // Références pour le conteneur DICOM et le canvas overlay
  const viewerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // États pour Cornerstone
  const [pixelSpacing, setPixelSpacing] = useState({ x: 1, y: 1 });

  // États pour le mode (Pan, Zoom, Texte, Ligne) et l’outil (pencil, eraser, formes…)
  const [mode, setMode] = useState("default"); // "pan", "zoom", "annotationText", "annotationLine", "default"
  const [tool, setTool] = useState("default"); // "pencil", "eraser", "rectangle" (pour formes), "default"

  // États pour les annotations text/ligne
  const [annotations, setAnnotations] = useState([]);
  const [lineStart, setLineStart] = useState(null);

  // États pour les formes dessinées (stylo, rectangle, etc.)
  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // États pour le pan
  const [isPanActive, setIsPanActive] = useState(false);
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });

  // Historique (undo/redo)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Options pour stylo et formes
  const [pencilSize, setPencilSize] = useState(2);
  const [pencilColor, setPencilColor] = useState("#000000");
  const [pencilOpacity, setPencilOpacity] = useState(1);

  // Options pour formes (uniquement accessibles via le menu déroulant)
  const [shapeSize, setShapeSize] = useState(2);
  const [shapeColor, setShapeColor] = useState("#000000");
  const [shapeOpacity, setShapeOpacity] = useState(1);
  const [shapeType, setShapeType] = useState("rectangle"); // valeur par défaut

  /*******************************************
   *   1) INITIALISATION & CHARGEMENT DICOM  *
   *******************************************/
  useEffect(() => {
    if (!viewerRef.current || dicomFiles.length === 0) return;

    // Activer Cornerstone sur le conteneur
    cornerstone.enable(viewerRef.current);

    // Charger la première image DICOM (adapter selon vos besoins)
    loadDicomImage(0);

    // Préparer le canvas overlay
    const canvas = canvasRef.current;
    ctxRef.current = canvas.getContext("2d");
    canvas.width = viewerRef.current.clientWidth;
    canvas.height = viewerRef.current.clientHeight;

    // Initialiser l'historique avec un tableau vide
    saveHistory([]);
  }, [dicomFiles]);

  // Charge l'image DICOM à l'index donné
  const loadDicomImage = async (index) => {
    try {
      const imageId = `wadouri:${dicomFiles[index]}`;
      const image = await cornerstone.loadImage(imageId);
      cornerstone.displayImage(viewerRef.current, image);

      // Vérifier si l'image contient le PixelSpacing (0028,0030)
      if (image.data && image.data.string("x00280030")) {
        const spacingString = image.data.string("x00280030");
        const spacingArr = spacingString.split("\\");
        setPixelSpacing({
          x: parseFloat(spacingArr[0]),
          y: parseFloat(spacingArr[1]),
        });
      }
    } catch (error) {
      console.error("❌ Erreur chargement DICOM :", error);
    }
  };

  /****************************************************
   *   2) REDESSIN DU CANVAS OVERLAY (annotations & formes)
   ****************************************************/
  useEffect(() => {
    redrawOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations, shapes, currentShape]);

  // Conversion coordonnées Canvas <-> Image
  const canvasToImage = (pos) =>
    cornerstone.canvasToPixel(viewerRef.current, pos);
  const imageToCanvas = (pos) =>
    cornerstone.pixelToCanvas(viewerRef.current, pos);

  // Redessiner l’overlay (annotations + formes)
  const redrawOverlay = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // 1) Dessiner les annotations (texte et lignes de mesure)
    annotations.forEach((ann) => {
      if (ann.type === "text") {
        const anchorCanvas = imageToCanvas({ x: ann.x, y: ann.y });
        const textOffset = { x: 70, y: 0 };
        const textPos = {
          x: anchorCanvas.x + textOffset.x,
          y: anchorCanvas.y + textOffset.y,
        };

        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(anchorCanvas.x, anchorCanvas.y);
        ctx.lineTo(textPos.x - 10, textPos.y);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "14px Arial";
        const textW = ctx.measureText(ann.text).width;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(textPos.x - 3, textPos.y - 14, textW + 6, 18);
        ctx.fillStyle = "black";
        ctx.fillText(ann.text, textPos.x, textPos.y);
      } else if (ann.type === "line") {
        const start = imageToCanvas(ann.start);
        const end = imageToCanvas(ann.end);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = "#39FF14";
        ctx.lineWidth = 2;
        ctx.stroke();

        const dx = ann.end.x - ann.start.x;
        const dy = ann.end.y - ann.start.y;
        const distanceMM = Math.sqrt(
          (dx * pixelSpacing.x) ** 2 + (dy * pixelSpacing.y) ** 2
        );
        const distanceCM = distanceMM / 10;
        const mid = {
          x: (start.x + end.x) / 2,
          y: (start.y + end.y) / 2,
        };
        ctx.fillStyle = "blue";
        ctx.font = "14px Arial";
        ctx.fillText(`${distanceCM.toFixed(2)} cm`, mid.x, mid.y);
      }
    });

    // 2) Dessiner les formes "validées"
    shapes.forEach((shape) => {
      drawShape(ctx, shape);
    });

    // 3) Dessiner la forme en cours de dessin
    if (currentShape) {
      drawShape(ctx, currentShape);
    }
  };

  // Fonction qui dessine une forme (pencil, rectangle, circle, polygon, etc.)
  const drawShape = (ctx, shape) => {
    ctx.save();
    ctx.globalAlpha = shape.opacity;
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = shape.lineWidth;

    if (shape.type === "pencil") {
      ctx.beginPath();
      shape.points.forEach((pt, i) => {
        const cpt = imageToCanvas(pt);
        if (i === 0) ctx.moveTo(cpt.x, cpt.y);
        else ctx.lineTo(cpt.x, cpt.y);
      });
      ctx.lineCap = "round";
      ctx.stroke();
    } else if (shape.type === "rectangle") {
      const start = imageToCanvas(shape.start);
      const end = imageToCanvas(shape.end);
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      ctx.strokeRect(x, y, w, h);
    } else if (shape.type === "circle") {
      const center = imageToCanvas(shape.center);
      const edge = imageToCanvas({
        x: shape.center.x + shape.radius,
        y: shape.center.y,
      });
      const r = Math.hypot(edge.x - center.x, edge.y - center.y);
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (["polygon", "hexagon"].includes(shape.type)) {
      // Polygones réguliers (5 ou 6 côtés)
      const center = imageToCanvas(shape.center);
      const edge = imageToCanvas({
        x: shape.center.x + shape.radius,
        y: shape.center.y,
      });
      const r = Math.hypot(edge.x - center.x, edge.y - center.y);
      const sides = shape.type === "polygon" ? 5 : 6;
      drawRegularPolygon(ctx, center, r, sides);
    }
    ctx.restore();
  };

  // Fonction utilitaire pour dessiner un polygone régulier
  const drawRegularPolygon = (ctx, center, radius, sides) => {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  };

  /***********************************
   *   3) GESTION DE L'HISTORIQUE    *
   ***********************************/
  const saveHistory = (newShapes) => {
    const truncated = history.slice(0, historyIndex + 1);
    const snapshot = newShapes
      ? JSON.parse(JSON.stringify(newShapes))
      : JSON.parse(JSON.stringify(shapes));
    const updated = [...truncated, snapshot];
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setShapes(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setShapes(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  // Efface seulement les formes
  const clearShapes = () => {
    setShapes([]);
    saveHistory([]);
  };

  // Efface seulement les annotations
  const clearAnnotations = () => {
    setAnnotations([]);
  };

  /***************************************
   *   4) GESTION DES ÉVÈNEMENTS SOURIS  *
   ***************************************/
  const handleMouseDown = (e) => {
    const rect = viewerRef.current.getBoundingClientRect();
    const canvasPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const imagePos = canvasToImage(canvasPos);

    // Priorité aux outils de dessin
    if (tool !== "default") {
      if (tool === "pencil") {
        setIsDrawing(true);
        setCurrentShape({
          type: "pencil",
          points: [imagePos],
          color: pencilColor,
          lineWidth: pencilSize,
          opacity: pencilOpacity,
        });
      } else if (tool === "eraser") {
        // Supprimer la première forme "touchée"
        let foundIndex = -1;
        for (let i = shapes.length - 1; i >= 0; i--) {
          if (hitTestShape(shapes[i], imagePos, 5)) {
            foundIndex = i;
            break;
          }
        }
        if (foundIndex !== -1) {
          const newShapes = [...shapes];
          newShapes.splice(foundIndex, 1);
          setShapes(newShapes);
          saveHistory(newShapes);
        }
      } else {
        // Pour les formes (rectangle, circle, polygon, hexagon, etc.)
        setIsDrawing(true);
        setCurrentShape({
          type: tool,
          start: imagePos,
          end: imagePos,
          color: shapeColor,
          lineWidth: shapeSize,
          opacity: shapeOpacity,
        });
      }
      return;
    }

    // Sinon, si un mode annotation est actif
    if (mode !== "default") {
      if (mode === "annotationText" && e.button === 0) {
        const text = prompt("Entrez votre texte :");
        if (text) {
          setAnnotations((prev) => [...prev, { type: "text", x: imagePos.x, y: imagePos.y, text }]);
        }
        setMode("default");
      } else if (mode === "annotationLine" && e.button === 0) {
        setLineStart({ x: imagePos.x, y: imagePos.y });
      } else if (mode === "pan" && e.button === 0) {
        setIsPanActive(true);
        setLastPan({ x: e.pageX, y: e.pageY });
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = viewerRef.current.getBoundingClientRect();
    const canvasPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const imagePos = canvasToImage(canvasPos);

    // Dessin en direct
    if (tool !== "default" && isDrawing && currentShape) {
      if (currentShape.type === "pencil") {
        setCurrentShape((prev) => ({
          ...prev,
          points: [...prev.points, imagePos],
        }));
      } else if (["circle", "polygon", "hexagon"].includes(currentShape.type)) {
        // Mise à jour du centre et du rayon pour polygones/cercle
        const center = {
          x: (currentShape.start.x + imagePos.x) / 2,
          y: (currentShape.start.y + imagePos.y) / 2,
        };
        const dx = imagePos.x - currentShape.start.x;
        const dy = imagePos.y - currentShape.start.y;
        const radius = Math.hypot(dx, dy) / 2;
        setCurrentShape((prev) => ({
          ...prev,
          end: imagePos,
          center,
          radius,
        }));
      } else {
        // rectangle ou arrow / doubleArrow
        setCurrentShape((prev) => ({ ...prev, end: imagePos }));
      }
    }
    // Mode annotation ligne (aperçu)
    else if (mode === "annotationLine" && lineStart) {
      redrawOverlay();
      const ctx = ctxRef.current;
      const startCanvas = imageToCanvas(lineStart);
      const endCanvas = imageToCanvas(imagePos);
      ctx.beginPath();
      ctx.strokeStyle = "#39FF14";
      ctx.lineWidth = 2;
      ctx.moveTo(startCanvas.x, startCanvas.y);
      ctx.lineTo(endCanvas.x, endCanvas.y);
      ctx.stroke();
    }
    // Mode pan
    else if (mode === "pan" && isPanActive) {
      const dx = e.pageX - lastPan.x;
      const dy = e.pageY - lastPan.y;
      setLastPan({ x: e.pageX, y: e.pageY });
      const viewport = cornerstone.getViewport(viewerRef.current);
      viewport.translation.x += dx;
      viewport.translation.y += dy;
      cornerstone.setViewport(viewerRef.current, viewport);
    }
  };

  const handleMouseUp = (e) => {
    // Valider le dessin
    if (tool !== "default" && isDrawing && currentShape) {
      setShapes((prev) => {
        const newShapes = [...prev, currentShape];
        saveHistory(newShapes);
        return newShapes;
      });
      setCurrentShape(null);
      setIsDrawing(false);
      // Pour les outils de formes (autre que le stylo), réinitialiser l'outil
      if (tool !== "pencil") {
        setTool("default");
      }
    }
    // Valider l'annotation de ligne
    else if (mode === "annotationLine" && lineStart) {
      const rect = viewerRef.current.getBoundingClientRect();
      const canvasPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const imagePos = canvasToImage(canvasPos);
      setAnnotations((prev) => [
        ...prev,
        { type: "line", start: { ...lineStart }, end: { x: imagePos.x, y: imagePos.y } },
      ]);
      setLineStart(null);
      setMode("default");
    }
    // Fin du pan
    else if (mode === "pan") {
      setIsPanActive(false);
    }
  };

  const handleMouseLeave = () => {
    if (isDrawing && currentShape) {
      setShapes((prev) => {
        const newShapes = [...prev, currentShape];
        saveHistory(newShapes);
        return newShapes;
      });
      setCurrentShape(null);
      setIsDrawing(false);
    }
    setIsPanActive(false);
  };

  /***********************************
   *   5) GESTION DU ZOOM (MOLETTE)  *
   ***********************************/
  const handleWheel = (e) => {
    if (mode === "zoom") {
      e.preventDefault();
      e.stopPropagation();
      const viewport = cornerstone.getViewport(viewerRef.current);
      const zoomFactor = 1.1;
      if (e.deltaY < 0) {
        viewport.scale *= zoomFactor;
      } else {
        viewport.scale /= zoomFactor;
      }
      cornerstone.setViewport(viewerRef.current, viewport);
      redrawOverlay();
    }
  };

  /************************************
   *   6) OUTILS DE DESSIN & GOMME    *
   ************************************/
  const hitTestShape = (shape, point, threshold) => {
    if (shape.type === "rectangle") {
      const minX = Math.min(shape.start.x, shape.end.x);
      const maxX = Math.max(shape.start.x, shape.end.x);
      const minY = Math.min(shape.start.y, shape.end.y);
      const maxY = Math.max(shape.start.y, shape.end.y);
      return (
        point.x >= minX - threshold &&
        point.x <= maxX + threshold &&
        point.y >= minY - threshold &&
        point.y <= maxY + threshold
      );
    } 
    else if (["polygon", "hexagon"].includes(shape.type)) {
      const center = shape.center;
      const r = shape.radius;
      return (
        point.x >= center.x - r - threshold &&
        point.x <= center.x + r + threshold &&
        point.y >= center.y - r - threshold &&
        point.y <= center.y + r + threshold
      );
    } 
    else if (shape.type === "pencil") {
      for (let i = 0; i < shape.points.length - 1; i++) {
        if (distanceToSegment(point, shape.points[i], shape.points[i + 1]) < threshold) {
          return true;
        }
      }
      return false;
    }
    return false;
  };

  const distanceToSegment = (pt, v, w) => {
    const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
    if (l2 === 0) return Math.hypot(pt.x - v.x, pt.y - v.y);
    let t = ((pt.x - v.x) * (w.x - v.x) + (pt.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(
      pt.x - (v.x + t * (w.x - v.x)),
      pt.y - (v.y + t * (w.y - v.y))
    );
  };

  /************************************
   *   7) FUSION & TÉLÉCHARGEMENT      *
   ************************************/
  const downloadFusion = () => {
    if (!viewerRef.current) return;
    const canvases = viewerRef.current.querySelectorAll("canvas");
    let baseCanvas = null;
    canvases.forEach((c) => {
      if (c !== canvasRef.current) baseCanvas = c;
    });
    if (!baseCanvas) {
      console.error("Base canvas introuvable");
      return;
    }
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = viewerRef.current.clientWidth;
    tempCanvas.height = viewerRef.current.clientHeight;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(baseCanvas, 0, 0);
    tempCtx.drawImage(canvasRef.current, 0, 0);
    const link = document.createElement("a");
    link.download = "dicom_annotated.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  /****************************************
   *       8) RENDU DU COMPOSANT          *
   ****************************************/
  return (
    <div className="flex flex-col items-center p-4">
      {/* Barre d'outils (modes) */}
      <div className="flex gap-2 mb-2">
        <button onClick={() => setMode("pan")}>🖐️ Pan</button>
        <button onClick={() => setMode("zoom")}>🔍 Zoom</button>
        <button onClick={() => setMode("annotationText")}>📝 Texte</button>
        <button onClick={() => setMode("annotationLine")}>📏 Ligne</button>
        <button onClick={downloadFusion}>📥 Télécharger</button>
      </div>

      {/* Barre d'outils (dessin) */}
      <div className="flex gap-2 mb-2">
        <button onClick={() => setTool("pencil")}>🖊️ Stylo</button>
        <button onClick={() => setTool("eraser")}>🧽 Gomme</button>
        {/* Bouton unique "Formes" : il active le menu déroulant dans les options */}
        <button
          onClick={() => {
            setTool("rectangle"); // Par défaut, la forme est "rectangle"
            setShapeType("rectangle");
          }}
        >
          📐 Formes
        </button>
        <button onClick={undo}>↩️ Annuler</button>
        <button onClick={redo}>↪️ Rétablir</button>
        <button onClick={clearShapes}>🗑️ Effacer dessin</button>
        {/* Bouton pour effacer uniquement les annotations */}
        <button onClick={clearAnnotations}>❌ Effacer annotations</button>
      </div>

      {/* Options pour le stylo */}
      {tool === "pencil" && (
        <div className="flex gap-4 mb-2 bg-gray-100 p-2 rounded">
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
              max="20"
              value={pencilSize}
              onChange={(e) => setPencilSize(Number(e.target.value))}
              className="ml-2"
            />
          </label>
          <label className="flex items-center">
            Opacité
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={pencilOpacity}
              onChange={(e) => setPencilOpacity(Number(e.target.value))}
              className="ml-2"
            />
          </label>
        </div>
      )}

      {/* Options pour les formes via le menu déroulant */}
      {["rectangle"].includes(tool) && (
        <div className="flex gap-4 mb-2 bg-gray-100 p-2 rounded">
          <label className="flex items-center">
            Forme
            <select
              value={shapeType}
              onChange={(e) => {
                setShapeType(e.target.value);
                setTool(e.target.value);
              }}
              className="ml-2"
            >
              <option value="rectangle">🔷 Rectangle</option>
              <option value="circle">🔵 Cercle</option>
              <option value="polygon">⭐ Polygone</option>
              <option value="hexagon">⬡ Hexagone</option>
              <option value="arrow">➡️ Flèche</option>
              <option value="doubleArrow">↔️ Double Flèche</option>
            </select>
          </label>
          <label className="flex items-center">
            Épaisseur
            <input
              type="range"
              min="1"
              max="20"
              value={shapeSize}
              onChange={(e) => setShapeSize(Number(e.target.value))}
              className="ml-2"
            />
          </label>
          <label className="flex items-center">
            Couleur
            <input
              type="color"
              value={shapeColor}
              onChange={(e) => setShapeColor(e.target.value)}
              className="ml-2"
            />
          </label>
          <label className="flex items-center">
            Opacité
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={shapeOpacity}
              onChange={(e) => setShapeOpacity(Number(e.target.value))}
              className="ml-2"
            />
          </label>
        </div>
      )}

      {/* Conteneur Cornerstone + Canvas overlay */}
      <div
        ref={viewerRef}
        className="relative border border-gray-400"
        style={{ width: 600, height: 600 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}

export default DICOMViewer;
