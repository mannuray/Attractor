import { useState, useRef, useCallback, useEffect } from "react";
import { AttractorType, CONFIG } from "../attractors/shared/types";
import { Color } from "../model-controller/Attractor/palette";
import { buildIteratorPayload, getScale } from "./iteratorConfig";

interface BgColor {
  r: number;
  g: number;
  b: number;
}

interface ExportWorkerOptions {
  attractorType: AttractorType;
  params: Record<string, any>;
  isFractalType: boolean;
  paletteData: Color[];
  palGamma: number;
  palScale: boolean;
  palMax: number;
  bgColor: BgColor;
  canvasSize: number;
  totalIterations: number;
  oversampling: number;
  getFilename: () => string;
}

export function useExportWorker(options: ExportWorkerOptions) {
  const [exporting, setExporting] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const mountedRef = useRef(true);
  const latestOptions = useRef(options);

  useEffect(() => {
    latestOptions.current = options;
  });

  // Track mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const exportImage = useCallback((size: number) => {
    const opts = latestOptions.current;

    // Guard against invalid sizes
    if (size <= 0 || opts.canvasSize <= 0) return;

    // Terminate any prior export worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    setExporting(true);

    const offscreen = new OffscreenCanvas(size, size);
    const worker = new Worker("worker.js");
    workerRef.current = worker;

    const iteratorPayload = buildIteratorPayload(opts.attractorType, opts.params);
    const scale = getScale(opts.attractorType, opts.params);

    // Cap oversampling at 1x for very large exports to avoid OOM
    const exportOversampling = size > 4096 ? 1 : opts.oversampling;

    const payload = {
      mode: "offscreen",
      canvas: offscreen,
      point: { xpos: 0.001, ypos: 0.002 },
      size,
      alias: exportOversampling,
      scale,
      palette: opts.paletteData,
      colorLUTSize: CONFIG.COLOR_LUT_SIZE,
      iterator: iteratorPayload,
      palGamma: opts.palGamma,
      palScale: opts.palScale,
      palMax: opts.palMax,
      bgColor: opts.bgColor,
    };

    worker.postMessage({ type: "initialize", payload }, [offscreen]);

    // Error handler — clean up on worker failure
    worker.onerror = () => {
      cleanup(worker);
    };

    if (opts.isFractalType) {
      // Fractals render on init; wait for fractalComplete, then export
      worker.onmessage = (event: MessageEvent) => {
        const { type, payload: msgPayload } = event.data;
        if (type === "stats" && msgPayload.fractalComplete) {
          worker.postMessage({ type: "exportImage" });
        } else if (type === "imageExport") {
          downloadBlob(msgPayload.blob, opts.getFilename(), size);
          cleanup(worker);
        }
      };
    } else {
      // Attractors: send iterate messages to match density, then export
      const scaleFactor = (size / opts.canvasSize) ** 2;
      const targetIterations = Math.ceil(opts.totalIterations * scaleFactor);
      // Skip extra iterations if source had none yet
      const iterateCount = opts.totalIterations === 0
        ? 0
        : Math.max(1, Math.ceil(targetIterations / 2_000_000));
      let iteratesSent = 0;
      let statsReceived = 0;

      // Wait for initial render stats, then start iterating
      worker.onmessage = (event: MessageEvent) => {
        const { type, payload: msgPayload } = event.data;

        if (type === "stats") {
          statsReceived++;

          if (statsReceived === 1 && iterateCount > 0) {
            // Initial render done, start iterating
            const toSend = Math.min(iterateCount, 50);
            for (let i = 0; i < toSend; i++) {
              worker.postMessage({ type: "iterate" });
              iteratesSent++;
            }
          } else if (iteratesSent < iterateCount) {
            // Send more iterates
            const remaining = iterateCount - iteratesSent;
            const toSend = Math.min(remaining, 10);
            for (let i = 0; i < toSend; i++) {
              worker.postMessage({ type: "iterate" });
              iteratesSent++;
            }
          } else {
            // All iterations done — export
            worker.postMessage({ type: "exportImage" });
          }
        } else if (type === "imageExport") {
          downloadBlob(msgPayload.blob, opts.getFilename(), size);
          cleanup(worker);
        }
      };
    }

    function cleanup(w: Worker) {
      w.terminate();
      if (workerRef.current === w) {
        workerRef.current = null;
      }
      if (mountedRef.current) {
        setExporting(false);
      }
    }
  }, []);

  return { exporting, exportImage };
}

function downloadBlob(blob: Blob, filename: string, size: number) {
  // Insert resolution into filename: "type-preset.png" → "type-preset-4096.png"
  const dotIndex = filename.lastIndexOf(".");
  const name = dotIndex > 0
    ? `${filename.slice(0, dotIndex)}-${size}${filename.slice(dotIndex)}`
    : `${filename}-${size}`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = name;
  link.href = url;
  link.click();
  // Delay revocation to let the browser start the download
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
