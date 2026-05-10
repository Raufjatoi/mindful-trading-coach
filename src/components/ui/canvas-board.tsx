import { useRef, useState, useCallback } from "react";
import { Pen, ArrowRight, Square, Type, Undo2, Trash2, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionCard } from "./motion-card";

type Tool = "pen" | "arrow" | "rect" | "text";
const COLORS = ["#4ade80", "#f87171", "#ffffff", "#facc15", "#60a5fa", "#f472b6"];
const TOOLS: { id: Tool; Icon: typeof Pen; label: string }[] = [
  { id: "pen",   Icon: Pen,        label: "Pen"       },
  { id: "arrow", Icon: ArrowRight, label: "Arrow"     },
  { id: "rect",  Icon: Square,     label: "Rectangle" },
  { id: "text",  Icon: Type,       label: "Text"      },
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
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

export function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool]           = useState<Tool>("pen");
  const [color, setColor]         = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(3);
  const [hasImage, setHasImage]   = useState(false);
  const [drawing, setDrawing]     = useState(false);

  const startPos    = useRef({ x: 0, y: 0 });
  const undoStack   = useRef<ImageData[]>([]);
  const snapshot    = useRef<ImageData | null>(null);

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
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = brushSize;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return;
    const pos = getCanvasPos(e, c);
    const ctx = c.getContext("2d")!;

    if (tool === "text") {
      const text = window.prompt("Enter annotation text:");
      if (!text) return;
      applyStyle(ctx);
      ctx.font = `${brushSize * 5 + 12}px "Sora", sans-serif`;
      ctx.fillText(text, pos.x, pos.y);
      return;
    }

    saveUndo();
    startPos.current = pos;
    snapshot.current = ctx.getImageData(0, 0, c.width, c.height);
    setDrawing(true);

    if (tool === "pen") {
      applyStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const pos = getCanvasPos(e, c);

    applyStyle(ctx);

    if (tool === "pen") {
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

  const onMouseUp = () => setDrawing(false);

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
              onClick={() => setColor(c)}
              className={cn(
                "h-5 w-5 rounded-full border-2 transition",
                color === c ? "border-foreground scale-110" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="h-5 w-px bg-border/60" />

        {/* Brush size */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Size {brushSize}</span>
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
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40"
          style={{ minHeight: 480 }}
        >
          {!hasImage && (
            <label className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-3 text-muted-foreground transition hover:text-foreground">
              <Upload className="h-10 w-10" />
              <p className="font-display text-base font-medium">Upload a chart image</p>
              <p className="text-xs">Click or drag & drop · PNG / JPG</p>
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
            className="h-full w-full object-contain"
            style={{ cursor: tool === "text" ? "text" : "crosshair" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </div>

        {/* Notes panel */}
        <MotionCard className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Analysis Notes</p>
          {[
            { label: "What pattern do you see?",       placeholder: "Head & shoulders, double top…"     },
            { label: "Why did you win / lose?",         placeholder: "Entered too early, no confirmation…" },
            { label: "What would you do differently?", placeholder: "Wait for the retest, tighten SL…"  },
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
