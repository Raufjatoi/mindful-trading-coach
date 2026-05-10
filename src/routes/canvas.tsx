import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CanvasBoard } from "@/components/ui/canvas-board";

export const Route = createFileRoute("/canvas")({
  head: () => ({
    meta: [{ title: "Canvas — MindCandle" }],
  }),
  component: CanvasPage,
});

function CanvasPage() {
  return (
    <AppShell title="Canvas" subtitle="Upload a chart, annotate it, understand what happened.">
      <CanvasBoard />
    </AppShell>
  );
}
