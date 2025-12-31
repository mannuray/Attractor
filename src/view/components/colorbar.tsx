import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// =============================================================================
// Color Conversion Utilities
// =============================================================================

export interface RGB {
  red: number;
  green: number;
  blue: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      }
    : { red: 0, green: 0, blue: 0 };
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (diff / max) * 100;
  const v = max * 100;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff) % 6;
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s: Math.round(s), v: Math.round(v) };
}

function hsvToRgb(h: number, s: number, v: number): RGB {
  s /= 100;
  v /= 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    red: Math.round((r + m) * 255),
    green: Math.round((g + m) * 255),
    blue: Math.round((b + m) * 255),
  };
}

// =============================================================================
// Color Picker Popup Component
// =============================================================================

interface ColorPickerProps {
  color: RGB;
  position: { x: number; y: number };
  canDelete: boolean;
  onColorChange: (color: RGB) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ColorPickerPopup({
  color,
  position,
  canDelete,
  onColorChange,
  onDelete,
  onClose,
}: ColorPickerProps) {
  const squareRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);

  const [hsv, setHsv] = useState<HSV>(() => rgbToHsv(color.red, color.green, color.blue));
  const [hexInput, setHexInput] = useState(rgbToHex(color.red, color.green, color.blue));
  const [isDraggingSquare, setIsDraggingSquare] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  const drawSquare = useCallback(() => {
    const canvas = squareRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const baseColor = hsvToRgb(hsv.h, 100, 100);

    const gradientH = ctx.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, "#ffffff");
    gradientH.addColorStop(1, rgbToHex(baseColor.red, baseColor.green, baseColor.blue));
    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, width, height);

    const gradientV = ctx.createLinearGradient(0, 0, 0, height);
    gradientV.addColorStop(0, "rgba(0,0,0,0)");
    gradientV.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, width, height);
  }, [hsv.h]);

  const drawHueSlider = useCallback(() => {
    const canvas = hueRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 360; i += 60) {
      const rgb = hsvToRgb(i, 100, 100);
      gradient.addColorStop(i / 360, rgbToHex(rgb.red, rgb.green, rgb.blue));
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  useEffect(() => {
    drawSquare();
    drawHueSlider();
  }, [drawSquare, drawHueSlider]);

  useEffect(() => {
    const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    onColorChange(rgb);
    setHexInput(rgbToHex(rgb.red, rgb.green, rgb.blue));
  }, [hsv, onColorChange]);

  const handleSquareInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = squareRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setHsv((prev) => ({
      ...prev,
      s: Math.round((x / rect.width) * 100),
      v: Math.round(100 - (y / rect.height) * 100),
    }));
  };

  const handleHueInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHsv((prev) => ({ ...prev, h: Math.round((x / rect.width) * 360) }));
  };

  const handleRgbChange = (channel: "red" | "green" | "blue", value: string) => {
    const num = Math.max(0, Math.min(255, parseInt(value) || 0));
    const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    currentRgb[channel] = num;
    setHsv(rgbToHsv(currentRgb.red, currentRgb.green, currentRgb.blue));
  };

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const rgb = hexToRgb(value);
      setHsv(rgbToHsv(rgb.red, rgb.green, rgb.blue));
    }
  };

  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  return (
    <div
      data-picker="true"
      style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
        borderRadius: "18px",
        padding: "2px",
        boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(245, 158, 11, 0.25)",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div style={{
        background: "linear-gradient(135deg, #1a1214 0%, #2d1f1f 100%)",
        borderRadius: "16px",
        padding: "20px",
        width: "280px",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}>
          <span style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: "14px", fontWeight: 600 }}>Color Picker</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "20px",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Color Preview */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "12px",
            background: rgbToHex(currentRgb.red, currentRgb.green, currentRgb.blue),
            border: "3px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "11px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>HEX</div>
            <input
              type="text"
              value={hexInput.toUpperCase()}
              onChange={(e) => handleHexChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "14px",
                fontFamily: "monospace",
                fontWeight: 600,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "rgba(255, 255, 255, 0.95)",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Saturation/Value Square */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <canvas
            ref={squareRef}
            width={280}
            height={160}
            style={{
              width: "100%",
              height: "160px",
              borderRadius: "12px",
              cursor: "crosshair",
              display: "block",
            }}
            onMouseDown={(e) => { setIsDraggingSquare(true); handleSquareInteraction(e); }}
            onMouseMove={(e) => isDraggingSquare && handleSquareInteraction(e)}
            onMouseUp={() => setIsDraggingSquare(false)}
            onMouseLeave={() => setIsDraggingSquare(false)}
          />
          {/* Picker Indicator */}
          <div style={{
            position: "absolute",
            left: `${(hsv.s / 100) * 100}%`,
            top: `${((100 - hsv.v) / 100) * 160}px`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "3px solid #fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(0,0,0,0.2)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Hue Slider */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <canvas
            ref={hueRef}
            width={280}
            height={24}
            style={{
              width: "100%",
              height: "24px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "block",
            }}
            onMouseDown={(e) => { setIsDraggingHue(true); handleHueInteraction(e); }}
            onMouseMove={(e) => isDraggingHue && handleHueInteraction(e)}
            onMouseUp={() => setIsDraggingHue(false)}
            onMouseLeave={() => setIsDraggingHue(false)}
          />
          {/* Hue Indicator */}
          <div style={{
            position: "absolute",
            left: `${(hsv.h / 360) * 100}%`,
            top: "50%",
            width: "8px",
            height: "32px",
            borderRadius: "4px",
            border: "3px solid #fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Preset Colors */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "11px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Quick Colors</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
              "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#78350f",
            ].map((presetHex) => (
              <button
                key={presetHex}
                onClick={() => {
                  const rgb = hexToRgb(presetHex);
                  setHsv(rgbToHsv(rgb.red, rgb.green, rgb.blue));
                }}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: presetHex,
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  cursor: "pointer",
                  transition: "transform 0.1s ease, border-color 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }}
              />
            ))}
          </div>
        </div>

        {/* RGB Inputs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          {[
            { label: "R", value: currentRgb.red, key: "red" as const, color: "#ef4444" },
            { label: "G", value: currentRgb.green, key: "green" as const, color: "#22c55e" },
            { label: "B", value: currentRgb.blue, key: "blue" as const, color: "#3b82f6" },
          ].map(({ label, value, key, color }) => (
            <div key={key} style={{ flex: 1 }}>
              <div style={{
                color: color,
                fontSize: "11px",
                fontWeight: 600,
                marginBottom: "4px",
                textAlign: "center",
                textShadow: `0 0 10px ${color}40`,
              }}>
                {label}
              </div>
              <input
                type="number"
                min={0}
                max={255}
                value={value}
                onChange={(e) => handleRgbChange(key, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.95)",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          {canDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "13px",
                fontWeight: 600,
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
              }}
            >
              Delete Stop
            </button>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "13px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main ColorBar Component
// =============================================================================

interface Color {
  position: number;
  red: number;
  green: number;
  blue: number;
}

interface ColorBarProps {
  palletteArg: Color[];
  changePalletCallback: (palette: Color[]) => void;
}

function ColorBar({ palletteArg, changePalletCallback }: ColorBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState<Color[]>(palletteArg);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const hasMoved = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Cleanup click timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;

    let timeoutId: NodeJS.Timeout;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-picker]') || target.closest('[data-handle]') || target.closest('[data-colorbar]')) return;
      setPickerOpen(false);
      setSelectedIndex(null);
    };

    timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPickerOpen(false);
        setSelectedIndex(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mouse move handler for dragging
  useEffect(() => {
    if (draggingIndex === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      hasMoved.current = true;
      const rect = containerRef.current.getBoundingClientRect();
      let newPos = (e.clientX - rect.left) / rect.width;

      const prevPos = draggingIndex > 0 ? palette[draggingIndex - 1].position : 0;
      const nextPos = draggingIndex < palette.length - 1 ? palette[draggingIndex + 1].position : 1;
      newPos = Math.max(prevPos + 0.01, Math.min(nextPos - 0.01, newPos));

      setPalette(prev => {
        const newPalette = [...prev];
        newPalette[draggingIndex] = { ...newPalette[draggingIndex], position: newPos };
        return newPalette;
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      changePalletCallback(palette);
      const idx = draggingIndex;
      setDraggingIndex(null);

      // If user didn't drag, open the picker centered
      if (!hasMoved.current && idx !== null) {
        setSelectedIndex(idx);
        setPickerOpen(true);
      }
      hasMoved.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingIndex, palette, changePalletCallback]);

  const gradient = `linear-gradient(to right, ${palette
    .map((c) => `${rgbToHex(c.red, c.green, c.blue)} ${c.position * 100}%`)
    .join(", ")})`;

  const handleHandleClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(index);
    setPickerOpen(true);
  };

  const handleHandleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (index === 0 || index === palette.length - 1) {
      handleHandleClick(index, e);
      return;
    }
    setDraggingIndex(index);
    setSelectedIndex(index);
  };

  const handleColorChange = useCallback((color: RGB) => {
    if (selectedIndex === null) return;
    setPalette(prev => {
      const newPalette = [...prev];
      newPalette[selectedIndex] = {
        ...newPalette[selectedIndex],
        red: color.red,
        green: color.green,
        blue: color.blue,
      };
      changePalletCallback(newPalette);
      return newPalette;
    });
  }, [selectedIndex, changePalletCallback]);

  const handleDeleteStop = useCallback(() => {
    if (selectedIndex === null) return;
    setPalette(prev => {
      if (prev.length <= 2) return prev;
      if (selectedIndex === 0 || selectedIndex === prev.length - 1) return prev;
      const newPalette = prev.filter((_, i) => i !== selectedIndex);
      changePalletCallback(newPalette);
      return newPalette;
    });
    setPickerOpen(false);
    setSelectedIndex(null);
  }, [selectedIndex, changePalletCallback]);

  // Single click on bar - find nearest stop and open its picker
  // Uses timeout to distinguish from double-click
  const handleBarClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    // Clear any pending click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;

    // Find the nearest color stop
    let nearestIndex = 0;
    let nearestDistance = Math.abs(palette[0].position - clickPosition);
    for (let i = 1; i < palette.length; i++) {
      const distance = Math.abs(palette[i].position - clickPosition);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Delay to allow double-click to cancel this
    clickTimeoutRef.current = setTimeout(() => {
      setSelectedIndex(nearestIndex);
      setPickerOpen(true);
      clickTimeoutRef.current = null;
    }, 200);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Cancel pending single-click action
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;

    let insertIndex = palette.length;
    for (let i = 0; i < palette.length; i++) {
      if (palette[i].position > clickPosition) {
        insertIndex = i;
        break;
      }
    }

    const prevColor = palette[insertIndex - 1] || palette[0];
    const nextColor = palette[insertIndex] || palette[palette.length - 1];
    const t = (clickPosition - prevColor.position) / (nextColor.position - prevColor.position);

    const newColor: Color = {
      position: clickPosition,
      red: Math.round(prevColor.red + t * (nextColor.red - prevColor.red)),
      green: Math.round(prevColor.green + t * (nextColor.green - prevColor.green)),
      blue: Math.round(prevColor.blue + t * (nextColor.blue - prevColor.blue)),
    };

    const newPalette = [...palette.slice(0, insertIndex), newColor, ...palette.slice(insertIndex)];
    setPalette(newPalette);
    changePalletCallback(newPalette);

    setSelectedIndex(insertIndex);
    setPickerOpen(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Gradient Bar Container */}
      <div style={{ position: "relative", marginBottom: "40px" }}>
        {/* Gradient Bar */}
        <div
          ref={containerRef}
          data-colorbar="true"
          style={{
            width: "100%",
            height: "50px",
            background: gradient,
            borderRadius: "12px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
          }}
          onClick={handleBarClick}
          onDoubleClick={handleDoubleClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.01)";
            e.currentTarget.style.boxShadow = "0 6px 25px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)";
          }}
        />

        {/* Color Stops Row */}
        <div style={{
          display: "flex",
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-35px",
          height: "30px",
        }}>
          {containerWidth > 0 && palette.map((color, index) => {
            const hexColor = rgbToHex(color.red, color.green, color.blue);
            const left = color.position * containerWidth;
            const isFirst = index === 0;
            const isLast = index === palette.length - 1;
            const isSelected = selectedIndex === index;

            return (
              <div
                key={index}
                data-handle="true"
                style={{
                  position: "absolute",
                  left: `${left}px`,
                  transform: "translateX(-50%)",
                  cursor: isFirst || isLast ? "pointer" : "ew-resize",
                  zIndex: isSelected ? 10 : 1,
                  transition: "transform 0.15s ease",
                }}
                onMouseDown={(e) => handleHandleMouseDown(index, e)}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.transform = "translateX(-50%) scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(-50%)";
                }}
              >
                {/* Triangle handle filled with color */}
                <svg width="24" height="28" viewBox="0 0 24 28" style={{ filter: isSelected ? "drop-shadow(0 0 6px #f59e0b)" : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>
                  <path
                    d="M12 0 L24 28 L0 28 Z"
                    fill={hexColor}
                    stroke={isSelected ? "#f59e0b" : "#fff"}
                    strokeWidth="2"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        color: "rgba(255, 200, 150, 0.6)",
        fontSize: "12px",
        flexWrap: "wrap",
      }}>
        <span>
          <strong style={{ color: "#f59e0b" }}>Click</strong> to edit color
        </span>
        <span>
          <strong style={{ color: "#f59e0b" }}>Double-click</strong> to add stop
        </span>
        <span>
          <strong style={{ color: "#f59e0b" }}>Drag</strong> handles to reposition
        </span>
      </div>

      {/* Color Picker Popup */}
      {/* Color Picker Modal - rendered via Portal to overlay on top of everything */}
      {pickerOpen && selectedIndex !== null && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={() => {
            setPickerOpen(false);
            setSelectedIndex(null);
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ColorPickerPopup
              color={palette[selectedIndex]}
              position={{ x: 0, y: 0 }} // Position is now handled by flex centering
              canDelete={selectedIndex !== 0 && selectedIndex !== palette.length - 1 && palette.length > 2}
              onColorChange={handleColorChange}
              onDelete={handleDeleteStop}
              onClose={() => {
                setPickerOpen(false);
                setSelectedIndex(null);
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ColorBar;
