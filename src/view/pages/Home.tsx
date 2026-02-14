import React, { useCallback, useMemo, useEffect, useState } from "react";
import styled from "styled-components";

// Hooks
import { useAttractorState, usePalette, useCanvasWorker, useFractalZoom, DEFAULT_PARAMS } from "../../hooks";
import { useUrlSync } from "../../hooks/useUrlSync";
import { useExportWorker } from "../../hooks/useExportWorker";

// Components
import { CanvasArea, ZoomPanel, ControlPanel, PaletteModal, ExportModal, Sidebar } from "../../components";

// Attractor Controls
import { SymmetricIconControls } from "../../attractors/symmetricIcon";
import { SymmetricQuiltControls } from "../../attractors/symmetricQuilt";
import { CliffordControls } from "../../attractors/clifford";
import { DeJongControls } from "../../attractors/deJong";
import { TinkerbellControls } from "../../attractors/tinkerbell";
import { HenonControls } from "../../attractors/henon";
import { BedheadControls } from "../../attractors/bedhead";
import { SvenssonControls } from "../../attractors/svensson";
import { FractalDreamControls } from "../../attractors/fractalDream";
import { HopalongControls } from "../../attractors/hopalong";
import { MandelbrotControls } from "../../attractors/mandelbrot";
import { JuliaControls } from "../../attractors/julia";
import { BurningShipControls } from "../../attractors/burningship";
import { TricornControls } from "../../attractors/tricorn";
import { MultibrotControls } from "../../attractors/multibrot";
import { NewtonControls } from "../../attractors/newton";
import { PhoenixControls } from "../../attractors/phoenix";
import { LyapunovControls } from "../../attractors/lyapunov";
import { GumowskiMiraControls } from "../../attractors/gumowskiMira";
import { SprottControls } from "../../attractors/sprott";
import { SymmetricFractalControls } from "../../attractors/symmetricFractal";
import { DeRhamControls } from "../../attractors/deRham";
import { ConradiControls } from "../../attractors/conradi";
import { MobiusControls } from "../../attractors/mobius";
import { JasonRampe1Controls } from "../../attractors/jasonRampe1";
import { JasonRampe2Controls } from "../../attractors/jasonRampe2";
import { JasonRampe3Controls } from "../../attractors/jasonRampe3";

// Data
import symmetricIconData, {
  cliffordData, deJongData, tinkerbellData, henonData,
  bedheadData, svenssonData, fractalDreamData, hopalongData,
  symmetricQuiltData, mandelbrotData, juliaData, jasonRampe1Data, jasonRampe2Data, jasonRampe3Data
} from "../../Parametersets";

// Types
import { CONFIG, AttractorType } from "../../attractors/shared/types";

// Helper to generate download filename
const getPresetName = (type: AttractorType, presetIndex: number): string => {
  const presetDataMap: Record<string, any[]> = {
    symmetric_icon: symmetricIconData,
    symmetric_quilt: symmetricQuiltData,
    clifford: cliffordData,
    dejong: deJongData,
    tinkerbell: tinkerbellData,
    henon: henonData,
    bedhead: bedheadData,
    svensson: svenssonData,
    fractal_dream: fractalDreamData,
    hopalong: hopalongData,
    mandelbrot: mandelbrotData,
    julia: juliaData,
    jason_rampe1: jasonRampe1Data,
    jason_rampe2: jasonRampe2Data,
    jason_rampe3: jasonRampe3Data,
  };

  const data = presetDataMap[type];
  if (data && data[presetIndex]?.name) {
    return data[presetIndex].name;
  }
  return "custom";
};

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
  background: #0a0a0f;
`;

const MainContent = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
`;

function Home() {
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
    const presetIndex = attractor.presets[type] ?? -1;
    const presetName = getPresetName(type, presetIndex);
    const typeSlug = type.replace(/_/g, "-");
    const presetSlug = slugify(presetName);

    return `${typeSlug}-${presetSlug}.png`;
  }, [attractor.attractorType, attractor.presets]);

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
    totalIterations: worker.totalIterations,
    oversampling: worker.oversampling,
    getFilename,
  });

  // Sync attractor state to URL — only when current type's params change
  const currentParams = attractor.params[attractor.attractorType];
  useEffect(() => {
    syncToUrl(attractor.attractorType, currentParams as Record<string, any>);
  }, [attractor.attractorType, currentParams, syncToUrl]);

  // Share link handler
  const handleShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
  }, []);

  // Memoized modal/edit toggle callbacks
  const handleToggleEdit = useCallback(() => {
    const wasEditing = worker.isEditing;
    worker.setIsEditing(!wasEditing);
    if (wasEditing && attractor.isFractalType) {
      worker.initialize();
    }
  }, [worker, attractor.isFractalType]);

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
    const defaults = DEFAULT_PARAMS[type];
    attractor.setParams(type, defaults as any);
    worker.initialize({ params: defaults });
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
    return 'maxIter' in p ? (p as { maxIter: number }).maxIter : undefined;
  }, [attractor]);

  // Render attractor controls
  const renderControls = () => {
    const disabled = !worker.isEditing;

    switch (attractor.attractorType) {
      case "symmetric_icon":
        return (
          <SymmetricIconControls
            params={attractor.params.symmetric_icon}
            onChange={(p) => attractor.setParams("symmetric_icon", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.symmetric_icon}
            onPresetChange={(i) => {
              attractor.setPreset("symmetric_icon", i);
              const icon = symmetricIconData[i];
              const newParams = { alpha: icon.alpha, betha: icon.betha, gamma: icon.gamma, delta: icon.delta, omega: icon.omega, lambda: icon.lambda, degree: icon.degree, npdegree: icon.npdegree, scale: icon.scale };
              attractor.setParams("symmetric_icon", newParams);
              palette.setPaletteData(icon.paletteData);
              palette.setPalGamma(icon.palGamma ?? 0.5);
              worker.initialize({ params: newParams, paletteData: icon.paletteData, palGamma: icon.palGamma ?? 0.5 });
            }}
          />
        );
      case "symmetric_quilt":
        return (
          <SymmetricQuiltControls
            params={attractor.params.symmetric_quilt}
            onChange={(p) => attractor.setParams("symmetric_quilt", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.symmetric_quilt}
            onPresetChange={(i) => {
              attractor.setPreset("symmetric_quilt", i);
              const p = symmetricQuiltData[i];
              const newParams = { lambda: p.lambda, alpha: p.alpha, beta: p.beta, gamma: p.gamma, omega: p.omega, m: p.m, shift: p.shift, scale: p.scale };
              attractor.setParams("symmetric_quilt", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "clifford":
        return (
          <CliffordControls
            params={attractor.params.clifford}
            onChange={(p) => attractor.setParams("clifford", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.clifford}
            onPresetChange={(i) => {
              attractor.setPreset("clifford", i);
              const p = cliffordData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setParams("clifford", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "dejong":
        return (
          <DeJongControls
            params={attractor.params.dejong}
            onChange={(p) => attractor.setParams("dejong", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.dejong}
            onPresetChange={(i) => {
              attractor.setPreset("dejong", i);
              const p = deJongData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setParams("dejong", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "tinkerbell":
        return (
          <TinkerbellControls
            params={attractor.params.tinkerbell}
            onChange={(p) => attractor.setParams("tinkerbell", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.tinkerbell}
            onPresetChange={(i) => {
              attractor.setPreset("tinkerbell", i);
              const p = tinkerbellData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setParams("tinkerbell", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "henon":
        return (
          <HenonControls
            params={attractor.params.henon}
            onChange={(p) => attractor.setParams("henon", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.henon}
            onPresetChange={(i) => {
              attractor.setPreset("henon", i);
              const p = henonData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, scale: p.scale };
              attractor.setParams("henon", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "bedhead":
        return (
          <BedheadControls
            params={attractor.params.bedhead}
            onChange={(p) => attractor.setParams("bedhead", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.bedhead}
            onPresetChange={(i) => {
              attractor.setPreset("bedhead", i);
              const p = bedheadData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, scale: p.scale };
              attractor.setParams("bedhead", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "svensson":
        return (
          <SvenssonControls
            params={attractor.params.svensson}
            onChange={(p) => attractor.setParams("svensson", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.svensson}
            onPresetChange={(i) => {
              attractor.setPreset("svensson", i);
              const p = svenssonData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setParams("svensson", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "fractal_dream":
        return (
          <FractalDreamControls
            params={attractor.params.fractal_dream}
            onChange={(p) => attractor.setParams("fractal_dream", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.fractal_dream}
            onPresetChange={(i) => {
              attractor.setPreset("fractal_dream", i);
              const p = fractalDreamData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, delta: p.delta, scale: p.scale };
              attractor.setParams("fractal_dream", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "hopalong":
        return (
          <HopalongControls
            params={attractor.params.hopalong}
            onChange={(p) => attractor.setParams("hopalong", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.hopalong}
            onPresetChange={(i) => {
              attractor.setPreset("hopalong", i);
              const p = hopalongData[i];
              const newParams = { alpha: p.alpha, beta: p.beta, gamma: p.gamma, scale: p.scale };
              attractor.setParams("hopalong", newParams);
              worker.initialize({ params: newParams });
            }}
          />
        );
      case "mandelbrot":
        return (
          <MandelbrotControls
            params={attractor.params.mandelbrot}
            onChange={(p) => attractor.setParams("mandelbrot", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.mandelbrot}
            onPresetChange={(i) => {
              attractor.setPreset("mandelbrot", i);
              const p = mandelbrotData[i];
              const newParams = { centerX: p.centerX, centerY: p.centerY, zoom: p.zoom, maxIter: p.maxIter };
              attractor.setParams("mandelbrot", newParams);
              if (p.paletteData) palette.setPaletteData(p.paletteData);
              palette.setPalGamma(p.palGamma ?? 0.5);
              worker.initialize({ params: newParams, paletteData: p.paletteData, palGamma: p.palGamma ?? 0.5 });
            }}
          />
        );
      case "julia":
        return (
          <JuliaControls
            params={attractor.params.julia}
            onChange={(p) => attractor.setParams("julia", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.julia}
            onPresetChange={(i) => {
              attractor.setPreset("julia", i);
              const p = juliaData[i];
              const newParams = { cReal: p.cReal, cImag: p.cImag, centerX: p.centerX, centerY: p.centerY, zoom: p.zoom, maxIter: p.maxIter };
              attractor.setParams("julia", newParams);
              if (p.paletteData) palette.setPaletteData(p.paletteData);
              palette.setPalGamma(p.palGamma ?? 0.5);
              worker.initialize({ params: newParams, paletteData: p.paletteData, palGamma: p.palGamma ?? 0.5 });
            }}
          />
        );
      case "burningship":
        return <BurningShipControls params={attractor.params.burningship} onChange={(p) => attractor.setParams("burningship", p)} disabled={disabled} />;
      case "tricorn":
        return <TricornControls params={attractor.params.tricorn} onChange={(p) => attractor.setParams("tricorn", p)} disabled={disabled} />;
      case "multibrot":
        return <MultibrotControls params={attractor.params.multibrot} onChange={(p) => attractor.setParams("multibrot", p)} disabled={disabled} />;
      case "newton":
        return <NewtonControls params={attractor.params.newton} onChange={(p) => attractor.setParams("newton", p)} disabled={disabled} />;
      case "phoenix":
        return <PhoenixControls params={attractor.params.phoenix} onChange={(p) => attractor.setParams("phoenix", p)} disabled={disabled} />;
      case "lyapunov":
        return <LyapunovControls params={attractor.params.lyapunov} onChange={(p) => attractor.setParams("lyapunov", p)} disabled={disabled} />;
      case "gumowski_mira":
        return (
          <GumowskiMiraControls
            params={attractor.params.gumowski_mira}
            onChange={(p) => attractor.setParams("gumowski_mira", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.gumowski_mira}
            onPresetChange={(i) => {
              attractor.setPreset("gumowski_mira", i);
              const { gumowskiMiraPresets } = require("../../attractors/gumowskiMira/config");
              const p = gumowskiMiraPresets[i].params;
              attractor.setParams("gumowski_mira", p);
              worker.initialize({ params: p });
            }}
          />
        );
      case "sprott":
        return (
          <SprottControls
            params={attractor.params.sprott}
            onChange={(p) => attractor.setParams("sprott", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.sprott}
            onPresetChange={(i) => {
              attractor.setPreset("sprott", i);
              const { sprottPresets } = require("../../attractors/sprott/config");
              const p = sprottPresets[i].params;
              attractor.setParams("sprott", p);
              worker.initialize({ params: p });
            }}
          />
        );
      case "symmetric_fractal":
        return (
          <SymmetricFractalControls
            params={attractor.params.symmetric_fractal}
            onChange={(p) => attractor.setParams("symmetric_fractal", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.symmetric_fractal}
            onPresetChange={(i) => {
              attractor.setPreset("symmetric_fractal", i);
              const { symmetricFractalPresets } = require("../../attractors/symmetricFractal/config");
              const p = symmetricFractalPresets[i].params;
              attractor.setParams("symmetric_fractal", p);
              worker.initialize({ params: p });
            }}
          />
        );
      case "derham":
        return (
          <DeRhamControls
            params={attractor.params.derham}
            onChange={(p) => attractor.setParams("derham", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.derham}
            onPresetChange={(i) => {
              attractor.setPreset("derham", i);
              const { deRhamPresets } = require("../../attractors/deRham/config");
              const p = deRhamPresets[i].params;
              attractor.setParams("derham", p);
              worker.initialize({ params: p });
            }}
          />
        );
      case "conradi":
        return (
          <ConradiControls
            params={attractor.params.conradi}
            onChange={(p) => attractor.setParams("conradi", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.conradi}
            onPresetChange={(i) => {
              attractor.setPreset("conradi", i);
              const { conradiPresets } = require("../../attractors/conradi/config");
              const p = conradiPresets[i].params;
              attractor.setParams("conradi", p);
              worker.initialize({ params: p });
            }}
          />
        );
      case "mobius":
        return (
          <MobiusControls
            params={attractor.params.mobius}
            onChange={(p) => attractor.setParams("mobius", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.mobius}
            onPresetChange={(i) => {
              attractor.setPreset("mobius", i);
              const { mobiusPresets } = require("../../attractors/mobius/config");
              const p = mobiusPresets[i].params;
              attractor.setParams("mobius", p);
              worker.initialize({ params: p });
            }}
          />
        );
      case "jason_rampe1":
        return (
          <JasonRampe1Controls
            params={attractor.params.jason_rampe1}
            onChange={(p) => attractor.setParams("jason_rampe1", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.jason_rampe1}
            onPresetChange={(i) => {
              attractor.setPreset("jason_rampe1", i);
              const preset = jasonRampe1Data[i];
              const p = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
              attractor.setParams("jason_rampe1", p);
              worker.initialize({ params: p });
            }}
          />
        );
      case "jason_rampe2":
        return (
          <JasonRampe2Controls
            params={attractor.params.jason_rampe2}
            onChange={(p) => attractor.setParams("jason_rampe2", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.jason_rampe2}
            onPresetChange={(i) => {
              attractor.setPreset("jason_rampe2", i);
              const preset = jasonRampe2Data[i];
              const p = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
              attractor.setParams("jason_rampe2", p);
              worker.initialize({ params: p });
            }}
          />
        );
      case "jason_rampe3":
        return (
          <JasonRampe3Controls
            params={attractor.params.jason_rampe3}
            onChange={(p) => attractor.setParams("jason_rampe3", p)}
            disabled={disabled}
            selectedPreset={attractor.presets.jason_rampe3}
            onPresetChange={(i) => {
              attractor.setPreset("jason_rampe3", i);
              const preset = jasonRampe3Data[i];
              const p = { alpha: preset.alpha, beta: preset.beta, gamma: preset.gamma, delta: preset.delta, scale: preset.scale };
              attractor.setParams("jason_rampe3", p);
              worker.initialize({ params: p });
            }}
          />
        );
      default:
        return null;
    }
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
        maxHits={worker.maxHits}
        totalIterations={worker.totalIterations}
        maxIter={currentMaxIter}
        rendering={worker.rendering}
        isEditing={worker.isEditing}
        onToggleEdit={handleToggleEdit}
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

        <ZoomPanel
          onFitToView={worker.fitToView}
          onZoomIn={worker.zoomIn}
          onZoomOut={worker.zoomOut}
          onZoomReset={worker.zoomReset}
          isFractalType={attractor.isFractalType}
          onResetFractalView={handleResetFractalView}
        />

        <ControlPanel
          iterating={worker.iterating}
          onToggleIteration={worker.toggleIteration}
          onOpenPalette={handleOpenPalette}
          onOpenExport={handleOpenExport}
          onShareLink={handleShareLink}
          isFractalType={attractor.isFractalType}
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
