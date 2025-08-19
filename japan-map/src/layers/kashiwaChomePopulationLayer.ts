
// /* -------------------- IDs & data -------------------- */
// export const KASHIWA_CHOME_SOURCE_ID = "kashiwa-chome-pop";
// export const KASHIWA_CHOME_TOTAL_FILL = "kashiwa-chome-total-fill";
// export const KASHIWA_CHOME_TOTAL_OUTLINE = "kashiwa-chome-total-outline";
// export const KASHIWA_CHOME_AGING_FILL = "kashiwa-chome-aging-fill";
// export const KASHIWA_CHOME_AGING_OUTLINE = "kashiwa-chome-aging-outline";
// export const KASHIWA_CHOME_DENSITY_FILL = "kashiwa-chome-density-fill";
// export const KASHIWA_CHOME_DENSITY_OUTLINE = "kashiwa-chome-density-outline";
// export const KASHIWA_CHOME_LABELS = "kashiwa-chome-labels";

// export const KASHIWA_CHOME_TOTAL_2040_FILL = "kashiwa-chome-total-2040-fill";
// export const KASHIWA_CHOME_TOTAL_2040_OUTLINE = "kashiwa-chome-total-2040-outline";
// export const KASHIWA_CHOME_AGING_2040_FILL = "kashiwa-chome-aging-2040-fill";
// export const KASHIWA_CHOME_AGING_2040_OUTLINE = "kashiwa-chome-aging-2040-outline";

// const DATA_URL = "/data/kashiwa_population_with_estimate.geojson";

// type Metric = "total" | "aging" | "density" | "total_2040" | "aging_2040";
// const METRIC_PROP: Record<Metric, string> = {
//     total: "総数",
//     aging: "高齢化率",
//     density: "人口密度（人/km²）",
//     total_2040: "total_2040",
//     aging_2040: "aging_rate_2040"
// };

// type PaletteName = "Blues" | "Greens" | "Oranges" | "Purples";
// const PALETTES: Record<PaletteName, string[]> = {
//     Blues: ["#f1eef6", "#bdc9e1", "#74a9cf", "#2b8cbe", "#045a8d"],
//     Greens: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
//     Oranges: ["#fff5eb", "#fdd0a2", "#f16913", "#d94801", "#7f2704"],
//     Purples: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"],
// };

// /* -------------------- mesh cleanup -------------------- */
// function removeAllMeshes(map: mapboxgl.Map) {
//     const L = [
//         "mesh-1km-fill", "mesh-1km-outline", "1km-mesh-fill", "1km-mesh-line", "grid-1km",
//         "mesh-500m-fill", "mesh-500m-outline", "grid-500m",
//         "mesh-250m-fill", "mesh-250m-outline", "grid-250m",
//         "mesh-100m-fill", "mesh-100m-outline", "grid-100m",
//         "population-mesh-fill", "population-mesh-line"
//     ];
//     const S = [
//         "mesh1km", "1km-mesh", "grid-1km",
//         "mesh500m", "grid-500m",
//         "mesh250m", "grid-250m",
//         "mesh100m", "grid-100m",
//         "population-mesh", "kashiwa-mesh-100m"
//     ];
//     L.forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
//     const style = map.getStyle?.();
//     const pat = [/mesh/i, /grid/i, /1\s*km/i, /1000m/i, /500m/i, /250m/i, /100m/i];
//     for (const lyr of style?.layers ?? []) {
//         const id = lyr.id;
//         const src = (lyr as any).source as string | undefined;
//         if (pat.some(rx => rx.test(id)) || (src && pat.some(rx => rx.test(src)))) {
//             if (map.getLayer(id)) map.removeLayer(id);
//         }
//     }
//     S.forEach(sid => {
//         if (!map.getSource(sid)) return;
//         const stillUsed = (map.getStyle()?.layers ?? []).some(l => (l as any).source === sid);
//         if (!stillUsed) map.removeSource(sid);
//     });
// }

// /* -------------------- source & base layers -------------------- */
// async function ensureSource(map: mapboxgl.Map) {
//     const resp = await fetch(DATA_URL);
//     const data: GeoJSON.FeatureCollection = await resp.json();

//     if (!map.getSource(KASHIWA_CHOME_SOURCE_ID)) {
//         map.addSource(KASHIWA_CHOME_SOURCE_ID, { type: "geojson", data, promoteId: "KEYCODE2" });
//     } else {
//         (map.getSource(KASHIWA_CHOME_SOURCE_ID) as mapboxgl.GeoJSONSource).setData(data);
//     }
// }

// function addBaseLayers(map: mapboxgl.Map) {
//     function addFillLine(
//         map: mapboxgl.Map,
//         fillId: string,
//         lineId: string,
//         paint: mapboxgl.FillPaint,
//         hidden = false
//     ) {
//         if (!map.getLayer(fillId)) {
//             const fillSpec: any = { id: fillId, type: "fill", source: KASHIWA_CHOME_SOURCE_ID, paint };
//             if (hidden) fillSpec.layout = { visibility: "none" };
//             map.addLayer(fillSpec);
//         }

//         if (!map.getLayer(lineId)) {
//             const lineSpec: any = {
//                 id: lineId,
//                 type: "line",
//                 source: KASHIWA_CHOME_SOURCE_ID,
//                 paint: { "line-color": "#555", "line-width": 0.6, "line-opacity": 0.8 }
//             };
//             if (hidden) lineSpec.layout = { visibility: "none" };
//             map.addLayer(lineSpec);
//         }
//     }
//     addFillLine(
//         map,
//         KASHIWA_CHOME_TOTAL_FILL,
//         KASHIWA_CHOME_TOTAL_OUTLINE,
//         defaultPaint("total", "Purples")
//     );
//     addFillLine(
//         map,
//         KASHIWA_CHOME_AGING_FILL,
//         KASHIWA_CHOME_AGING_OUTLINE,
//         defaultPaint("aging", "Greens"),
//         true
//     );
//     addFillLine(
//         map,
//         KASHIWA_CHOME_DENSITY_FILL,
//         KASHIWA_CHOME_DENSITY_OUTLINE,
//         defaultPaint("density", "Oranges"),
//         true
//     );
//     addFillLine(
//         map,
//         KASHIWA_CHOME_TOTAL_2040_FILL,
//         KASHIWA_CHOME_TOTAL_2040_OUTLINE,
//         defaultPaint("total_2040", "Blues"),
//         true
//     );
//     addFillLine(
//         map,
//         KASHIWA_CHOME_AGING_2040_FILL,
//         KASHIWA_CHOME_AGING_2040_OUTLINE,
//         defaultPaint("aging_2040", "Oranges"),
//         true
//     );

//     enforceLayerOrder(map);
// }

// function defaultPaint(metric: Metric, palette: PaletteName): mapboxgl.FillPaint {
//     const prop = METRIC_PROP[metric];
//     const colors = PALETTES[palette];
//     const anchors = metric === "aging" ? [0, 0.15, 0.25, 0.35, 0.45] : [0, 1000, 5000, 10000, 20000];
//     return {
//         "fill-color": buildStep(prop, anchors, colors) as any,
//         "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.9, 0.7]
//     };
// }

// /* -------------------- expressions & stats -------------------- */
// function buildStep(prop: string, breaks: number[], colors: string[]): any[] {
//     const expr: any[] = ["step", ["to-number", ["get", prop]], colors[0]]; // Initialize with the first color
//     for (let i = 1; i < colors.length; i++) {
//         expr.push(breaks[i - 1] ?? 0, colors[i]);  // Set each breakpoint with the corresponding color
//     }
//     return expr;
// }
// function getValuesFromSource(map: mapboxgl.Map, metric: Metric): number[] {
//     const src = map.getSource(KASHIWA_CHOME_SOURCE_ID) as mapboxgl.GeoJSONSource;
//     const fc = (src as any)?._data as GeoJSON.FeatureCollection | undefined;
//     const prop = METRIC_PROP[metric];
//     if (!fc) return [];
//     const vals: number[] = [];
//     for (const f of fc.features as any[]) {
//         const v = Number(f?.properties?.[prop]);
//         if (!Number.isNaN(v)) vals.push(v);
//     }
//     return vals.sort((a, b) => a - b);
// }
// function quantileBreaks(values: number[], bins = 5): number[] {
//     if (!values.length) return [0, 0, 0, 0];
//     const qs: number[] = [];
//     for (let i = 1; i < bins; i++) qs.push(values[Math.floor((i / bins) * (values.length - 1))]);
//     return qs;
// }
// function equalBreaks(values: number[], bins = 5): number[] {
//     if (!values.length) return [0, 0, 0, 0];
//     const min = values[0], max = values[values.length - 1];
//     const step = (max - min) / bins;
//     const br: number[] = [];
//     for (let i = 1; i < bins; i++) br.push(Number((min + step * i).toFixed(2)));
//     return br;
// }
// function jenksBreaks(values: number[], bins = 5): number[] {
//     if (values.length < bins) return quantileBreaks(values, bins);
//     const mat1 = Array(values.length + 1).fill(0).map(() => Array(bins + 1).fill(0));
//     const mat2 = Array(values.length + 1).fill(0).map(() => Array(bins + 1).fill(0));
//     for (let i = 1; i <= bins; i++) { mat1[0][i] = 1; mat2[0][i] = 0; for (let j = 1; j <= values.length; j++) mat2[j][i] = Infinity; }
//     for (let l = 2; l <= values.length; l++) {
//         let s1 = 0, s2 = 0, w = 0;
//         for (let m = 1; m <= l; m++) {
//             const i3 = l - m + 1; const val = values[i3 - 1];
//             s2 += val * val; s1 += val; w++;
//             const v = s2 - (s1 * s1) / w;
//             if (i3 !== 1) {
//                 for (let j = 2; j <= bins; j++) {
//                     if (mat2[l][j] >= (v + mat2[i3 - 1][j - 1])) { mat1[l][j] = i3; mat2[l][j] = v + mat2[i3 - 1][j - 1]; }
//                 }
//             }
//         }
//         mat1[l][1] = 1; mat2[l][1] = s2 - (s1 * s1) / w;
//     }
//     const kclass = Array(bins).fill(0); let k = values.length;
//     for (let j = bins; j >= 2; j--) { const id = mat1[k][j] - 1; kclass[j - 2] = values[id]; k = mat1[k][j] - 1; }
//     return kclass;
// }

// /* -------------------- interactions & labels -------------------- */
// let interactionsBound = false;
// function bindInteractions(map: mapboxgl.Map, popup?: mapboxgl.Popup) {
//     if (interactionsBound || !popup) return;
//     interactionsBound = true;

//     const ids = [KASHIWA_CHOME_TOTAL_FILL, KASHIWA_CHOME_AGING_FILL, KASHIWA_CHOME_DENSITY_FILL, KASHIWA_CHOME_TOTAL_2040_FILL, KASHIWA_CHOME_AGING_2040_FILL];
//     let hoveredId: string | number | null = null;

//     ids.forEach(id => {
//         map.on("mousemove", id, (e) => {
//             const f = e.features?.[0] as any; if (!f) return;
//             if (hoveredId !== null) map.setFeatureState({ source: KASHIWA_CHOME_SOURCE_ID, id: hoveredId }, { hover: false });
//             hoveredId = f.id ?? f.properties?.KEYCODE2;
//             if (hoveredId !== null) map.setFeatureState({ source: KASHIWA_CHOME_SOURCE_ID, id: hoveredId }, { hover: true });

//             map.getCanvas().style.cursor = "pointer";
//             const p = f.properties || {};
//             const name = p["町丁字名"] ?? p["S_NAME"] ?? "N/A";
//             const total = p["総数"] ?? "N/A";
//             const aging = p["高齢化率"]; const agingPct = (aging != null) ? `${(Number(aging) * 100).toFixed(1)}%` : "N/A";
//             const density = p["人口密度（人/km²）"];
//             const total_2040 = p["total_2040"];
//             const aging_2040 = p["aging_rate_2040"];
//             popup.setLngLat(e.lngLat).setHTML(`
//         <div class="rounded-xl border bg-white p-3 shadow-xl space-y-1 w-64 text-xs">
//           <div class="font-semibold">${name}</div>
//           <div><strong>総数:</strong> ${total}</div>
//           <div><strong>高齢化率:</strong> ${agingPct}</div>
//           <div><strong>人口密度:</strong> ${density ?? "N/A"} 人/km²</div>
//           <div><strong>2040年_総数:</strong> ${total_2040 ?? "N/A"} </div>
//           <div><strong>2040年_高齢化率:</strong> ${aging_2040 ?? "N/A"}</div>
//         </div>
//       `).addTo(map);
//         });
//         map.on("mouseleave", id, () => {
//             if (hoveredId !== null) map.setFeatureState({ source: KASHIWA_CHOME_SOURCE_ID, id: hoveredId }, { hover: false });
//             hoveredId = null;
//             map.getCanvas().style.cursor = "";
//             popup?.remove();
//         });
//     });
// }

// function ensureLabels(map: mapboxgl.Map) {
//     if (map.getLayer(KASHIWA_CHOME_LABELS)) return;
//     map.addLayer({
//         id: KASHIWA_CHOME_LABELS,
//         type: "symbol",
//         source: KASHIWA_CHOME_SOURCE_ID,
//         layout: { "text-field": ["get", "町丁字名"], "text-size": 11, "text-allow-overlap": false, "text-padding": 2, "visibility": "none" },
//         paint: { "text-color": "#111", "text-halo-color": "rgba(255,255,255,.9)", "text-halo-width": 1.2 }
//     });
// }

// /* -------------------- ordering & visibility -------------------- */
// function enforceLayerOrder(map: mapboxgl.Map) {
//     const order = [
//         KASHIWA_CHOME_TOTAL_FILL,
//         KASHIWA_CHOME_AGING_FILL,
//         KASHIWA_CHOME_DENSITY_FILL,
//         KASHIWA_CHOME_TOTAL_2040_FILL,
//         KASHIWA_CHOME_AGING_2040_FILL,
//         KASHIWA_CHOME_TOTAL_OUTLINE,
//         KASHIWA_CHOME_AGING_OUTLINE,
//         KASHIWA_CHOME_DENSITY_OUTLINE,
//         KASHIWA_CHOME_TOTAL_2040_OUTLINE,
//         KASHIWA_CHOME_AGING_2040_OUTLINE,
//         KASHIWA_CHOME_LABELS
//     ].filter(id => map.getLayer(id));
//     for (let i = 0; i < order.length; i++) {
//         const id = order[i], before = order[i + 1];
//         try { map.moveLayer(id, before); } catch { }
//     }
// }

// function setMetricVisibility(map: mapboxgl.Map, metric: Metric, visible: boolean) {
//     const ids = metric === "total"
//         ? { fill: KASHIWA_CHOME_TOTAL_FILL, line: KASHIWA_CHOME_TOTAL_OUTLINE }
//         : metric === "aging"
//             ? { fill: KASHIWA_CHOME_AGING_FILL, line: KASHIWA_CHOME_AGING_OUTLINE }
//             : metric === "density" ? { fill: KASHIWA_CHOME_DENSITY_FILL, line: KASHIWA_CHOME_DENSITY_OUTLINE }
//                 : metric === "total_2040" ? { fill: KASHIWA_CHOME_TOTAL_2040_FILL, line: KASHIWA_CHOME_TOTAL_2040_OUTLINE }
//                     : { fill: KASHIWA_CHOME_AGING_2040_FILL, line: KASHIWA_CHOME_AGING_2040_OUTLINE }
//     const v = visible ? "visible" : "none";
//     if (map.getLayer(ids.fill)) map.setLayoutProperty(ids.fill, "visibility", v);
//     if (map.getLayer(ids.line)) map.setLayoutProperty(ids.line, "visibility", v);
// }

// /* -------------------- public togglers (independent stacking) -------------------- */
// export async function toggleKashiwaChomeTotalLayer(
//     map: mapboxgl.Map,
//     visible: boolean,
//     setIsLoading: (b: boolean) => void,
//     setVisible: (b: boolean) => void,
//     popup?: mapboxgl.Popup
// ) {
//     try {
//         setIsLoading(true);
//         if (!visible) {
//             removeAllMeshes(map);
//             await ensureSource(map);
//             addBaseLayers(map);
//             bindInteractions(map, popup);
//             setMetricVisibility(map, "total", true);
//             enforceLayerOrder(map);
//             setVisible(true);
//         } else {
//             setMetricVisibility(map, "total", false);
//             setVisible(false);
//         }
//     } finally { map.once("idle", () => setIsLoading(false)); }
// }

// export async function toggleKashiwaChomeAgingLayer(
//     map: mapboxgl.Map,
//     visible: boolean,
//     setIsLoading: (b: boolean) => void,
//     setVisible: (b: boolean) => void,
//     popup?: mapboxgl.Popup
// ) {
//     try {
//         setIsLoading(true);
//         if (!visible) {
//             removeAllMeshes(map);
//             await ensureSource(map);
//             addBaseLayers(map);
//             bindInteractions(map, popup);
//             setMetricVisibility(map, "aging", true);
//             enforceLayerOrder(map);
//             setVisible(true);
//         } else {
//             setMetricVisibility(map, "aging", false);
//             setVisible(false);
//         }
//     } finally { map.once("idle", () => setIsLoading(false)); }
// }

// export async function toggleKashiwaChomeDensityLayer(
//     map: mapboxgl.Map,
//     visible: boolean,
//     setIsLoading: (b: boolean) => void,
//     setVisible: (b: boolean) => void,
//     popup?: mapboxgl.Popup
// ) {
//     try {
//         setIsLoading(true);
//         if (!visible) {
//             removeAllMeshes(map);
//             await ensureSource(map);
//             addBaseLayers(map);
//             bindInteractions(map, popup);
//             setMetricVisibility(map, "density", true);
//             enforceLayerOrder(map);
//             setVisible(true);
//         } else {
//             setMetricVisibility(map, "density", false);
//             setVisible(false);
//         }
//     } finally { map.once("idle", () => setIsLoading(false)); }
// }

// export async function toggleKashiwaChomeTotal2040Layer(
//     map: mapboxgl.Map,
//     visible: boolean,
//     setIsLoading: (b: boolean) => void,
//     setVisible: (b: boolean) => void,
//     popup?: mapboxgl.Popup
// ) {
//     try {
//         setIsLoading(true);
//         if (!visible) {
//             removeAllMeshes(map);
//             await ensureSource(map);
//             addBaseLayers(map);
//             bindInteractions(map, popup);
//             setMetricVisibility(map, "total_2040", true);
//             enforceLayerOrder(map);
//             setVisible(true);
//         } else {
//             setMetricVisibility(map, "total_2040", false);
//             setVisible(false);
//         }
//     } finally { map.once("idle", () => setIsLoading(false)); }
// }

// export async function toggleKashiwaChomeAging2040Layer(
//     map: mapboxgl.Map,
//     visible: boolean,
//     setIsLoading: (b: boolean) => void,
//     setVisible: (b: boolean) => void,
//     popup?: mapboxgl.Popup
// ) {
//     try {
//         setIsLoading(true);
//         if (!visible) {
//             removeAllMeshes(map);
//             await ensureSource(map);
//             addBaseLayers(map);
//             bindInteractions(map, popup);
//             setMetricVisibility(map, "aging_2040", true);
//             enforceLayerOrder(map);
//             setVisible(true);
//         } else {
//             setMetricVisibility(map, "aging_2040", false);
//             setVisible(false);
//         }
//     } finally { map.once("idle", () => setIsLoading(false)); }
// }


// /* -------------------- public styling APIs (for your React legend UI) -------------------- */
// type Method = "quantile" | "equal" | "jenks";

// /** Update the choropleth palette / method / bin count / opacity for a metric. */
// export function updateKashiwaChomeStyle(
//     map: mapboxgl.Map,
//     metric: Metric,
//     opts: { palette?: PaletteName; method?: Method; bins?: number; opacity?: number }
// ) {
//     const palette = opts.palette ?? (metric === "aging" ? "Greens" : metric === "density" ? "Oranges" : metric === "total_2040" ? "Blues" : "Oranges");
//     const method = opts.method ?? "quantile";
//     const bins = Math.max(3, Math.min(7, opts.bins ?? 5));
//     const opacity = opts.opacity ?? 0.7;

//     const values = getValuesFromSource(map, metric);
//     const breaks = method === "equal" ? equalBreaks(values, bins)
//         : method === "jenks" ? jenksBreaks(values, bins)
//             : quantileBreaks(values, bins);

//     const prop = METRIC_PROP[metric];
//     const colors = PALETTES[palette];

//     const fillId =
//         metric === "total" ? KASHIWA_CHOME_TOTAL_FILL :
//             metric === "aging" ? KASHIWA_CHOME_AGING_FILL : KASHIWA_CHOME_DENSITY_FILL;

//     if (map.getLayer(fillId)) {
//         map.setPaintProperty(fillId, "fill-color", buildStep(prop, breaks, colors) as any);
//         map.setPaintProperty(fillId, "fill-opacity", [
//             "case", ["boolean", ["feature-state", "hover"], false], Math.min(1, opacity + 0.2), opacity
//         ]);
//     }
// }

// /** Optional: filter to a visible numeric range for any metric. */
// export function setKashiwaChomeRangeFilter(
//     map: mapboxgl.Map,
//     metric: Metric,
//     min: number | null,
//     max: number | null
// ) {
//     const prop = METRIC_PROP[metric];
//     const conds: any[] = [];
//     if (min != null) conds.push([">=", ["to-number", ["get", prop]], min]);
//     if (max != null) conds.push(["<=", ["to-number", ["get", prop]], max]);
//     const filter = conds.length ? ["all", ...conds] : null;

//     const ids = metric === "total"
//         ? [KASHIWA_CHOME_TOTAL_FILL, KASHIWA_CHOME_TOTAL_OUTLINE]
//         : metric === "aging"
//             ? [KASHIWA_CHOME_AGING_FILL, KASHIWA_CHOME_AGING_OUTLINE]
//             : metric === "total_2040" ?
//                 [KASHIWA_CHOME_TOTAL_2040_FILL, KASHIWA_CHOME_TOTAL_2040_OUTLINE]
//                 : metric === "aging_2040" ?
//                     [KASHIWA_CHOME_AGING_2040_FILL, KASHIWA_CHOME_AGING_2040_OUTLINE]
//                     : [KASHIWA_CHOME_DENSITY_FILL, KASHIWA_CHOME_DENSITY_OUTLINE];

//     ids.forEach(id => { if (map.getLayer(id)) map.setFilter(id, filter as any); });
// }

// /** Toggle labels (町丁字名 or the metric value). */
// export function setKashiwaChomeLabelsVisible(
//     map: mapboxgl.Map,
//     visible: boolean,
//     mode: "name" | "metric" = "name",
//     metric: Metric = "total"
// ) {
//     ensureLabels(map);
//     if (!map.getLayer(KASHIWA_CHOME_LABELS)) return;

//     if (mode === "name") {
//         map.setLayoutProperty(KASHIWA_CHOME_LABELS, "text-field", ["get", "町丁字名"]);
//     } else {
//         const prop = METRIC_PROP[metric];
//         const fmt = metric === "aging"
//             ? ["concat", ["to-string", ["round", ["*", ["to-number", ["get", prop]], 100]]], "%"]
//             : ["to-string", ["to-number", ["get", prop]]];
//         map.setLayoutProperty(KASHIWA_CHOME_LABELS, "text-field", fmt as any);
//     }
//     map.setLayoutProperty(KASHIWA_CHOME_LABELS, "visibility", visible ? "visible" : "none");
//     enforceLayerOrder(map);
// }


/* -----------------------------------------------------
   Kashiwa Chome Choropleth — robust version
   Fixes:
   - correct anchors for aging_2040
   - update style for 2040 layers
   - cache data (no ._data)
   - palette <-> bins alignment
   - throttle popup & reuse once
   - safer layer ordering
   - spinner fallback
   - numeric normalization
----------------------------------------------------- */

/* -------------------- IDs & data -------------------- */
export const KASHIWA_CHOME_SOURCE_ID = "kashiwa-chome-pop";
export const KASHIWA_CHOME_TOTAL_FILL = "kashiwa-chome-total-fill";
export const KASHIWA_CHOME_TOTAL_OUTLINE = "kashiwa-chome-total-outline";
export const KASHIWA_CHOME_AGING_FILL = "kashiwa-chome-aging-fill";
export const KASHIWA_CHOME_AGING_OUTLINE = "kashiwa-chome-aging-outline";
export const KASHIWA_CHOME_DENSITY_FILL = "kashiwa-chome-density-fill";
export const KASHIWA_CHOME_DENSITY_OUTLINE = "kashiwa-chome-density-outline";
export const KASHIWA_CHOME_LABELS = "kashiwa-chome-labels";

export const KASHIWA_CHOME_TOTAL_2040_FILL = "kashiwa-chome-total-2040-fill";
export const KASHIWA_CHOME_TOTAL_2040_OUTLINE = "kashiwa-chome-total-2040-outline";
export const KASHIWA_CHOME_AGING_2040_FILL = "kashiwa-chome-aging-2040-fill";
export const KASHIWA_CHOME_AGING_2040_OUTLINE = "kashiwa-chome-aging-2040-outline";

const DATA_URL = "/data/kashiwa_population_with_estimate.geojson";

type Metric = "total" | "aging" | "density" | "total_2040" | "aging_2040";
const METRIC_PROP: Record<Metric, string> = {
    total: "総数",
    aging: "高齢化率",
    density: "人口密度（人/km²）",
    total_2040: "total_2040",
    aging_2040: "aging_rate_2040",
};

type PaletteName = "Blues" | "Greens" | "Oranges" | "Purples" | "OrangeRed";
const PALETTES: Record<PaletteName, string[]> = {
    Blues: ["#f1eef6", "#bdc9e1", "#74a9cf", "#2b8cbe", "#045a8d"],
    Greens: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    Oranges: ["#fff5eb", "#fdd0a2", "#f16913", "#d94801", "#7f2704"],
    Purples: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"],
    OrangeRed: ["#fee8c8", "#fdbb84", "#fc8d59", "#e34a33", "#b30000"],
};

/* -------------------- cached data -------------------- */
// Don’t rely on private source._data — keep our own cache.
let CACHED_DATA: GeoJSON.FeatureCollection | null = null;

/* -------------------- utilities -------------------- */
function isAging(metric: Metric) {
    return metric === "aging" || metric === "aging_2040";
}

function defaultAnchorsFor(metric: Metric): number[] {
    // sensible defaults if you haven’t computed breaks yet
    if (isAging(metric)) return [0.10, 0.20, 0.30, 0.40]; // for 0-1 ratios
    // counts/density – safely low to high (tweak as needed)
    return [1000, 5000, 10000, 20000];
}

function samplePalette(base: string[], bins: number): string[] {
    // Resample a 5-color base palette to exactly `bins` colors.
    if (bins <= 0) return [];
    if (bins === base.length) return base.slice();
    const out: string[] = [];
    for (let i = 0; i < bins; i++) {
        const t = bins === 1 ? 0 : i / (bins - 1);
        const idx = Math.round(t * (base.length - 1));
        out.push(base[idx]);
    }
    return out;
}

/* -------------------- mesh cleanup -------------------- */
function removeAllMeshes(map: mapboxgl.Map) {
    const L = [
        "mesh-1km-fill", "mesh-1km-outline", "1km-mesh-fill", "1km-mesh-line", "grid-1km",
        "mesh-500m-fill", "mesh-500m-outline", "grid-500m",
        "mesh-250m-fill", "mesh-250m-outline", "grid-250m",
        "mesh-100m-fill", "mesh-100m-outline", "grid-100m",
        "population-mesh-fill", "population-mesh-line",
    ];
    const S = [
        "mesh1km", "1km-mesh", "grid-1km",
        "mesh500m", "grid-500m",
        "mesh250m", "grid-250m",
        "mesh100m", "grid-100m",
        "population-mesh", "kashiwa-mesh-100m",
    ];
    L.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });

    const style = map.getStyle?.();
    if (style?.layers?.length) {
        const pat = [/mesh(?:\b|[-_])/i, /\bgrid\b/i, /\b1\s*km\b/i, /\b1000m\b/i, /\b500m\b/i, /\b250m\b/i, /\b100m\b/i];
        for (const lyr of style.layers) {
            const id = lyr.id;
            const src = (lyr as any).source as string | undefined;
            // Be a bit stricter to avoid nuking unrelated things
            if (pat.some((rx) => rx.test(id)) || (src && pat.some((rx) => rx.test(src)))) {
                try { if (map.getLayer(id)) map.removeLayer(id); } catch { }
            }
        }
    }

    S.forEach((sid) => {
        if (!map.getSource(sid)) return;
        const stillUsed = (map.getStyle()?.layers ?? []).some((l) => (l as any).source === sid);
        if (!stillUsed) map.removeSource(sid);
    });
}

/* -------------------- source & base layers -------------------- */
async function ensureSource(map: mapboxgl.Map) {
    // If we already have the source and cached data, we’re good
    const hasSource = !!map.getSource(KASHIWA_CHOME_SOURCE_ID);
    if (!CACHED_DATA) {
        const resp = await fetch(DATA_URL);
        const raw: GeoJSON.FeatureCollection = await resp.json();
        // normalize numerics (handles "1,234" strings etc.)
        CACHED_DATA = {
            ...raw,
            features: raw.features.map((f: any) => {
                const p = { ...(f.properties ?? {}) };
                const fix = (k: string) => {
                    if (p[k] == null) return;
                    if (typeof p[k] === "number") return;
                    if (typeof p[k] === "string") {
                        const s = p[k].replace?.(/,/g, "");
                        const n = Number(s);
                        if (!Number.isNaN(n)) p[k] = n;
                    }
                };
                fix("総数");
                fix("人口密度（人/km²）");
                fix("高齢化率");
                fix("total_2040");
                fix("aging_rate_2040");
                return { ...f, properties: p };
            }),
        };
    }

    if (!hasSource) {
        map.addSource(KASHIWA_CHOME_SOURCE_ID, {
            type: "geojson",
            data: CACHED_DATA,
            promoteId: "KEYCODE2",
        } as any);
    } else {
        (map.getSource(KASHIWA_CHOME_SOURCE_ID) as mapboxgl.GeoJSONSource).setData(CACHED_DATA);
    }
}

function buildStep(prop: string, breaks: number[], colors: string[]): any[] {
    // colors.length = bins; breaks.length = bins - 1
    const bins = colors.length;
    const neededStops = Math.max(0, bins - 1);
    const usedBreaks = breaks.slice(0, neededStops);
    const expr: any[] = ["step", ["to-number", ["get", prop]], colors[0]];
    for (let i = 0; i < usedBreaks.length; i++) expr.push(usedBreaks[i], colors[i + 1]);
    return expr;
}

function getValues(metric: Metric): number[] {
    if (!CACHED_DATA) return [];
    const prop = METRIC_PROP[metric];
    const vals: number[] = [];
    for (const f of CACHED_DATA.features as any[]) {
        const v = Number(f?.properties?.[prop]);
        if (!Number.isNaN(v)) vals.push(v);
    }
    return vals.sort((a, b) => a - b);
}

function quantileBreaks(values: number[], bins = 5): number[] {
    if (!values.length) return defaultAnchorsFor("total");
    const br: number[] = [];
    for (let i = 1; i < bins; i++) br.push(values[Math.floor((i / bins) * (values.length - 1))]);
    return br;
}
function equalBreaks(values: number[], bins = 5): number[] {
    if (!values.length) return defaultAnchorsFor("total");
    const min = values[0], max = values[values.length - 1];
    const step = (max - min) / bins;
    const br: number[] = [];
    for (let i = 1; i < bins; i++) br.push(Number((min + step * i).toFixed(6)));
    return br;
}
function jenksBreaks(values: number[], bins = 5): number[] {
    if (values.length < bins) return quantileBreaks(values, bins);
    const mat1 = Array(values.length + 1).fill(0).map(() => Array(bins + 1).fill(0));
    const mat2 = Array(values.length + 1).fill(0).map(() => Array(bins + 1).fill(0));
    for (let i = 1; i <= bins; i++) { mat1[0][i] = 1; mat2[0][i] = 0; for (let j = 1; j <= values.length; j++) mat2[j][i] = Infinity; }
    for (let l = 2; l <= values.length; l++) {
        let s1 = 0, s2 = 0, w = 0;
        for (let m = 1; m <= l; m++) {
            const i3 = l - m + 1; const val = values[i3 - 1];
            s2 += val * val; s1 += val; w++;
            const v = s2 - (s1 * s1) / w;
            if (i3 !== 1) for (let j = 2; j <= bins; j++) if (mat2[l][j] >= (v + mat2[i3 - 1][j - 1])) { mat1[l][j] = i3; mat2[l][j] = v + mat2[i3 - 1][j - 1]; }
        }
        mat1[l][1] = 1; mat2[l][1] = s2 - (s1 * s1) / w;
    }
    const kclass = Array(bins).fill(0); let k = values.length;
    for (let j = bins; j >= 2; j--) { const id = mat1[k][j] - 1; kclass[j - 2] = values[id]; k = mat1[k][j] - 1; }
    return kclass;
}

function defaultPaint(metric: Metric, palette: PaletteName): mapboxgl.FillPaint {
    const prop = METRIC_PROP[metric];
    const values = getValues(metric);
    const bins = 5;
    const colors = samplePalette(PALETTES[palette], bins);
    const breaks = values.length ? quantileBreaks(values, bins) : defaultAnchorsFor(metric);
    return {
        "fill-color": buildStep(prop, breaks, colors) as any,
        "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.9, 0.7],
    };
}

function addBaseLayers(map: mapboxgl.Map) {
    const addFillLine = (
        fillId: string,
        lineId: string,
        paint: mapboxgl.FillPaint,
        hidden = false
    ) => {
        if (!map.getLayer(fillId)) {
            const fillSpec: any = { id: fillId, type: "fill", source: KASHIWA_CHOME_SOURCE_ID, paint };
            if (hidden) fillSpec.layout = { visibility: "none" };
            map.addLayer(fillSpec);
        }
        if (!map.getLayer(lineId)) {
            const lineSpec: any = {
                id: lineId,
                type: "line",
                source: KASHIWA_CHOME_SOURCE_ID,
                paint: { "line-color": "#555", "line-width": 0.6, "line-opacity": 0.8 },
            };
            if (hidden) lineSpec.layout = { visibility: "none" };
            map.addLayer(lineSpec);
        }
    };

    addFillLine(KASHIWA_CHOME_TOTAL_FILL, KASHIWA_CHOME_TOTAL_OUTLINE, defaultPaint( "total", "Purples"), true);
    addFillLine(KASHIWA_CHOME_AGING_FILL, KASHIWA_CHOME_AGING_OUTLINE, defaultPaint( "aging", "Greens"), true);
    addFillLine(KASHIWA_CHOME_DENSITY_FILL, KASHIWA_CHOME_DENSITY_OUTLINE, defaultPaint( "density", "Oranges"), true);
    addFillLine(KASHIWA_CHOME_TOTAL_2040_FILL, KASHIWA_CHOME_TOTAL_2040_OUTLINE, defaultPaint( "total_2040", "Blues"), true);
    // FIX: aging_2040 uses aging anchors
    addFillLine(KASHIWA_CHOME_AGING_2040_FILL, KASHIWA_CHOME_AGING_2040_OUTLINE, defaultPaint( "aging_2040", "OrangeRed"), true);

    enforceLayerOrder(map);
}

/* -------------------- interactions & labels -------------------- */
const boundMaps = new WeakSet<mapboxgl.Map>();
function bindInteractions(map: mapboxgl.Map, popup?: mapboxgl.Popup) {
    if (!popup || boundMaps.has(map)) return;
    boundMaps.add(map);

    const ids = [
        KASHIWA_CHOME_TOTAL_FILL,
        KASHIWA_CHOME_AGING_FILL,
        KASHIWA_CHOME_DENSITY_FILL,
        KASHIWA_CHOME_TOTAL_2040_FILL,
        KASHIWA_CHOME_AGING_2040_FILL,
    ];

    let hoveredId: string | number | null = null;
    let raf = 0;
    const ensurePopup = () => { try { popup.addTo(map); } catch { } };

    ids.forEach((id) => {
        // If layer is added later, Mapbox will throw; guard it
        if (!map.getLayer(id)) return;

        map.on("mousemove", id, (e) => {
            if (!e.features?.length) return;
            const f = e.features[0] as any;
            if (hoveredId !== null) map.setFeatureState({ source: KASHIWA_CHOME_SOURCE_ID, id: hoveredId }, { hover: false });
            hoveredId = f.id ?? f.properties?.KEYCODE2;
            if (hoveredId !== null) map.setFeatureState({ source: KASHIWA_CHOME_SOURCE_ID, id: hoveredId }, { hover: true });
            map.getCanvas().style.cursor = "pointer";

            const p = f.properties || {};
            const name = p["町丁字名"] ?? p["S_NAME"] ?? "N/A";
            const total = p["総数"] ?? "N/A";
            const aging = p["高齢化率"];
            const agingPct = (aging != null) ? `${(Number(aging) * 100).toFixed(1)}%` : "N/A";
            const density = p["人口密度（人/km²）"];
            const total_2040 = p["total_2040"];
            const aging_2040 = p["aging_rate_2040"];

            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                ensurePopup();
                popup
                    .setLngLat(e.lngLat)
                    .setHTML(`
            <div class="rounded-xl border bg-white p-3 shadow-xl space-y-1 w-64 text-xs">
              <div class="font-semibold">${name}</div>
              <div><strong>総数:</strong> ${total}</div>
              <div><strong>高齢化率:</strong> ${agingPct}</div>
              <div><strong>人口密度:</strong> ${density ?? "N/A"} 人/km²</div>
              <div><strong>2040年_総数:</strong> ${total_2040 ?? "N/A"}</div>
              <div><strong>2040年_高齢化率:</strong> ${aging_2040 ?? "N/A"}</div>
            </div>
          `);
            });
        });

        map.on("mouseleave", id, () => {
            if (hoveredId !== null) map.setFeatureState({ source: KASHIWA_CHOME_SOURCE_ID, id: hoveredId }, { hover: false });
            hoveredId = null;
            map.getCanvas().style.cursor = "";
            popup?.remove();
        });
    });
}

function ensureLabels(map: mapboxgl.Map) {
    if (map.getLayer(KASHIWA_CHOME_LABELS)) return;
    map.addLayer({
        id: KASHIWA_CHOME_LABELS,
        type: "symbol",
        source: KASHIWA_CHOME_SOURCE_ID,
        layout: {
            "text-field": ["get", "町丁字名"],
            "text-size": 11,
            "text-allow-overlap": false,
            "text-padding": 2,
            "visibility": "none",
        },
        paint: { "text-color": "#111", "text-halo-color": "rgba(255,255,255,.9)", "text-halo-width": 1.2 },
    });
}

/* -------------------- ordering & visibility -------------------- */
function enforceLayerOrder(map: mapboxgl.Map) {
    const order = [
        // bottom -> top
        KASHIWA_CHOME_TOTAL_FILL,
        KASHIWA_CHOME_AGING_FILL,
        KASHIWA_CHOME_DENSITY_FILL,
        KASHIWA_CHOME_TOTAL_2040_FILL,
        KASHIWA_CHOME_AGING_2040_FILL,
        KASHIWA_CHOME_TOTAL_OUTLINE,
        KASHIWA_CHOME_AGING_OUTLINE,
        KASHIWA_CHOME_DENSITY_OUTLINE,
        KASHIWA_CHOME_TOTAL_2040_OUTLINE,
        KASHIWA_CHOME_AGING_2040_OUTLINE,
        KASHIWA_CHOME_LABELS,
    ].filter((id) => map.getLayer(id));

    // Place top-down for a stable stack
    let before: string | undefined = undefined;
    for (let i = order.length - 1; i >= 0; i--) {
        const id = order[i];
        try { map.moveLayer(id, before); } catch { }
        before = id;
    }
}

function setMetricVisibility(map: mapboxgl.Map, metric: Metric, visible: boolean) {
    const ids = metric === "total"
        ? { fill: KASHIWA_CHOME_TOTAL_FILL, line: KASHIWA_CHOME_TOTAL_OUTLINE }
        : metric === "aging"
            ? { fill: KASHIWA_CHOME_AGING_FILL, line: KASHIWA_CHOME_AGING_OUTLINE }
            : metric === "density"
                ? { fill: KASHIWA_CHOME_DENSITY_FILL, line: KASHIWA_CHOME_DENSITY_OUTLINE }
                : metric === "total_2040"
                    ? { fill: KASHIWA_CHOME_TOTAL_2040_FILL, line: KASHIWA_CHOME_TOTAL_2040_OUTLINE }
                    : { fill: KASHIWA_CHOME_AGING_2040_FILL, line: KASHIWA_CHOME_AGING_2040_OUTLINE };
    const v = visible ? "visible" : "none";
    if (map.getLayer(ids.fill)) map.setLayoutProperty(ids.fill, "visibility", v);
    if (map.getLayer(ids.line)) map.setLayoutProperty(ids.line, "visibility", v);
}

/* -------------------- public togglers (independent stacking) -------------------- */
function clearLoadingSoon(map: mapboxgl.Map, setIsLoading: (b: boolean) => void) {
    const done = () => setIsLoading(false);
    let cleared = false;
    map.once("idle", () => { if (!cleared) { cleared = true; done(); } });
    // Fallback: ensure spinner clears even if idle timing is quirky
    setTimeout(() => { if (!cleared) { cleared = true; done(); } }, 120);
}

export async function toggleKashiwaChomeTotalLayer(
    map: mapboxgl.Map,
    visible: boolean,
    setIsLoading: (b: boolean) => void,
    setVisible: (b: boolean) => void,
    popup?: mapboxgl.Popup
) {
    try {
        setIsLoading(true);
        if (!visible) {
            removeAllMeshes(map);
            await ensureSource(map);
            addBaseLayers(map);
            bindInteractions(map, popup);
            setMetricVisibility(map, "total", true);
            enforceLayerOrder(map);
            setVisible(true);
        } else {
            setMetricVisibility(map, "total", false);
            setVisible(false);
        }
    } finally { clearLoadingSoon(map, setIsLoading); }
}

export async function toggleKashiwaChomeAgingLayer(
    map: mapboxgl.Map,
    visible: boolean,
    setIsLoading: (b: boolean) => void,
    setVisible: (b: boolean) => void,
    popup?: mapboxgl.Popup
) {
    try {
        setIsLoading(true);
        if (!visible) {
            removeAllMeshes(map);
            await ensureSource(map);
            addBaseLayers(map);
            bindInteractions(map, popup);
            setMetricVisibility(map, "aging", true);
            enforceLayerOrder(map);
            setVisible(true);
        } else {
            setMetricVisibility(map, "aging", false);
            setVisible(false);
        }
    } finally { clearLoadingSoon(map, setIsLoading); }
}

export async function toggleKashiwaChomeDensityLayer(
    map: mapboxgl.Map,
    visible: boolean,
    setIsLoading: (b: boolean) => void,
    setVisible: (b: boolean) => void,
    popup?: mapboxgl.Popup
) {
    try {
        setIsLoading(true);
        if (!visible) {
            removeAllMeshes(map);
            await ensureSource(map);
            addBaseLayers(map);
            bindInteractions(map, popup);
            setMetricVisibility(map, "density", true);
            enforceLayerOrder(map);
            setVisible(true);
        } else {
            setMetricVisibility(map, "density", false);
            setVisible(false);
        }
    } finally { clearLoadingSoon(map, setIsLoading); }
}

export async function toggleKashiwaChomeTotal2040Layer(
    map: mapboxgl.Map,
    visible: boolean,
    setIsLoading: (b: boolean) => void,
    setVisible: (b: boolean) => void,
    popup?: mapboxgl.Popup
) {
    try {
        setIsLoading(true);
        if (!visible) {
            removeAllMeshes(map);
            await ensureSource(map);
            addBaseLayers(map);
            bindInteractions(map, popup);
            setMetricVisibility(map, "total_2040", true);
            enforceLayerOrder(map);
            setVisible(true);
        } else {
            setMetricVisibility(map, "total_2040", false);
            setVisible(false);
        }
    } finally { clearLoadingSoon(map, setIsLoading); }
}

export async function toggleKashiwaChomeAging2040Layer(
    map: mapboxgl.Map,
    visible: boolean,
    setIsLoading: (b: boolean) => void,
    setVisible: (b: boolean) => void,
    popup?: mapboxgl.Popup
) {
    try {
        setIsLoading(true);
        if (!visible) {
            removeAllMeshes(map);
            await ensureSource(map);
            addBaseLayers(map);
            bindInteractions(map, popup);
            setMetricVisibility(map, "aging_2040", true);
            enforceLayerOrder(map);
            setVisible(true);
        } else {
            setMetricVisibility(map, "aging_2040", false);
            setVisible(false);
        }
    } finally { clearLoadingSoon(map, setIsLoading); }
}

/* -------------------- public styling APIs (for your React legend UI) -------------------- */
type Method = "quantile" | "equal" | "jenks";

/** Update the choropleth palette / method / bin count / opacity for a metric. */
export function updateKashiwaChomeStyle(
    map: mapboxgl.Map,
    metric: Metric,
    opts: { palette?: PaletteName; method?: Method; bins?: number; opacity?: number }
) {
    // follow your original defaults but fix aging_2040 and palette drift
    const palette: PaletteName =
        opts.palette ??
        (metric === "aging" || metric === "aging_2040" ? "Greens" :
            metric === "density" ? "Oranges" :
                metric === "total_2040" ? "Blues" : "Purples");

    const method = opts.method ?? "quantile";
    const bins = Math.max(3, Math.min(7, opts.bins ?? 5));
    const opacity = Math.max(0, Math.min(1, opts.opacity ?? 0.7));

    const values = getValues(metric);
    const breaks =
        values.length === 0 ? defaultAnchorsFor(metric) :
            method === "equal" ? equalBreaks(values, bins) :
                method === "jenks" ? jenksBreaks(values, bins) :
                    quantileBreaks(values, bins);

    const prop = METRIC_PROP[metric];
    const colors = samplePalette(PALETTES[palette], bins);

    const fillId =
        metric === "total" ? KASHIWA_CHOME_TOTAL_FILL :
            metric === "aging" ? KASHIWA_CHOME_AGING_FILL :
                metric === "density" ? KASHIWA_CHOME_DENSITY_FILL :
                    metric === "total_2040" ? KASHIWA_CHOME_TOTAL_2040_FILL :
                        KASHIWA_CHOME_AGING_2040_FILL;

    if (map.getLayer(fillId)) {
        map.setPaintProperty(fillId, "fill-color", buildStep(prop, breaks, colors) as any);
        map.setPaintProperty(fillId, "fill-opacity", [
            "case", ["boolean", ["feature-state", "hover"], false], Math.min(1, opacity + 0.2), opacity,
        ]);
    }
}

/** Optional: filter to a visible numeric range for any metric. */
export function setKashiwaChomeRangeFilter(
    map: mapboxgl.Map,
    metric: Metric,
    min: number | null,
    max: number | null
) {
    const prop = METRIC_PROP[metric];
    const conds: any[] = [];
    if (min != null) conds.push([">=", ["to-number", ["get", prop]], min]);
    if (max != null) conds.push(["<=", ["to-number", ["get", prop]], max]);
    const filter = conds.length ? ["all", ...conds] : null;

    const ids = metric === "total"
        ? [KASHIWA_CHOME_TOTAL_FILL, KASHIWA_CHOME_TOTAL_OUTLINE]
        : metric === "aging"
            ? [KASHIWA_CHOME_AGING_FILL, KASHIWA_CHOME_AGING_OUTLINE]
            : metric === "total_2040"
                ? [KASHIWA_CHOME_TOTAL_2040_FILL, KASHIWA_CHOME_TOTAL_2040_OUTLINE]
                : metric === "aging_2040"
                    ? [KASHIWA_CHOME_AGING_2040_FILL, KASHIWA_CHOME_AGING_2040_OUTLINE]
                    : [KASHIWA_CHOME_DENSITY_FILL, KASHIWA_CHOME_DENSITY_OUTLINE];

    ids.forEach((id) => { if (map.getLayer(id)) map.setFilter(id, filter as any); });
}

/** Toggle labels (町丁字名 or the metric value). */
export function setKashiwaChomeLabelsVisible(
    map: mapboxgl.Map,
    visible: boolean,
    mode: "name" | "metric" = "name",
    metric: Metric = "total"
) {
    ensureLabels(map);
    if (!map.getLayer(KASHIWA_CHOME_LABELS)) return;

    if (mode === "name") {
        map.setLayoutProperty(KASHIWA_CHOME_LABELS, "text-field", ["get", "町丁字名"]);
    } else {
        const prop = METRIC_PROP[metric];
        const fmt = isAging(metric)
            ? ["concat", ["to-string", ["round", ["*", ["to-number", ["get", prop]], 100]]], "%"]
            : ["to-string", ["to-number", ["get", prop]]];
        map.setLayoutProperty(KASHIWA_CHOME_LABELS, "text-field", fmt as any);
    }
    map.setLayoutProperty(KASHIWA_CHOME_LABELS, "visibility", visible ? "visible" : "none");
    enforceLayerOrder(map);
}
