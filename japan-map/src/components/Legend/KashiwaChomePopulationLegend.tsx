import { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Keep these in sync with your layer file
const TOTAL_FILL_ID = "kashiwa-chome-total-fill";
const AGING_FILL_ID = "kashiwa-chome-aging-fill";
const DENSITY_FILL_ID = "kashiwa-chome-density-fill";

type Props = {
  map?: mapboxgl.Map | null;
  totalVisible: boolean;
  agingVisible: boolean;
  densityVisible: boolean;
};

/** Parse a Mapbox "step" expression of the form:
 * ["step", inputExpr, color0, break1, color1, break2, color2, ...]
 */
function parseStepExpression(expr: any): { breaks: number[]; colors: string[] } | null {
  if (!Array.isArray(expr)) return null;
  if (expr[0] !== "step") return null;
  // expr = ["step", input, color0, b1, color1, b2, color2, ...]
  const parts = expr.slice(2); // [color0, b1, color1, b2, color2, ...]
  if (parts.length < 1) return null;

  const colors: string[] = [];
  const breaks: number[] = [];

  // color0 first
  colors.push(parts[0]);

  // then pairs of (break, color)
  for (let i = 1; i < parts.length; i += 2) {
    const br = parts[i];
    const col = parts[i + 1];
    if (typeof br === "number") breaks.push(br);
    if (typeof col === "string") colors.push(col);
  }

  return { breaks, colors };
}

/** Format numbers nicely; aging is percentage (0..1 → 0..100%) */
function formatBucketLabel(
  idx: number,
  breaks: number[],
  metric: "total" | "aging" | "density"
) {
  const fmtNum = (n: number) => n.toLocaleString("ja-JP");
  const fmtPct = (n: number) => `${(n * 100).toFixed(0)}%`;

  const format = (v: number) => (metric === "aging" ? fmtPct(v) : fmtNum(v));

  if (breaks.length === 0) return "すべて";

  if (idx === 0) {
    // "< break1"
    return `< ${format(breaks[0])}`;
  }
  if (idx < breaks.length) {
    // "breakN – < breakN+1"
    return `${format(breaks[idx - 1])} – < ${format(breaks[idx])}`;
  }
  // ">= last"
  return `≥ ${format(breaks[breaks.length - 1])}`;
}

function SwatchRow({
  title,
  colors,
  breaks,
  metric,
}: {
  title: string;
  colors: string[];
  breaks: number[];
  metric: "total" | "aging" | "density";
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-black font-medium">{title}</div>
      <div className="flex flex-col gap-1">
        {colors.map((c, i) => (
          <div key={`${title}-${i}`} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-6 rounded-sm border border-black/10"
              style={{ backgroundColor: c }}
            />
            <span className="text-[11px] text-black">
              {formatBucketLabel(i, breaks, metric)}
              {metric === "density" ? " 人/km²" : metric === "total" ? " 人" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KashiwaChomePopulationLegend({
  map,
  totalVisible,
  agingVisible,
  densityVisible,
}: Props) {
  const [total, setTotal] = useState<{ breaks: number[]; colors: string[] } | null>(null);
  const [aging, setAging] = useState<{ breaks: number[]; colors: string[] } | null>(null);
  const [density, setDensity] = useState<{ breaks: number[]; colors: string[] } | null>(null);

  // Read current paint expressions from the map and parse them.
  const refresh = useMemo(
    () => () => {
      if (!map) return;
      try {
        // TOTAL
        if (map.getLayer(TOTAL_FILL_ID)) {
          const expr = map.getPaintProperty(TOTAL_FILL_ID, "fill-color") as any;
          setTotal(parseStepExpression(expr));
        }
        // AGING
        if (map.getLayer(AGING_FILL_ID)) {
          const expr = map.getPaintProperty(AGING_FILL_ID, "fill-color") as any;
          setAging(parseStepExpression(expr));
        }
        // DENSITY
        if (map.getLayer(DENSITY_FILL_ID)) {
          const expr = map.getPaintProperty(DENSITY_FILL_ID, "fill-color") as any;
          setDensity(parseStepExpression(expr));
        }
      } catch {
        // ignore parse errors
      }
    },
    [map]
  );

  useEffect(() => {
    if (!map) return;
    // Initial read
    refresh();

    // Update on style/paint changes and when tiles finish loading
    const onStyle = () => refresh();
    const onData = () => refresh();
    const onIdle = () => refresh();

    map.on("styledata", onStyle);
    map.on("data", onData);
    map.on("idle", onIdle);

    return () => {
      map.off("styledata", onStyle);
      map.off("data", onData);
      map.off("idle", onIdle);
    };
  }, [map, refresh]);

  // Don’t render if none are visible
  const showAny = totalVisible || agingVisible || densityVisible;
  if (!showAny) return null;

  return (
    <div className="rounded-xl border border-gray-200 shadow bg-white backdrop-blur-sm p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-black">町丁目人口レイヤー</Label>
        <span className="text-[11px] text-muted-foreground">凡例</span>
      </div>

      {totalVisible && total && (
        <SwatchRow title="総数（G）" colors={total.colors} breaks={total.breaks} metric="total" />
      )}

      {totalVisible && (agingVisible || densityVisible) && <Separator />}

      {agingVisible && aging && (
        <SwatchRow title="高齢化率（K）" colors={aging.colors} breaks={aging.breaks} metric="aging" />
      )}

      {agingVisible && densityVisible && <Separator />}

      {densityVisible && density && (
        <SwatchRow
          title="人口密度（L）"
          colors={density.colors}
          breaks={density.breaks}
          metric="density"
        />
      )}
    </div>
  );
}
