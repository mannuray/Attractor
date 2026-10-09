import React, { useCallback, useMemo, useEffect, useRef, useState } from "react";

// Registry & Modules (MUST BE AT THE TOP to ensure all registrations happen before use)
import { registry } from "../../attractors";

// Hooks
import { 
  useAttractorState, 
  usePalette, 
  useCanvasWorker, 
  useFractalZoom, 
  useUrlSync, 
  useExportWorker 
} from "../../hooks";

// Components
import { CanvasArea, PaletteModal, ExportModal } from "../../components";
import { ResponsiveShell } from "../../components/shell";
import { bgColorFor, BgMode } from "../../lib/bgMode";
import { useTheme } from "../../theme/ThemeContext";
import { useViewport } from "../../hooks/useViewport";
import { presetFor } from "../../attractors/presets";
import { PresetSystemContext } from "../../attractors/shared/PresetSelector";
import { CanvasMap, remapComplexView, remapLyapunovView, fractalDepth } from "../../lib/viewport";
import { formatCompact } from "../../attractors/shared/types";

// Data
import symmetricIconData from "../../Parametersets";

// Types
import { CONFIG, AttractorType } from "../../attractors/shared/types";
import { DragPoint } from "../../hooks/useFractalZoom";
import { useDocumentMeta } from "../../seo/useDocumentMeta";
import { pageMetaFor } from "../../seo/meta";

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

function Home() {
  useDocumentMeta(pageMetaFor("/"));
  // UI state
  const [hunting, setHunting] = useState(false);

  // URL sync hook
  const { getInitialState, syncToUrl } = useUrlSync();

  // Read URL params once on mount
  const urlOverrides = useMemo(() => getInitialState(), []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Attractor state hook — with optional URL overrides
  const attractor = useAttractorState(urlOverrides ?? undefined);

  // Palette hook - initialize with icon preset
  const initialIcon = symmetricIconData[CONFIG.INITIAL_ICON_INDEX];
  const palette = usePalette(initialIcon.paletteData, initialIcon.palGamma ?? 0.5);
  const { colors: themeColors } = useTheme();
  const handleBgModeChange = useCallback((mode: BgMode) => {
    palette.setBgColor(bgColorFor(mode, themeColors.bgPage));
  }, [palette, themeColors.bgPage]);

  // Fractal zoom hook
  const fractalZoom = useFractalZoom();

  // Palette modal state
  const [paletteModalOpen, setPaletteModalOpen] = useState(false);

  // Generate filename for download
  const getFilename = useCallback((): string => {
    const type = attractor.attractorType;
    const presetName = "render"; // Future: get from module/state
    const typeSlug = type.replace(/_/g, "-");
    const presetSlug = slugify(presetName);

    return `${typeSlug}-${presetSlug}.png`;
  }, [attractor.attractorType]);

  // Canvas worker hook
  const worker = useCanvasWorker({
    attractorType: attractor.attractorType,
    params: attractor.getCurrentParams() as Record<string, any>,
    isFractalType: attractor.isFractalType,
    palette: {
      paletteData: palette.paletteData,
      palGamma: palette.palGamma,
      palScale: palette.palScale,
      palMax: palette.palMax,
      bgColor: palette.bgColor,
      colorLUTRef: palette.colorLUTRef,
      paletteKey: palette.paletteKey,
    },
    getFilename,
  });

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Export worker hook
  const exportWorker = useExportWorker({
    attractorType: attractor.attractorType,
    params: attractor.getCurrentParams() as Record<string, any>,
    isFractalType: attractor.isFractalType,
    paletteData: palette.paletteData,
    palGamma: palette.palGamma,
    palScale: palette.palScale,
    palMax: palette.palMax,
    bgColor: palette.bgColor,
    canvasSize: worker.canvasSize,
    statsRef: worker.statsRef,
    oversampling: worker.oversampling,
    getFilename,
  });

  // Listen for Hunt AI results
  useEffect(() => {
    const handleHuntFound = (e: CustomEvent) => {
      const foundParams = e.detail;
      const type = attractor.attractorType;
      // Merge with existing params to preserve 'scale'
      const mergedParams = { ...attractor.params[type], ...foundParams };
      
      attractor.setParams(type, mergedParams);
      worker.initialize({ params: mergedParams });
      setHunting(false);
    };

    window.addEventListener("attractorHuntFound" as any, handleHuntFound as any);
    return () => window.removeEventListener("attractorHuntFound" as any, handleHuntFound as any);
  }, [attractor, worker]);

  // Sync attractor state to URL — only when current type's params change
  const currentParams = attractor.params[attractor.attractorType];
  useEffect(() => {
    if (currentParams) {
      syncToUrl(attractor.attractorType, currentParams as Record<string, any>);
    }
  }, [attractor.attractorType, currentParams, syncToUrl]);

  const handleOpenPalette = useCallback(() => setPaletteModalOpen(true), []);
  const handleClosePalette = useCallback(() => setPaletteModalOpen(false), []);
  // Snapshot of the current render for the export dialog's preview.
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const exportOpenRef = useRef(false);
  const handleOpenExport = useCallback(() => {
    exportOpenRef.current = true;
    setExportModalOpen(true);
    worker.requestSnapshot().then(blob => {
      // Ignore a snapshot that arrives after the dialog was closed.
      if (blob && exportOpenRef.current) setExportPreview(URL.createObjectURL(blob));
    });
  }, [worker]);
  const handleCloseExport = useCallback(() => {
    exportOpenRef.current = false;
    setExportModalOpen(false);
    setExportPreview(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
  }, []);

  // --- Handlers that bridge attractor state + worker ---

  const handleAttractorTypeChange = useCallback((type: AttractorType) => {
    attractor.setAttractorType(type);
    worker.initialize({ attractorType: type, params: attractor.getParamsForType(type) as Record<string, any> });
  }, [attractor, worker]);

  const handleSelectStart = useCallback((pt: DragPoint) => fractalZoom.beginDrag(pt), [fractalZoom]);
  const handleSelectMove = useCallback((pt: DragPoint) => fractalZoom.moveDrag(pt), [fractalZoom]);
  const handleSelectCancel = useCallback(() => fractalZoom.clearDrag(), [fractalZoom]);

  const handleSelectEnd = useCallback(() => {
    if (!fractalZoom.isDragging) {
      fractalZoom.endDrag();
      return;
    }

    const type = attractor.attractorType;
    const currentParams = attractor.params[type];

    if (type === "lyapunov") {
      const newParams = fractalZoom.calculateNewLyapunovParams(currentParams as any, worker.canvasSize);
      if (newParams) {
        attractor.setParams("lyapunov", newParams);
        worker.initialize({ params: newParams });
      }
    } else {
      const newParams = fractalZoom.calculateNewParams(currentParams as any, worker.canvasSize);
      if (newParams) {
        attractor.setParams(type, newParams as any);
        worker.initialize({ params: newParams });
      }
    }

    fractalZoom.clearDrag();
  }, [attractor, fractalZoom, worker]);

  // Parameters before the last Reset, so the inspector can offer Undo.
  const lastResetRef = useRef<{ type: AttractorType; params: any } | null>(null);

  const handleResetFractalView = useCallback(() => {
    const type = attractor.attractorType;
    const module = registry.get(type);
    if (module) {
      lastResetRef.current = { type, params: attractor.params[type] };
      const defaults = module.defaultParams;
      attractor.setParams(type, defaults as any);
      worker.initialize({ params: defaults });
    }
  }, [attractor, worker]);

  const handleUndoReset = useCallback(() => {
    const prev = lastResetRef.current;
    if (!prev || prev.type !== attractor.attractorType) return;
    lastResetRef.current = null;
    attractor.setParams(prev.type, prev.params);
    worker.initialize({ params: prev.params });
  }, [attractor, worker]);

  // The AI Hunter action
  const handleHunt = useCallback(() => {
    setHunting(true);
    worker.hunt();
  }, [worker]);

  const handleCancelHunt = useCallback(() => {
    worker.stopHunt();
    setHunting(false);
  }, [worker]);

  // Canvas viewport: attractors zoom the picture; fractals zoom the maths (re-render).
  const handleFractalCommit = useCallback((map: CanvasMap) => {
    const type = attractor.attractorType;
    const current = attractor.params[type] as any;
    const next = type === "lyapunov"
      ? remapLyapunovView(current, map, worker.canvasSize)
      : remapComplexView(current, map, worker.canvasSize);
    attractor.setParams(type, next);
    worker.initialize({ params: next });
  }, [attractor, worker]);

  const viewport = useViewport({
    containerRef: worker.containerRef,
    canvasSize: worker.canvasSize,
    refitKey: attractor.attractorType,
    onCommit: attractor.isFractalType ? handleFractalCommit : undefined,
  });

  // A new fractal frame is on the canvas: the CSS preview of the zoom can go.
  const { settle } = viewport;
  useEffect(() => { settle(); }, [worker.fractalFrame, settle]);

  const zoomLabel = useMemo(() => {
    if (!attractor.isFractalType) return `${viewport.percent}%`;
    const defaults = registry.get(attractor.attractorType)?.defaultParams ?? {};
    const depth = fractalDepth(attractor.params[attractor.attractorType] as any, defaults);
    if (depth < 10) return `${Number(depth.toFixed(1))}×`;
    return `${formatCompact(Math.round(depth))}×`;
  }, [attractor.isFractalType, attractor.attractorType, attractor.params, viewport.percent]);

  // Drag selection rect
  const dragSelection = useMemo(() => {
    if (!fractalZoom.dragStart || !fractalZoom.dragEnd) return null;
    return {
      left: Math.min(fractalZoom.dragStart.x, fractalZoom.dragEnd.x),
      top: Math.min(fractalZoom.dragStart.y, fractalZoom.dragEnd.y),
      width: Math.abs(fractalZoom.dragEnd.x - fractalZoom.dragStart.x),
      height: Math.abs(fractalZoom.dragEnd.y - fractalZoom.dragStart.y),
    };
  }, [fractalZoom.dragStart, fractalZoom.dragEnd]);

  // Get current maxIter for stats
  const currentMaxIter = useMemo(() => {
    const p = attractor.getCurrentParams();
    if (!p) return undefined;
    return 'maxIter' in p ? (p as { maxIter: number }).maxIter : undefined;
  }, [attractor]);

  // Render attractor controls dynamically from Registry
  const renderControls = () => {
    const module = registry.get(attractor.attractorType);
    if (!module) return null;

    const ActiveControls = module.Controls;
    const currentParams = attractor.params[attractor.attractorType];
    const currentPreset = attractor.presets[attractor.attractorType];

    if (!currentParams) return null;

    return (
      <PresetSystemContext.Provider value={attractor.attractorType}>
      <ActiveControls
        params={currentParams}
        onChange={(p) => attractor.setParams(attractor.attractorType, p)}
        disabled={false}
        selectedPreset={currentPreset}
        onPresetChange={(i) => {
          attractor.setPreset(attractor.attractorType, i);
          
          const preset = presetFor(attractor.attractorType, i);
          const type = attractor.attractorType;
          if (preset) {
            const { params: mathParams, paletteData, palGamma } = preset;
            attractor.setParams(type, mathParams as any);
            if (paletteData) palette.setPaletteData(paletteData);
            if (palGamma !== undefined) palette.setPalGamma(palGamma);
            worker.initialize({ params: mathParams, paletteData, palGamma });
          }
        }}
      />
      </PresetSystemContext.Provider>
    );
  };

  const systemLabel = registry.get(attractor.attractorType)?.label ?? attractor.attractorType;

  const canvas = (
    <CanvasArea
      canvasRef={worker.canvasRef}
      containerRef={worker.containerRef}
      canvasSize={worker.canvasSize}
      view={viewport.view}
      canvasKey={worker.canvasKey}
      isFractalType={attractor.isFractalType}
      isDragging={fractalZoom.isDragging}
      dragSelection={dragSelection}
      onSelectStart={handleSelectStart}
      onSelectMove={handleSelectMove}
      onSelectEnd={handleSelectEnd}
      onSelectCancel={handleSelectCancel}
      onPan={viewport.panBy}
      onZoomAt={viewport.zoomAtClient}
      onGestureEnd={viewport.gestureEnd}
      fx={attractor.fx}
    />
  );

  return (
    <>
      <ResponsiveShell
        canvas={canvas}
        attractorType={attractor.attractorType}
        systemLabel={systemLabel}
        onAttractorTypeChange={handleAttractorTypeChange}
        controls={renderControls()}
        fx={attractor.fx}
        onFxChange={attractor.setFx}
        canvasSize={worker.canvasSize}
        onCanvasSizeChange={worker.setCanvasSize}
        oversampling={worker.oversampling}
        onOversamplingChange={worker.setOversampling}
        paletteData={palette.paletteData}
        bgColor={palette.bgColor}
        onBgModeChange={handleBgModeChange}
        onOpenPalette={handleOpenPalette}
        onOpenExport={handleOpenExport}
        rendering={worker.rendering}
        renderProgress={worker.renderProgress}
        statsRef={worker.statsRef}
        maxIter={currentMaxIter}
        iterating={worker.iterating}
        onToggleIteration={worker.toggleIteration}
        hunting={hunting}
        onHunt={handleHunt}
        onCancelHunt={handleCancelHunt}
        isFractalType={attractor.isFractalType}
        zoomLabel={zoomLabel}
        onFitToView={viewport.fit}
        onZoomIn={viewport.zoomIn}
        onZoomOut={viewport.zoomOut}
        onZoomReset={viewport.actualPixels}
        onResetFractalView={handleResetFractalView}
        onUndoReset={handleUndoReset}
      />

      <PaletteModal
        isOpen={paletteModalOpen}
        onClose={handleClosePalette}
        subtitle={systemLabel}
        paletteData={palette.paletteData}
        onPaletteChange={palette.setPaletteData}
        palGamma={palette.palGamma}
        onGammaChange={palette.setPalGamma}
        palScale={palette.palScale}
        onScaleModeChange={palette.setPalScale}
        palMax={palette.palMax}
        onPalMaxChange={palette.setPalMax}
        bgColor={palette.bgColor}
        onBgColorChange={palette.setBgColor}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={handleCloseExport}
        onExportCurrent={worker.saveImage}
        onExportSize={exportWorker.exportImage}
        exporting={exportWorker.exporting}
        subtitle={systemLabel}
        canvasSize={worker.canvasSize}
        oversampling={worker.oversampling}
        paletteData={palette.paletteData}
        previewSrc={exportPreview}
      />
    </>
  );
}

export default Home;
