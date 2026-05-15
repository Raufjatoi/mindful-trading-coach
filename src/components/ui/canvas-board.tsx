import { useRef, useState, useCallback } from "react";
import { Pen, ArrowRight, Square, Type, Undo2, Trash2, Download, Upload, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionCard } from "./motion-card";

type Tool = "pen" | "eraser" | "arrow" | "rect" | "text";
const COLORS = ["#4ade80", "#f87171", "#ffffff", "#facc15", "#60a5fa", "#f472b6"];
const TOOLS: { id: Tool; Icon: typeof Pen; label: string }[] = [
  { id: "pen",    Icon: Pen,        label: "Pen"       },
  { id: "eraser", Icon: Eraser,     label: "Eraser"    },
  { id: "arrow",  Icon: ArrowRight, label: "Arrow"     },
  { id: "rect",   Icon: Square,     label: "Rectangle" },
  { id: "text",   Icon: Type,       label: "Text"      },
];

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
) {
  const headLen = 18;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function getCanvasPos(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top)  * (canvas.height / rect.height),
  };
}

export function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool]           = useState<Tool>("pen");
  const [color, setColor]         = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(3);
  const [hasImage, setHasImage]   = useState(false);
  const [drawing, setDrawing]     = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const startPos  = useRef({ x: 0, y: 0 });
  const undoStack = useRef<ImageData[]>([]);
  const snapshot  = useRef<ImageData | null>(null);

  const saveUndo = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height);
    undoStack.current.push(data);
    if (undoStack.current.length > 20) undoStack.current.shift();
  }, []);

  const undo = () => {
    const c = canvasRef.current;
    if (!c || undoStack.current.length === 0) return;
    c.getContext("2d")!.putImageData(undoStack.current.pop()!, 0, 0);
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    saveUndo();
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHasImage(false);
  };

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.download = "chart-analysis.png";
    a.href = c.toDataURL("image/png");
    a.click();
  };

  const loadImage = (file: File) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        c.width  = img.width;
        c.height = img.height;
        ctx.drawImage(img, 0, 0);
        undoStack.current = [];
        setHasImage(true);
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyStyle = (ctx: CanvasRenderingContext2D) => {
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth   = brushSize * 4;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle   = color;
      ctx.lineWidth   = brushSize;
    }
    ctx.lineCap  = "round";
    ctx.lineJoin = "round";
  };

  // ── Shared start / move / end logic ──────────────────────────────────────────

  const startDraw = (clientX: number, clientY: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const pos = getCanvasPos(clientX, clientY, c);
    const ctx = c.getContext("2d")!;

    if (tool === "text") {
      const text = window.prompt("Enter annotation text:");
      if (!text) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color;
      ctx.font = `${brushSize * 5 + 12}px "Sora", sans-serif`;
      ctx.fillText(text, pos.x, pos.y);
      return;
    }

    saveUndo();
    startPos.current = pos;
    snapshot.current = ctx.getImageData(0, 0, c.width, c.height);
    setDrawing(true);

    if (tool === "pen" || tool === "eraser") {
      applyStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const continueDraw = (clientX: number, clientY: number) => {
    if (!drawing) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const pos = getCanvasPos(clientX, clientY, c);

    applyStyle(ctx);

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      if (snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
      applyStyle(ctx);
      if (tool === "arrow") {
        drawArrowHead(ctx, startPos.current.x, startPos.current.y, pos.x, pos.y);
      } else {
        ctx.strokeRect(
          startPos.current.x, startPos.current.y,
          pos.x - startPos.current.x, pos.y - startPos.current.y,
        );
      }
    }
  };

  const endDraw = () => {
    const c = canvasRef.current;
    if (c) c.getContext("2d")!.globalCompositeOperation = "source-over";
    setDrawing(false);
  };

  // ── Mouse handlers ────────────────────────────────────────────────────────────

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) =>
    startDraw(e.clientX, e.clientY);

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) =>
    continueDraw(e.clientX, e.clientY);

  // ── Touch handlers ────────────────────────────────────────────────────────────

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const t = e.touches[0];
    startDraw(t.clientX, t.clientY);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const t = e.touches[0];
    continueDraw(t.clientX, t.clientY);
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    endDraw();
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) loadImage(file);
  };

  const cursorStyle =
    tool === "text"   ? "text"
    : tool === "eraser" ? "cell"
    : "crosshair";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-xl">
        {/* Tool buttons */}
        <div className="flex items-center gap-1">
          {TOOLS.map(({ id, Icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => setTool(id)}
              className={cn(
                "rounded-lg p-2 transition",
                tool === id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-border/60" />

        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }}
              className={cn(
                "h-5 w-5 rounded-full border-2 transition",
                color === c && tool !== "eraser" ? "border-foreground scale-110" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="h-5 w-px bg-border/60" />

        {/* Brush size */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {tool === "eraser" ? `Eraser ${brushSize * 4}` : `Size ${brushSize}`}
          </span>
          <input
            type="range" min={1} max={14} value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-[var(--sage)]"
          />
        </div>

        <div className="h-5 w-px bg-border/60" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {[
            { label: "Undo",     Icon: Undo2,    fn: undo     },
            { label: "Clear",    Icon: Trash2,   fn: clear    },
            { label: "Save PNG", Icon: Download, fn: download },
          ].map(({ label, Icon, fn }) => (
            <button
              key={label}
              onClick={fn}
              title={label}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas + Notes */}
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        {/* Canvas area */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-card/40 transition-colors",
            isDragOver ? "border-[var(--sage)] bg-[color-mix(in_oklab,var(--sage)_8%,transparent)]" : "border-border/60",
          )}
          style={{ minHeight: 480 }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {!hasImage && (
            <label className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-3 text-muted-foreground transition hover:text-foreground">
              <Upload className="h-10 w-10" />
              <p className="font-display text-base font-medium">Upload a chart image</p>
              <p className="text-xs">Click or drag &amp; drop · PNG / JPG</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
              />
            </label>
          )}
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="h-full w-full object-contain touch-none"
            style={{ cursor: cursorStyle }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </div>

        {/* Notes panel */}
        <MotionCard className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Analysis Notes</p>
          {[
            { label: "What pattern do you see?",       placeholder: "Head & shoulders, double top…"      },
            { label: "Why did you win / lose?",         placeholder: "Entered too early, no confirmation…" },
            { label: "What would you do differently?", placeholder: "Wait for the retest, tighten SL…"   },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <p className="mb-1.5 text-[11px] text-muted-foreground">{label}</p>
              <textarea
                rows={3}
                placeholder={placeholder}
                className="w-full resize-none rounded-xl border border-border/60 bg-background/60 p-2.5 text-xs placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
              />
            </div>
          ))}
        </MotionCard>
      </div>
    </div>
  );
}
