import React, { useCallback, useMemo, useEffect, useState } from "react";
import styled from "styled-components";

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
import { CanvasArea, SystemCommandBar, PaletteModal, ExportModal, Sidebar } from "../../components";

// Data
import symmetricIconData, {
  cliffordData, deJongData, tinkerbellData, henonData,
  bedheadData, svenssonData, fractalDreamData, hopalongData,
  symmetricQuiltData, mandelbrotData, juliaData, jasonRampe1Data, jasonRampe2Data, jasonRampe3Data
} from "../../Parametersets";

// Types
import { CONFIG, AttractorType } from "../../attractors/shared/types";

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Styled components
const PageContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: ${props => props.theme.bgPage};
  transition: background 0.5s ease;
`;

const MainContent = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
`;

function Home() {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // URL sync hook
  const { getInitialState, syncToUrl } = useUrlSync();

  // Read URL params once on mount
  const urlOverrides = useMemo(() => getInitialState(), []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Attractor state hook — with optional URL overrides
  const attractor = useAttractorState(urlOverrides ?? undefined);

  // Palette hook - initialize with icon preset
  const initialIcon = symmetricIconData[CONFIG.INITIAL_ICON_INDEX];
  const palette = usePalette(initialIcon.paletteData, initialIcon.palGamma ?? 0.5);

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

  // Sync attractor state to URL — only when current type's params change
  const currentParams = attractor.params[attractor.attractorType];
  useEffect(() => {
    if (currentParams) {
      syncToUrl(attractor.attractorType, currentParams as Record<string, any>);
    }
  }, [attractor.attractorType, currentParams, syncToUrl]);

  // Share link handler
  const handleShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
  }, []);

  const handleOpenPalette = useCallback(() => setPaletteModalOpen(true), []);
  const handleClosePalette = useCallback(() => setPaletteModalOpen(false), []);
  const handleOpenExport = useCallback(() => setExportModalOpen(true), []);
  const handleCloseExport = useCallback(() => setExportModalOpen(false), []);

  // --- Handlers that bridge attractor state + worker ---

  const handleAttractorTypeChange = useCallback((type: AttractorType) => {
    attractor.setAttractorType(type);
    worker.initialize({ attractorType: type, params: attractor.getParamsForType(type) as Record<string, any> });
  }, [attractor, worker]);

  const handleFractalMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!attractor.isFractalType) return;
    fractalZoom.handleMouseDown(e, worker.zoom);
  }, [attractor.isFractalType, fractalZoom, worker.zoom]);

  const handleFractalMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    fractalZoom.handleMouseMove(e, worker.zoom);
  }, [fractalZoom, worker.zoom]);

  const handleFractalMouseUp = useCallback(() => {
    if (!fractalZoom.isDragging) {
      fractalZoom.handleMouseUp();
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

  const handleResetFractalView = useCallback(() => {
    const type = attractor.attractorType;
    const module = registry.get(type);
    if (module) {
      const defaults = module.defaultParams;
      attractor.setParams(type, defaults as any);
      worker.initialize({ params: defaults });
    }
  }, [attractor, worker]);

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
      <ActiveControls
        params={currentParams}
        onChange={(p) => attractor.setParams(attractor.attractorType, p)}
        disabled={false}
        selectedPreset={currentPreset}
        onPresetChange={(i) => {
          attractor.setPreset(attractor.attractorType, i);
          
          // Logic to update parameters based on preset
          let newParams = null;
          const type = attractor.attractorType;
          
          switch (type) {
            case "clifford": newParams = cliffordData[i]; break;
            case "dejong": newParams = deJongData[i]; break;
            case "tinkerbell": newParams = tinkerbellData[i]; break;
            case "henon": newParams = henonData[i]; break;
            case "bedhead": newParams = bedheadData[i]; break;
            case "svensson": newParams = svenssonData[i]; break;
            case "fractal_dream": newParams = fractalDreamData[i]; break;
            case "hopalong": newParams = hopalongData[i]; break;
            case "symmetric_icon": newParams = symmetricIconData[i]; break;
            case "symmetric_quilt": newParams = symmetricQuiltData[i]; break;
            case "mandelbrot": newParams = mandelbrotData[i]; break;
            case "julia": newParams = juliaData[i]; break;
            case "jason_rampe1": newParams = jasonRampe1Data[i]; break;
            case "jason_rampe2": newParams = jasonRampe2Data[i]; break;
            case "jason_rampe3": newParams = jasonRampe3Data[i]; break;
          }

          if (newParams) {
            const { name, paletteData, palGamma, ...mathParams } = newParams as any;
            attractor.setParams(type, mathParams);
            if (paletteData) palette.setPaletteData(paletteData);
            if (palGamma !== undefined) palette.setPalGamma(palGamma);
            worker.initialize({ params: mathParams, paletteData, palGamma });
          }
        }}
      />
    );
  };

  return (
    <PageContainer>
      <Sidebar
        attractorType={attractor.attractorType}
        onAttractorTypeChange={handleAttractorTypeChange}
        canvasSize={worker.canvasSize}
        onCanvasSizeChange={worker.setCanvasSize}
        oversampling={worker.oversampling}
        onOversamplingChange={worker.setOversampling}
        statsRef={worker.statsRef}
        maxIter={currentMaxIter}
        rendering={worker.rendering}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {renderControls()}
      </Sidebar>

      <MainContent>
        <CanvasArea
          canvasRef={worker.canvasRef}
          containerRef={worker.containerRef}
          canvasSize={worker.canvasSize}
          zoom={worker.zoom}
          canvasKey={worker.canvasKey}
          isFractalType={attractor.isFractalType}
          rendering={worker.rendering}
          isDragging={fractalZoom.isDragging}
          dragSelection={dragSelection}
          onMouseDown={handleFractalMouseDown}
          onMouseMove={handleFractalMouseMove}
          onMouseUp={handleFractalMouseUp}
        />

        <SystemCommandBar
          iterating={worker.iterating}
          onToggleIteration={worker.toggleIteration}
          isFractalType={attractor.isFractalType}
          onFitToView={worker.fitToView}
          onZoomIn={worker.zoomIn}
          onZoomOut={worker.zoomOut}
          onZoomReset={worker.zoomReset}
          onResetFractalView={handleResetFractalView}
          onOpenPalette={handleOpenPalette}
          onOpenExport={handleOpenExport}
          onShareLink={handleShareLink}
          onCycleBg={palette.cycleBgColor}
        />
      </MainContent>

      <PaletteModal
        isOpen={paletteModalOpen}
        onClose={handleClosePalette}
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
      />
    </PageContainer>
  );
}

export default Home;
