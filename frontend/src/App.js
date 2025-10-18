import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Trash2,
  Save,
  Download,
  ImageIcon,
  Type,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:3000/api";

const MemeTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [zones, setZones] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentZone, setCurrentZone] = useState(null);
  const [zoneType, setZoneType] = useState("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (err) {
      setError("Failed to load templates. Make sure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setZones([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setDrawStart(coords);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const coords = getCanvasCoordinates(e);
    setCurrentZone({
      x: Math.min(drawStart.x, coords.x),
      y: Math.min(drawStart.y, coords.y),
      width: Math.abs(coords.x - drawStart.x),
      height: Math.abs(coords.y - drawStart.y),
    });
  };

  const handleMouseUp = () => {
    if (
      isDrawing &&
      currentZone &&
      currentZone.width > 10 &&
      currentZone.height > 10
    ) {
      const canvas = canvasRef.current;
      const newZone = {
        type: zoneType,
        x: currentZone.x / canvas.width,
        y: currentZone.y / canvas.height,
        width: currentZone.width / canvas.width,
        height: currentZone.height / canvas.height,
        fontSize: zoneType === "text" ? 32 : null,
        fontColor: zoneType === "text" ? "#ffffff" : null,
        textAlign: zoneType === "text" ? "center" : null,
        verticalAlign: zoneType === "text" ? "middle" : null,
        zIndex: zones.length,
      };
      setZones([...zones, newZone]);
    }
    setIsDrawing(false);
    setCurrentZone(null);
    setDrawStart(null);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    if (!img || !img.complete) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    zones.forEach((zone, idx) => {
      ctx.strokeStyle = zone.type === "text" ? "#3b82f6" : "#10b981";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        zone.x * canvas.width,
        zone.y * canvas.height,
        zone.width * canvas.width,
        zone.height * canvas.height
      );

      ctx.fillStyle =
        zone.type === "text" ? "rgba(59,130,246,0.2)" : "rgba(16,185,129,0.2)";
      ctx.fillRect(
        zone.x * canvas.width,
        zone.y * canvas.height,
        zone.width * canvas.width,
        zone.height * canvas.height
      );

      ctx.fillStyle = zone.type === "text" ? "#3b82f6" : "#10b981";
      ctx.font = "16px Arial";
      ctx.fillText(
        `${zone.type.toUpperCase()} #${idx + 1}`,
        zone.x * canvas.width + 5,
        zone.y * canvas.height + 20
      );
    });

    if (currentZone) {
      ctx.strokeStyle = zoneType === "text" ? "#3b82f6" : "#10b981";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        currentZone.x,
        currentZone.y,
        currentZone.width,
        currentZone.height
      );
      ctx.setLineDash([]);
    }
  }, [zones, currentZone, zoneType]);

  useEffect(() => {
    if (imagePreview) drawCanvas();
  }, [zones, currentZone, imagePreview, drawCanvas]);

  const saveTemplate = async () => {
    if (
      !templateName ||
      (!imageFile && !currentTemplate) ||
      zones.length === 0
    ) {
      alert(
        "Please provide a template name, upload an image, and define at least one zone"
      );
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", templateName);
      formData.append("category", category);
      formData.append(
        "tags",
        JSON.stringify(
          tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        )
      );
      formData.append("zones", JSON.stringify(zones));

      if (imageFile) {
        formData.append("image", imageFile);
        const img = imageRef.current;
        formData.append("width", img.naturalWidth);
        formData.append("height", img.naturalHeight);
      }

      const url = currentTemplate
        ? `${API_URL}/templates/${currentTemplate._id}`
        : `${API_URL}/templates`;

      const method = currentTemplate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        await fetchTemplates();
        resetForm();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to save template: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentTemplate(null);
    setTemplateName("");
    setCategory("general");
    setTags("");
    setImageFile(null);
    setImagePreview(null);
    setZones([]);
  };

  const loadTemplate = async (template) => {
    setCurrentTemplate(template);
    setTemplateName(template.name);
    setCategory(template.category || "general");
    setTags(template.tags?.join(", ") || "");
    setZones(template.zones || []);
    setImagePreview(`${API_URL.replace("/api", "")}${template.imageUrl}`);
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/templates/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        await fetchTemplates();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to delete template: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteZone = (idx) => {
    setZones(zones.filter((_, i) => i !== idx));
  };

  const updateZoneProperty = (idx, property, value) => {
    setZones(
      zones.map((z, i) => (i === idx ? { ...z, [property]: value } : z))
    );
  };

  const exportTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/templates`);
      const data = await response.json();

      if (data.success) {
        const dataStr = JSON.stringify(data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "meme-templates.json";
        link.click();
      }
    } catch (err) {
      alert("Failed to export templates: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Meme Template Manager
              </h1>
              <p className="text-gray-600">
                Upload templates and define text/image zones - Connected to
                MongoDB
              </p>
            </div>
            <button
              onClick={fetchTemplates}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">
                {currentTemplate ? "Edit Template" : "Create New Template"}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Drake Hotline Bling"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="general">General</option>
                    <option value="reaction">Reaction</option>
                    <option value="comparison">Comparison</option>
                    <option value="advice">Advice</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="funny, viral, popular"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Upload Image *
                </label>
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="text-center">
                    <Upload className="mx-auto mb-2" size={32} />
                    <span className="text-sm text-gray-600">
                      {imageFile
                        ? imageFile.name
                        : "Click to upload meme template"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreview && (
                <>
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => setZoneType("text")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        zoneType === "text"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <Type size={18} />
                      Draw Text Zone
                    </button>
                    <button
                      onClick={() => setZoneType("image")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        zoneType === "image"
                          ? "bg-green-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <ImageIcon size={18} />
                      Draw Image Zone
                    </button>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden relative">
                    <img
                      ref={imageRef}
                      src={imagePreview}
                      alt="Template"
                      className="hidden"
                      onLoad={drawCanvas}
                      crossOrigin="anonymous"
                    />
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="w-full cursor-crosshair"
                    />
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Click and drag to define zones where text or images will be
                    placed
                  </p>
                </>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  onClick={saveTemplate}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading
                    ? "Saving..."
                    : currentTemplate
                    ? "Update Template"
                    : "Save Template"}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Clear
                </button>
              </div>
            </div>

            {zones.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">
                  Zone Configuration ({zones.length})
                </h2>
                <div className="space-y-4">
                  {zones.map((zone, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">
                          {zone.type === "text" ? "📝" : "🖼️"} Zone #{idx + 1} (
                          {zone.type})
                        </h3>
                        <button
                          onClick={() => deleteZone(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Position:</span>{" "}
                          {(zone.x * 100).toFixed(1)}%,{" "}
                          {(zone.y * 100).toFixed(1)}%
                        </div>
                        <div>
                          <span className="font-medium">Size:</span>{" "}
                          {(zone.width * 100).toFixed(1)}% ×{" "}
                          {(zone.height * 100).toFixed(1)}%
                        </div>
                      </div>

                      {zone.type === "text" && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="text-xs font-medium">
                              Font Size
                            </label>
                            <input
                              type="number"
                              value={zone.fontSize}
                              onChange={(e) =>
                                updateZoneProperty(
                                  idx,
                                  "fontSize",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">
                              Font Color
                            </label>
                            <input
                              type="color"
                              value={zone.fontColor}
                              onChange={(e) =>
                                updateZoneProperty(
                                  idx,
                                  "fontColor",
                                  e.target.value
                                )
                              }
                              className="w-full h-8 border rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">
                              Horizontal Align
                            </label>
                            <select
                              value={zone.textAlign}
                              onChange={(e) =>
                                updateZoneProperty(
                                  idx,
                                  "textAlign",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium">
                              Vertical Align
                            </label>
                            <select
                              value={zone.verticalAlign}
                              onChange={(e) =>
                                updateZoneProperty(
                                  idx,
                                  "verticalAlign",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              <option value="top">Top</option>
                              <option value="middle">Middle</option>
                              <option value="bottom">Bottom</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Saved Templates ({templates.length})
                </h2>
                {templates.length > 0 && (
                  <button
                    onClick={exportTemplates}
                    className="text-blue-500 hover:text-blue-700"
                    title="Export all templates"
                  >
                    <Download size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {loading && templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading templates...
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No templates yet. Create your first one!
                  </div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template._id}
                      className="border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex gap-3">
                        <img
                          src={`${API_URL.replace("/api", "")}${
                            template.imageUrl
                          }`}
                          alt={template.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {template.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {template.category}
                          </p>
                          <p className="text-xs text-gray-600">
                            {template.zones?.length || 0} zones
                          </p>
                          <p className="text-xs text-gray-500">
                            {template.zones?.filter((z) => z.type === "text")
                              .length || 0}{" "}
                            text,
                            {template.zones?.filter((z) => z.type === "image")
                              .length || 0}{" "}
                            image
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => loadTemplate(template)}
                              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTemplate(template._id)}
                              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <h3 className="font-semibold mb-2">💡 How it works:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>1. Upload a meme template image</li>
                <li>2. Select zone type (Text or Image)</li>
                <li>3. Click and drag to define zones</li>
                <li>4. Configure text properties if needed</li>
                <li>5. Save to MongoDB database</li>
                <li>6. Use templates in your automation</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-sm">
              <h3 className="font-semibold mb-2">🗄️ Backend Status:</h3>
              <p className="text-gray-700">
                {error ? (
                  <span className="text-red-600">❌ Backend not connected</span>
                ) : (
                  <span className="text-green-600">
                    ✅ Connected to MongoDB
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-600 mt-2">API: {API_URL}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeTemplateManager;
