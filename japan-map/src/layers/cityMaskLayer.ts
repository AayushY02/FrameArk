// import maplibregl from "maplibre-gl";
// import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";
// import { featureCollection, union as turfUnion } from "@turf/turf";

// let __kashiwaCache: FeatureCollection<Polygon | MultiPolygon> | null = null;
// let __maskCache: FeatureCollection<Polygon | MultiPolygon> | null = null;

// const IDS = {
//     srcCity: "kashiwa-boundary-src",
//     srcMask: "kashiwa-world-mask-src",
//     lyrMask: "kashiwa-world-mask-fill",
//     lyrCityFill: "kashiwa-highlight-fill",
//     lyrCityLine: "kashiwa-highlight-line",
// } as const;

// const KASHIWA_URL =
//     (import.meta as any).env?.VITE_KASHIWA_BOUNDARY_URL ??
//     "/data/kashiwa_boundary_new.geojson";

// /** World rectangle (±85° to avoid pole artifacts) */
// function worldRect(): Feature<Polygon> {
//     const w = -180, e = 180, s = -85, n = 85;
//     return {
//         type: "Feature",
//         properties: {},
//         geometry: {
//             type: "Polygon",
//             coordinates: [[[w, s], [w, n], [e, n], [e, s], [w, s]]],
//         },
//     };
// }

// /** Load and cache the Kashiwa boundary */
// async function loadKashiwa(): Promise<FeatureCollection<Polygon | MultiPolygon>> {
//     if (__kashiwaCache) return __kashiwaCache;
//     const res = await fetch(KASHIWA_URL);
//     if (!res.ok) throw new Error(`Failed to load Kashiwa boundary: ${res.status} ${res.statusText}`);
//     __kashiwaCache = (await res.json()) as FeatureCollection<Polygon | MultiPolygon>;
//     return __kashiwaCache;
// }

// function worldOuterRing(): [number, number][] {
//     const w = -180, e = 180, s = -85, n = 85;
//     return [[w, s], [w, n], [e, n], [e, s], [w, s]];
// }

// /** Signed area (shoelace). >0 = CCW, <0 = CW */
// function ringSignedArea(ring: [number, number][]) {
//     let sum = 0;
//     for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
//         const [xi, yi] = ring[i];
//         const [xj, yj] = ring[j];
//         sum += (xj * yi - xi * yj);
//     }
//     return sum / 2;
// }
// function ensureCCW(r: [number, number][]) {
//     return ringSignedArea(r) > 0 ? r : r.slice().reverse();
// }
// function ensureCW(r: [number, number][]) {
//     return ringSignedArea(r) < 0 ? r : r.slice().reverse();
// }

// /** Union all city features to a single (Multi)Polygon — unchanged from your version */
// function unionAllCity(features: Feature<(Polygon | MultiPolygon)>[]): Feature<Polygon | MultiPolygon> {
//     let acc = features[0] as Feature<Polygon | MultiPolygon>;
//     for (let i = 1; i < features.length; i++) {
//         const u = turfUnion(acc as any, features[i] as any);
//         if (u) acc = u as Feature<Polygon | MultiPolygon>;
//     }
//     return acc;
// }

// /**
//  * Build a single mask Polygon that has:
//  * - outer ring = whole world (CCW)
//  * - inner rings = Kashiwa's outer boundaries (CW), which become HOLES
//  */
// async function buildMask(): Promise<FeatureCollection<Polygon>> {
//     const cityFC = await loadKashiwa();
//     const cityFeatures = cityFC.features.filter(
//         (f) => f.geometry && (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
//     ) as Feature<(Polygon | MultiPolygon)>[];

//     if (cityFeatures.length === 0) {
//         // fallback: just world
//         const worldRing = ensureCCW(worldOuterRing());
//         return featureCollection<Polygon>([{
//             type: "Feature",
//             properties: {},
//             geometry: { type: "Polygon", coordinates: [worldRing] },
//         }]);
//     }

//     const cityUnion = unionAllCity(cityFeatures);
//     const worldRing = ensureCCW(worldOuterRing());
//     const holes: [number, number][][] = [];

//     if (cityUnion.geometry.type === "Polygon") {
//         // coords[0] = outer ring of Kashiwa -> becomes a HOLE (must be CW)
//         const outer = cityUnion.geometry.coordinates[0] as [number, number][];
//         holes.push(ensureCW(outer));
//     } else {
//         // MultiPolygon: take each polygon's outer ring as a hole
//         for (const poly of cityUnion.geometry.coordinates) {
//             const outer = poly[0] as [number, number][];
//             holes.push(ensureCW(outer));
//         }
//     }

//     const mask: Feature<Polygon> = {
//         type: "Feature",
//         properties: {},
//         geometry: {
//             type: "Polygon",
//             coordinates: [worldRing, ...holes],
//         },
//     };

//     return featureCollection<Polygon>([mask]);
// }
// function upsertSource(map: maplibregl.Map, id: string, data: any) {
//     const s = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
//     if (s) s.setData(data);
//     else map.addSource(id, { type: "geojson", data });
// }

// /** Find the first non-background layer to insert *below everything else*. */
// function bottomInsertBeforeId(map: maplibregl.Map): string | undefined {
//     const style = map.getStyle();
//     if (!style?.layers?.length) return undefined;
//     const first = style.layers.find((l) => l.type !== "background");
//     return first?.id;
// }

// function ensureLayer(map: maplibregl.Map, layer: maplibregl.LayerSpecification, beforeId?: string) {
//     if (!map.getLayer(layer.id)) map.addLayer(layer, beforeId);
// }
// function setVisibility(map: maplibregl.Map, id: string, v: "visible" | "none") {
//     if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v);
// }

// /** Public toggle */
// export async function toggleCityMaskLayer(
//     map: maplibregl.Map,
//     currentlyVisible: boolean,
//     setIsLoading: (b: boolean) => void,
//     setVisible: (b: boolean) => void,
//     opts?: {
//         dimColor?: string;          // outside color (default black)
//         dimOpacity?: number;        // default 0.35
//         highlightColor?: string;    // Kashiwa tint (default warm yellow)
//         highlightOpacity?: number;  // default 0.20
//         outlineColor?: string;      // default #ff8c00
//         outlineWidth?: number;      // default 1.5
//     }
// ) {
//     const nextVisible = !currentlyVisible;
//     if (!nextVisible) {
//         setVisible(false);
//         setVisibility(map, IDS.lyrMask, "none");
//         setVisibility(map, IDS.lyrCityFill, "none");
//         setVisibility(map, IDS.lyrCityLine, "none");
//         return;
//     }

//     setIsLoading(true);
//     try {
//         const [maskFC, cityFC] = await Promise.all([buildMask(), loadKashiwa()]);

//         upsertSource(map, IDS.srcMask, maskFC);
//         upsertSource(map, IDS.srcCity, cityFC);

//         const dimColor = opts?.dimColor ?? "#000";
//         const dimOpacity = opts?.dimOpacity ?? 0.35;
//         const highlightColor = opts?.highlightColor ?? "#ffd166";
//         const highlightOpacity = opts?.highlightOpacity ?? 0.20;
//         const outlineColor = opts?.outlineColor ?? "#ff8c00";
//         const outlineWidth = opts?.outlineWidth ?? 1.5;

//         const before = bottomInsertBeforeId(map);

//         // Outside dim (with hole)
//         ensureLayer(
//             map,
//             {
//                 id: IDS.lyrMask,
//                 type: "fill",
//                 source: IDS.srcMask,
//                 paint: {
//                     "fill-color": dimColor,
//                     "fill-opacity": dimOpacity,
//                     "fill-antialias": true,
//                 },
//             },
//             before
//         );

//         // Kashiwa highlight
//         ensureLayer(
//             map,
//             {
//                 id: IDS.lyrCityFill,
//                 type: "fill",
//                 source: IDS.srcCity,
//                 paint: {
//                     "fill-color": highlightColor,
//                     "fill-opacity": highlightOpacity,
//                     "fill-antialias": true,
//                 },
//             },
//             before
//         );

//         ensureLayer(
//             map,
//             {
//                 id: IDS.lyrCityLine,
//                 type: "line",
//                 source: IDS.srcCity,
//                 paint: {
//                     "line-color": outlineColor,
//                     "line-width": outlineWidth,
//                     "line-blur": 0.2,
//                 },
//             },
//             before
//         );

//         setVisibility(map, IDS.lyrMask, "visible");
//         setVisibility(map, IDS.lyrCityFill, "visible");
//         setVisibility(map, IDS.lyrCityLine, "visible");
//         setVisible(true);
//     } catch (e) {
//         console.error("[cityMaskLayer] failed:", e);
//     } finally {
//         setIsLoading(false);
//     }
// }

// /** Optional: zoom to Kashiwa boundary */
// export async function zoomToKashiwa(map: maplibregl.Map, padding = 48) {
//     const data = await loadKashiwa();
//     const bounds = new maplibregl.LngLatBounds();
//     data.features.forEach((f) => {
//         const walk = (c: any) =>
//             typeof c[0] === "number" ? bounds.extend(c as [number, number]) : c.forEach(walk);
//         walk((f.geometry as any).coordinates);
//     });
//     if (!bounds.isEmpty()) map.fitBounds(bounds, { padding, duration: 700 });
// }

// /** Reset caches if you swap boundary files at runtime */
// export function resetCityMaskCaches() {
//     __kashiwaCache = null;
//     __maskCache = null;
// }


// src/layers/cityMaskLayer.ts
import maplibregl from "maplibre-gl";
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";
import { featureCollection, union as turfUnion } from "@turf/turf";

let __kashiwaCache: FeatureCollection<Polygon | MultiPolygon> | null = null;

const IDS = {
    srcCity: "kashiwa-boundary-src",
    srcMask: "kashiwa-world-mask-src",
    lyrMask: "kashiwa-world-mask-fill",          // very dark overlay outside Kashiwa
    lyrCityFill: "kashiwa-highlight-fill",       // soft tint inside Kashiwa
    lyrCityGlow: "kashiwa-highlight-glow",       // wide blurred line glow
    lyrCityLine: "kashiwa-highlight-line",       // crisp outline
} as const;

const KASHIWA_URL =
    (import.meta as any).env?.VITE_KASHIWA_BOUNDARY_URL ??
    "/data/kashiwa_boundary_new.geojson";

/** ---------- geometry helpers (hole mask; no boolean ops needed) ---------- */
function worldOuterRing(): [number, number][] {
    const w = -180, e = 180, s = -85, n = 85;
    return [[w, s], [w, n], [e, n], [e, s], [w, s]];
}
function ringSignedArea(r: [number, number][]) {
    let sum = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const [xi, yi] = r[i];
        const [xj, yj] = r[j];
        sum += (xj * yi - xi * yj);
    }
    return sum / 2;
}
const ensureCCW = (r: [number, number][]) => (ringSignedArea(r) > 0 ? r : r.slice().reverse());
const ensureCW = (r: [number, number][]) => (ringSignedArea(r) < 0 ? r : r.slice().reverse());

async function loadKashiwa(): Promise<FeatureCollection<Polygon | MultiPolygon>> {
    if (__kashiwaCache) return __kashiwaCache;
    const res = await fetch(KASHIWA_URL);
    if (!res.ok) throw new Error(`Failed to load Kashiwa boundary: ${res.status} ${res.statusText}`);
    __kashiwaCache = (await res.json()) as FeatureCollection<Polygon | MultiPolygon>;
    return __kashiwaCache;
}

function unionAllCity(features: Feature<(Polygon | MultiPolygon)>[]): Feature<Polygon | MultiPolygon> {
    let acc = features[0] as Feature<Polygon | MultiPolygon>;
    for (let i = 1; i < features.length; i++) {
        const u = turfUnion(acc as any, features[i] as any);
        if (u) acc = u as Feature<Polygon | MultiPolygon>;
    }
    return acc;
}

/** Build a single mask polygon with a HOLE over Kashiwa */
async function buildMask(): Promise<FeatureCollection<Polygon>> {
    const cityFC = await loadKashiwa();
    const cityFeatures = cityFC.features.filter(
        (f) => f.geometry && (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
    ) as Feature<(Polygon | MultiPolygon)>[];

    const worldRing = ensureCCW(worldOuterRing());
    if (cityFeatures.length === 0) {
        return featureCollection<Polygon>([{
            type: "Feature",
            properties: {},
            geometry: { type: "Polygon", coordinates: [worldRing] },
        }]);
    }

    const cityUnion = unionAllCity(cityFeatures);
    const holes: [number, number][][] = [];
    if (cityUnion.geometry.type === "Polygon") {
        holes.push(ensureCW(cityUnion.geometry.coordinates[0] as [number, number][]));
    } else {
        for (const poly of cityUnion.geometry.coordinates) {
            holes.push(ensureCW(poly[0] as [number, number][]));
        }
    }
    return featureCollection<Polygon>([{
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [worldRing, ...holes] },
    }]);
}

/** ---------------- layer helpers ---------------- */
function upsertSource(map: maplibregl.Map, id: string, data: any) {
    const s = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
    if (s) s.setData(data);
    else map.addSource(id, { type: "geojson", data });
}
function ensureLayer(map: maplibregl.Map, layer: maplibregl.LayerSpecification, beforeId?: string) {
    if (!map.getLayer(layer.id)) map.addLayer(layer, beforeId);
}
function setVisibility(map: maplibregl.Map, id: string, v: "visible" | "none") {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v);
}

/** Move app overlays above the mask so they remain visible */
function raiseOverlays(map: maplibregl.Map, ids: string[] = []) {
    // Put them above the crisp city line (top of our mask stack)
    const anchor = IDS.lyrCityLine;
    ids.forEach((id) => {
        if (map.getLayer(id)) map.moveLayer(id, anchor);
    });
}

/** ---------------- public toggle ---------------- */
export async function toggleCityMaskLayer(
    map: maplibregl.Map,
    currentlyVisible: boolean,
    setIsLoading: (b: boolean) => void,
    setVisible: (b: boolean) => void,
    opts?: {
        dimColor?: string;          // very dark outside
        dimOpacity?: number;        // 0.85 default -> almost hides basemap
        highlightColor?: string;    // warm tint inside
        highlightOpacity?: number;  // 0.10–0.18 is nice
        outlineColor?: string;      // crisp boundary color
        overlaysToRaise?: string[]; // layer IDs you want above the mask
    }
) {
    const nextVisible = !currentlyVisible;

    if (!nextVisible) {
        setVisible(false);
        [IDS.lyrMask, IDS.lyrCityFill, IDS.lyrCityGlow, IDS.lyrCityLine].forEach((id) =>
            setVisibility(map, id, "none")
        );
        return;
    }

    setIsLoading(true);
    try {
        const [maskFC, cityFC] = await Promise.all([buildMask(), loadKashiwa()]);
        upsertSource(map, IDS.srcMask, maskFC);
        upsertSource(map, IDS.srcCity, cityFC);

        const dimColor = opts?.dimColor ?? "#0b1020"; // deep slate
        const dimOpacity = opts?.dimOpacity ?? 0.85;    // strong dim (was ~0.35)
        const highlightColor = opts?.highlightColor ?? "#fff3b0";
        const highlightOpacity = opts?.highlightOpacity ?? 0.14;
        const outlineColor = opts?.outlineColor ?? "#f59e0b"; // amber-500

        // IMPORTANT: append at TOP so it covers basemap & labels
        ensureLayer(map, {
            id: IDS.lyrMask,
            type: "fill",
            source: IDS.srcMask,
            paint: {
                "fill-color": dimColor,
                "fill-opacity": dimOpacity,
                "fill-antialias": true,
            },
        });

        // Soft highlight inside Kashiwa (below your overlays but above mask)
        ensureLayer(map, {
            id: IDS.lyrCityFill,
            type: "fill",
            source: IDS.srcCity,
            paint: {
                "fill-color": highlightColor,
                "fill-opacity": highlightOpacity,
            },
        });

        // Glow: wide blurred line under crisp outline
        ensureLayer(map, {
            id: IDS.lyrCityGlow,
            type: "line",
            source: IDS.srcCity,
            paint: {
                "line-color": outlineColor,
                "line-width": 12,
                "line-opacity": 0.25,
                "line-blur": 6,
            },
        });

        // Crisp outline
        ensureLayer(map, {
            id: IDS.lyrCityLine,
            type: "line",
            source: IDS.srcCity,
            paint: {
                "line-color": outlineColor,
                "line-width": 1.8,
                "line-opacity": 0.9,
            },
        });

        // Make all four visible
        [IDS.lyrMask, IDS.lyrCityFill, IDS.lyrCityGlow, IDS.lyrCityLine].forEach((id) =>
            setVisibility(map, id, "visible")
        );

        // Ensure YOUR overlays sit above this stack (so they aren't dimmed)
        raiseOverlays(map, opts?.overlaysToRaise ?? [
            // add/adjust to your app’s layer ids
            "bus-coverage-merged-fill",
            "bus-coverage-merged-line",
            "bus-coverage-stops-circle",
            // e.g. "od-grid-lines", "mesh-1km", "mesh-500m", "mesh-250m"
        ]);

        setVisible(true);
    } catch (e) {
        console.error("[cityMaskLayer] failed:", e);
    } finally {
        setIsLoading(false);
    }
}
