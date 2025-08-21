// // // src/layers/kashiwakuruOdLayer.ts
// // import maplibregl from "mapbox-gl";

// // export const KASHIWAKURU_OD_SOURCE_ID = "kashiwakuru-od";
// // export const KASHIWAKURU_OD_LAYER_ID = "kashiwakuru-od-line";
// // export const KASHIWAKURU_OD_HIT_LAYER_ID = "kashiwakuru-od-line-hit";
// // export const KASHIWAKURU_OD_ORIGINS_SOURCE_ID = "kashiwakuru-od-origins";
// // export const KASHIWAKURU_OD_DESTS_SOURCE_ID = "kashiwakuru-od-dests";
// // export const KASHIWAKURU_OD_ORIGINS_LAYER_ID = "kashiwakuru-od-origins-circles";
// // export const KASHIWAKURU_OD_DESTS_LAYER_ID = "kashiwakuru-od-dests-circles";

// // const DATA_URL = "/data/kashiwa_od_lines.geojson";

// // export function setSelectedOdKey(map: maplibregl.Map, key: string) {
// //     if (!map.getLayer("od-selected-highlight")) {
// //         map.addLayer({
// //             id: "od-selected-highlight",
// //             type: "line",
// //             source: KASHIWAKURU_OD_SOURCE_ID,
// //             paint: {
// //                 "line-color": "#f59e0b", // highlight color (amber)
// //                 "line-width": 6
// //             },
// //             filter: [
// //                 "==",
// //                 ["concat", ["get", "origin"], "-", ["get", "destination"], "-", ["get", "hour_start"]],
// //                 key
// //             ]
// //         });
// //     } else {
// //         map.setFilter(
// //             "od-selected-highlight",
// //             ["==", ["concat", ["get", "origin"], "-", ["get", "destination"], "-", ["get", "hour_start"]], key]
// //         );
// //     }
// // }


// // /** Remove mesh layers/sources before showing OD */
// // function removeMeshLayers(map: maplibregl.Map) {
// //     const meshLayers = [
// //         "mesh-250m-fill", "mesh-500m-fill", "mesh-1km-fill",
// //         "mesh-250m-outline", "mesh-500m-outline", "mesh-1km-outline",
// //     ];
// //     meshLayers.forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
// //     meshLayers.forEach(id => { if (map.getSource(id)) map.removeSource(id as any); });
// // }

// // /** Fetch data once and ensure all three sources (line + endpoints) exist */
// // async function ensureOdSources(map: maplibregl.Map) {
// //     // Fetch the GeoJSON (also used to derive origins/dests)
// //     const resp = await fetch(DATA_URL);
// //     const data: GeoJSON.FeatureCollection = await resp.json();

// //     // Build endpoints
// //     const origins: GeoJSON.Feature[] = [];
// //     const dests: GeoJSON.Feature[] = [];

// //     for (const f of data.features as any[]) {
// //         if (!f?.geometry || f.geometry.type !== "LineString") continue;
// //         const coords = f.geometry.coordinates as number[][];
// //         if (!coords || coords.length < 2) continue;

// //         const start = coords[0];
// //         const end = coords[coords.length - 1];

// //         origins.push({
// //             type: "Feature",
// //             geometry: { type: "Point", coordinates: start },
// //             properties: { ...(f.properties || {}), endpoint: "origin" }
// //         });

// //         dests.push({
// //             type: "Feature",
// //             geometry: { type: "Point", coordinates: end },
// //             properties: { ...(f.properties || {}), endpoint: "destination" }
// //         });
// //     }

// //     // Add or update sources
// //     if (!map.getSource(KASHIWAKURU_OD_SOURCE_ID)) {
// //         map.addSource(KASHIWAKURU_OD_SOURCE_ID, { type: "geojson", data });
// //     } else {
// //         (map.getSource(KASHIWAKURU_OD_SOURCE_ID) as maplibregl.GeoJSONSource).setData(data);
// //     }

// //     const originsFC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: origins };
// //     const destsFC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: dests };

// //     if (!map.getSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID)) {
// //         map.addSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID, { type: "geojson", data: originsFC });
// //     } else {
// //         (map.getSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(originsFC);
// //     }

// //     if (!map.getSource(KASHIWAKURU_OD_DESTS_SOURCE_ID)) {
// //         map.addSource(KASHIWAKURU_OD_DESTS_SOURCE_ID, { type: "geojson", data: destsFC });
// //     } else {
// //         (map.getSource(KASHIWAKURU_OD_DESTS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(destsFC);
// //     }
// // }

// // function addOdLineLayers(map: maplibregl.Map, initialHour: number) {
// //     // Main visual line layer (hour-based opacity; keeps *all* lines clickable & visible)
// //     if (!map.getLayer(KASHIWAKURU_OD_LAYER_ID)) {
// //         map.addLayer({
// //             id: KASHIWAKURU_OD_LAYER_ID,
// //             type: "line",
// //             source: KASHIWAKURU_OD_SOURCE_ID,
// //             paint: {
// //                 "line-color": "#1d4ed8",
// //                 "line-opacity": [
// //                     "case",
// //                     ["==", ["get", "hour_start"], initialHour], 0.9, // highlight selected hour
// //                     0.12                                             // de-emphasize others (still visible/clickable)
// //                 ],
// //                 "line-width": [
// //                     "interpolate", ["linear"], ["to-number", ["get", "count"]],
// //                     1, 1,
// //                     5, 2.5,
// //                     10, 4,
// //                     20, 6,
// //                     50, 9,
// //                     100, 12
// //                 ]
// //             }
// //         });
// //     }

// //     // A *hit layer* with wide stroke & tiny opacity to make clicking easy, regardless of hour
// //     if (!map.getLayer(KASHIWAKURU_OD_HIT_LAYER_ID)) {
// //         map.addLayer({
// //             id: KASHIWAKURU_OD_HIT_LAYER_ID,
// //             type: "line",
// //             source: KASHIWAKURU_OD_SOURCE_ID,
// //             paint: {
// //                 "line-color": "#000000",
// //                 "line-opacity": 0.01, // nearly invisible but hit-testable
// //                 "line-width": 16
// //             }
// //         });
// //     }
// // }

// // function addEndpointCircleLayers(map: maplibregl.Map) {
// //     // Origins (green)
// //     if (!map.getLayer(KASHIWAKURU_OD_ORIGINS_LAYER_ID)) {
// //         map.addLayer({
// //             id: KASHIWAKURU_OD_ORIGINS_LAYER_ID,
// //             type: "circle",
// //             source: KASHIWAKURU_OD_ORIGINS_SOURCE_ID,
// //             paint: {
// //                 "circle-radius": 4,
// //                 "circle-color": "#059669",
// //                 "circle-stroke-color": "#ffffff",
// //                 "circle-stroke-width": 1
// //             }
// //         });
// //     }

// //     // Destinations (red)
// //     if (!map.getLayer(KASHIWAKURU_OD_DESTS_LAYER_ID)) {
// //         map.addLayer({
// //             id: KASHIWAKURU_OD_DESTS_LAYER_ID,
// //             type: "circle",
// //             source: KASHIWAKURU_OD_DESTS_SOURCE_ID,
// //             paint: {
// //                 "circle-radius": 4,
// //                 "circle-color": "#dc2626",
// //                 "circle-stroke-color": "#ffffff",
// //                 "circle-stroke-width": 1
// //             }
// //         });
// //     }
// // }

// // /** Popup HTML with a button; mirrors your in-app popup pattern with event listeners */
// // function odPopupHtml(p: any) {
// //     const origin = p?.origin ?? "N/A";
// //     const dest = p?.destination ?? "N/A";
// //     const tb = p?.timeband ?? "N/A";
// //     const count = p?.count ?? "N/A";
// //     return `
// //     <div class="rounded-xl border bg-white p-4 shadow-xl text-xs space-y-2 w-72">
// //       <div><strong>O→D:</strong> ${origin} → ${dest}</div>
// //       <div><strong>時間帯:</strong> ${tb}</div>
// //       <div><strong>トリップ数:</strong> ${count}</div>
// //       <button id="od-zoom-btn" class="inline-flex items-center w-full justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90">
// //         このODにズーム
// //       </button>
// //     </div>
// //   `;
// // }

// // /** Register interactions: click (popup + button), hover cursor */
// // function wireInteractions(map: maplibregl.Map, popup: maplibregl.Popup) {
// //     // Use the hit layer to guarantee easy click, regardless of hour/opacity
// //     map.on("click", KASHIWAKURU_OD_HIT_LAYER_ID, (e) => {
// //         const f = e.features?.[0];
// //         if (!f) return;
// //         const p: any = f.properties || {};
// //         // parse coords from the line to compute bbox
// //         const geom = f.geometry as any;
// //         const coords: number[][] = geom?.coordinates || [];
// //         const start = coords[0];
// //         const end = coords[coords.length - 1];

// //         popup.setLngLat(e.lngLat).setHTML(odPopupHtml(p)).addTo(map);

// //         // Wire up the popup "button" just like your existing pattern with addEventListener
// //         const el = popup.getElement();
// //         const btn = el?.querySelector<HTMLButtonElement>("#od-zoom-btn");
// //         btn?.addEventListener("click", () => {
// //             const uniqueKey = `${p.origin}-${p.destination}-${p.hour_start}`;
// //             setSelectedOdKey(map, uniqueKey);

// //             if (start && end) {
// //                 const sw: [number, number] = [Math.min(start[0], end[0]), Math.min(start[1], end[1])];
// //                 const ne: [number, number] = [Math.max(start[0], end[0]), Math.max(start[1], end[1])];
// //                 map.fitBounds([sw, ne], { padding: 60, duration: 800 });
// //             }
// //         });
// //     });

// //     map.on("mouseenter", KASHIWAKURU_OD_HIT_LAYER_ID, () => {
// //         map.getCanvas().style.cursor = "pointer";
// //     });
// //     map.on("mouseleave", KASHIWAKURU_OD_HIT_LAYER_ID, () => {
// //         map.getCanvas().style.cursor = "";
// //     });
// // }

// // /** Public: toggle the OD layer */
// // export async function toggleKashiwakuruOdLayer(
// //     map: maplibregl.Map,
// //     visible: boolean,
// //     setIsLoading: (b: boolean) => void,
// //     setVisible: (b: boolean) => void,
// //     selectedHour: number,
// //     transportPopupRef?: maplibregl.Popup // you already have a popup in MapView; pass it in for reuse
// // ) {
// //     try {
// //         setIsLoading(true);
// //         if (!visible) {
// //             // 1) Remove mesh layers on render (your request)
// //             removeMeshLayers(map);

// //             // 2) Load sources (line + endpoints)
// //             await ensureOdSources(map);

// //             // 3) Add layers
// //             addOdLineLayers(map, selectedHour);
// //             addEndpointCircleLayers(map);

// //             // 4) Wire interactions (reuse your existing popup instance)
// //             if (transportPopupRef) {
// //                 wireInteractions(map, transportPopupRef);
// //             } else {
// //                 // Fallback: create a lightweight popup if none was passed
// //                 const tmp = new (maplibregl as any).Popup({ closeButton: false, closeOnClick: true, className: "ai-popup" }) as maplibregl.Popup;
// //                 wireInteractions(map, tmp);
// //             }

// //             // Show all our layers
// //             [KASHIWAKURU_OD_LAYER_ID, KASHIWAKURU_OD_HIT_LAYER_ID, KASHIWAKURU_OD_ORIGINS_LAYER_ID, KASHIWAKURU_OD_DESTS_LAYER_ID].forEach(id => {
// //                 if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "visible");
// //             });

// //             setVisible(true);
// //         } else {
// //             // Hide all related layers
// //             [KASHIWAKURU_OD_LAYER_ID, KASHIWAKURU_OD_HIT_LAYER_ID, KASHIWAKURU_OD_ORIGINS_LAYER_ID, KASHIWAKURU_OD_DESTS_LAYER_ID].forEach(id => {
// //                 if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
// //             });
// //             setVisible(false);
// //         }
// //     } finally {
// //         map.once("idle", () => setIsLoading(false));
// //     }
// // }

// // /** Public: hour change (no filtering; only opacity changes so all lines remain clickable) */
// // export function setKashiwakuruOdHour(map: maplibregl.Map, hour: number) {
// //     if (!map.getLayer(KASHIWAKURU_OD_LAYER_ID)) return;
// //     map.setPaintProperty(
// //         KASHIWAKURU_OD_LAYER_ID,
// //         "line-opacity",
// //         ["case", ["==", ["get", "hour_start"], hour], 0.9, 0.12]
// //     );
// // }


// // src/layers/kashiwakuruOdLayer.ts
// // import type maplibregl from "mapbox-gl";   

// export const KASHIWAKURU_OD_SOURCE_ID = "kashiwakuru-od";
// export const KASHIWAKURU_OD_LAYER_ID  = "kashiwakuru-od-line";
// export const KASHIWAKURU_OD_HIT_LAYER_ID = "kashiwakuru-od-line-hit";
// export const KASHIWAKURU_OD_ORIGINS_SOURCE_ID = "kashiwakuru-od-origins";
// export const KASHIWAKURU_OD_DESTS_SOURCE_ID   = "kashiwakuru-od-dests";
// export const KASHIWAKURU_OD_ORIGINS_LAYER_ID  = "kashiwakuru-od-origins-circles";
// export const KASHIWAKURU_OD_DESTS_LAYER_ID    = "kashiwakuru-od-dests-circles";

// const DATA_URL = "/data/kashiwa_od_lines.geojson";

// /** Remove mesh layers/sources before showing OD */
// function removeMeshLayers(map: maplibregl.Map) {
//   const mesh = [
//     "mesh-250m-fill","mesh-500m-fill","mesh-1km-fill",
//     "mesh-250m-outline","mesh-500m-outline","mesh-1km-outline",
//   ];
//   mesh.forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
//   mesh.forEach(id => { if (map.getSource(id)) map.removeSource(id as any); });
// }

// /** Build endpoints and ensure sources exist */
// async function ensureOdSources(map: maplibregl.Map) {
//   const resp = await fetch(DATA_URL);
//   const data: GeoJSON.FeatureCollection = await resp.json();

//   const origins: GeoJSON.Feature[] = [];
//   const dests: GeoJSON.Feature[] = [];

//   for (const f of data.features as any[]) {
//     if (f?.geometry?.type !== "LineString") continue;
//     const coords = f.geometry.coordinates as number[][];
//     if (!coords?.length) continue;
//     origins.push({ type:"Feature", geometry:{ type:"Point", coordinates: coords[0] }, properties:{ ...(f.properties||{}), endpoint:"origin" }});
//     dests.push({ type:"Feature", geometry:{ type:"Point", coordinates: coords[coords.length-1] }, properties:{ ...(f.properties||{}), endpoint:"destination" }});
//   }

//   if (!map.getSource(KASHIWAKURU_OD_SOURCE_ID)) map.addSource(KASHIWAKURU_OD_SOURCE_ID, { type:"geojson", data });
//   else (map.getSource(KASHIWAKURU_OD_SOURCE_ID) as maplibregl.GeoJSONSource).setData(data);

//   const originsFC: GeoJSON.FeatureCollection = { type:"FeatureCollection", features: origins };
//   const destsFC: GeoJSON.FeatureCollection   = { type:"FeatureCollection", features: dests };

//   if (!map.getSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID)) map.addSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID, { type:"geojson", data: originsFC });
//   else (map.getSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(originsFC);

//   if (!map.getSource(KASHIWAKURU_OD_DESTS_SOURCE_ID)) map.addSource(KASHIWAKURU_OD_DESTS_SOURCE_ID, { type:"geojson", data: destsFC });
//   else (map.getSource(KASHIWAKURU_OD_DESTS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(destsFC);
// }

// /** Add line + hit + endpoint circle layers (no hour filter here) */
// function addOdLayers(map: maplibregl.Map) {
//   if (!map.getLayer(KASHIWAKURU_OD_LAYER_ID)) {
//     map.addLayer({
//       id: KASHIWAKURU_OD_LAYER_ID,
//       type: "line",
//       source: KASHIWAKURU_OD_SOURCE_ID,
//       paint: {
//         "line-color": "#1d4ed8",
//         "line-opacity": 0.85,
//         "line-width": [
//           "interpolate", ["linear"], ["to-number", ["get", "count"]],
//           1, 1, 5, 2.5, 10, 4, 20, 6, 50, 9, 100, 12
//         ]
//       }
//     });
//   }

//   if (!map.getLayer(KASHIWAKURU_OD_HIT_LAYER_ID)) {
//     map.addLayer({
//       id: KASHIWAKURU_OD_HIT_LAYER_ID,
//       type: "line",
//       source: KASHIWAKURU_OD_SOURCE_ID,
//       paint: { "line-color": "#000000", "line-opacity": 0.01, "line-width": 16 }
//     });
//   }

//   if (!map.getLayer(KASHIWAKURU_OD_ORIGINS_LAYER_ID)) {
//     map.addLayer({
//       id: KASHIWAKURU_OD_ORIGINS_LAYER_ID,
//       type: "circle",
//       source: KASHIWAKURU_OD_ORIGINS_SOURCE_ID,
//       paint: { "circle-radius": 4, "circle-color": "#059669", "circle-stroke-color":"#fff", "circle-stroke-width":1 }
//     });
//   }

//   if (!map.getLayer(KASHIWAKURU_OD_DESTS_LAYER_ID)) {
//     map.addLayer({
//       id: KASHIWAKURU_OD_DESTS_LAYER_ID,
//       type: "circle",
//       source: KASHIWAKURU_OD_DESTS_SOURCE_ID,
//       paint: { "circle-radius": 4, "circle-color": "#dc2626", "circle-stroke-color":"#fff", "circle-stroke-width":1 }
//     });
//   }
// }

// /** Popup HTML with a button (reuse your popup pattern from MapView)  */
// function odPopupHtml(p: any) {
//   return `
//     <div class="rounded-xl border bg-white p-4 shadow-xl text-xs space-y-2 w-72">
//       <div><strong>O→D:</strong> ${p?.origin ?? "N/A"} → ${p?.destination ?? "N/A"}</div>
//       <div><strong>時間帯:</strong> ${p?.timeband ?? "N/A"}</div>
//       <div><strong>トリップ数:</strong> ${p?.count ?? "N/A"}</div>
//       <button id="od-show-all" class="inline-flex items-center w-full justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90">
//         全時間帯を表示
//       </button>
//     </div>
//   `;
// }

// /** Clear all time filters → show the complete dataset */
// export function showAllKashiwakuruOd(map: maplibregl.Map) {
//   const ids = [
//     KASHIWAKURU_OD_LAYER_ID,
//     KASHIWAKURU_OD_HIT_LAYER_ID,
//     KASHIWAKURU_OD_ORIGINS_LAYER_ID,
//     KASHIWAKURU_OD_DESTS_LAYER_ID,
//   ];
//   ids.forEach(id => { if (map.getLayer(id)) map.setFilter(id, null as any); });
//   // Reset a solid opacity on the main line layer
//   if (map.getLayer(KASHIWAKURU_OD_LAYER_ID)) {
//     map.setPaintProperty(KASHIWAKURU_OD_LAYER_ID, "line-opacity", 0.85);
//   }
// }

// /** Strictly filter to a single hour across lines + endpoints */
// export function setKashiwakuruOdHour(map: maplibregl.Map, hour: number) {
//   const filt: any = ["==", ["get", "hour_start"], hour];
//   [KASHIWAKURU_OD_LAYER_ID, KASHIWAKURU_OD_HIT_LAYER_ID].forEach(id => {
//     if (map.getLayer(id)) map.setFilter(id, filt);
//   });
//   if (map.getLayer(KASHIWAKURU_OD_ORIGINS_LAYER_ID)) map.setFilter(KASHIWAKURU_OD_ORIGINS_LAYER_ID, filt);
//   if (map.getLayer(KASHIWAKURU_OD_DESTS_LAYER_ID))   map.setFilter(KASHIWAKURU_OD_DESTS_LAYER_ID,   filt);
// }

// /** Optional: highlight a single OD line by unique key (keep if you already added it) */
// export function setSelectedOdKey(map: maplibregl.Map, key: string) {
//   const hiId = "od-selected-highlight";
//   const filt: any = ["==", ["concat", ["get","origin"], "-", ["get","destination"], "-", ["get","hour_start"]], key];
//   if (!map.getLayer(hiId)) {
//     map.addLayer({
//       id: hiId, type: "line", source: KASHIWAKURU_OD_SOURCE_ID,
//       paint: { "line-color":"#f59e0b", "line-width": 6 }, filter: filt
//     });
//   } else {
//     map.setFilter(hiId, filt);
//   }
// }

// /** Click → show popup and wire the “show all” button */
// function wireInteractions(map: maplibregl.Map, popup: maplibregl.Popup) {
//   map.on("click", KASHIWAKURU_OD_HIT_LAYER_ID, (e) => {
//     const f = e.features?.[0];
//     if (!f) return;
//     const p: any = f.properties || {};
//     const geom = f.geometry as any;
//     const coords: number[][] = geom?.coordinates || [];
//     const start = coords[0], end = coords[coords.length - 1];

//     popup.setLngLat(e.lngLat).setHTML(odPopupHtml(p)).addTo(map);

//     const el = popup.getElement();
//     el?.querySelector<HTMLButtonElement>("#od-show-all")?.addEventListener("click", () => {
//       showAllKashiwakuruOd(map);               // ← Button = show ALL
//       if (start && end) {
//         const sw: [number, number] = [Math.min(start[0], end[0]), Math.min(start[1], end[1])];
//         const ne: [number, number] = [Math.max(start[0], end[0]), Math.max(start[1], end[1])];
//         map.fitBounds([sw, ne], { padding: 60, duration: 800 });
//       }
//     });
//   });

//   map.on("mouseenter", KASHIWAKURU_OD_HIT_LAYER_ID, () => { map.getCanvas().style.cursor = "pointer"; });
//   map.on("mouseleave", KASHIWAKURU_OD_HIT_LAYER_ID, () => { map.getCanvas().style.cursor = ""; });
// }

// /** Public toggler */
// export async function toggleKashiwakuruOdLayer(
//   map: maplibregl.Map,
//   visible: boolean,
//   setIsLoading: (b: boolean) => void,
//   setVisible: (b: boolean) => void,
//   _selectedHour: number,                     // kept in signature for compatibility
//   transportPopupRef?: maplibregl.Popup        // reuse the popup from MapView
// ) {
//   try {
//     setIsLoading(true);
//     if (!visible) {
//       removeMeshLayers(map);
//       await ensureOdSources(map);
//       addOdLayers(map);
//       if (transportPopupRef) wireInteractions(map, transportPopupRef); // reuse your popup

//       // Default state on render: show ALL hours
//       showAllKashiwakuruOd(map);

//       // Ensure visibility
//       [KASHIWAKURU_OD_LAYER_ID, KASHIWAKURU_OD_HIT_LAYER_ID, KASHIWAKURU_OD_ORIGINS_LAYER_ID, KASHIWAKURU_OD_DESTS_LAYER_ID]
//         .forEach(id => map.getLayer(id) && map.setLayoutProperty(id, "visibility", "visible"));

//       setVisible(true);
//     } else {
//       [KASHIWAKURU_OD_LAYER_ID, KASHIWAKURU_OD_HIT_LAYER_ID, KASHIWAKURU_OD_ORIGINS_LAYER_ID, KASHIWAKURU_OD_DESTS_LAYER_ID]
//         .forEach(id => map.getLayer(id) && map.setLayoutProperty(id, "visibility", "none"));
//       setVisible(false);
//     }
//   } finally {
//     map.once("idle", () => setIsLoading(false));
//   }
// }





export const KASHIWAKURU_OD_SOURCE_ID = "kashiwakuru-od";
export const KASHIWAKURU_OD_LAYER_ID = "kashiwakuru-od-line";
export const KASHIWAKURU_OD_HIT_LAYER_ID = "kashiwakuru-od-line-hit";
export const KASHIWAKURU_OD_ORIGINS_SOURCE_ID = "kashiwakuru-od-origins";
export const KASHIWAKURU_OD_DESTS_SOURCE_ID = "kashiwakuru-od-dests";
export const KASHIWAKURU_OD_ORIGINS_LAYER_ID = "kashiwakuru-od-origins-circles";
export const KASHIWAKURU_OD_DESTS_LAYER_ID = "kashiwakuru-od-dests-circles";

const DATA_URL = "/data/kashiwa_od_lines.geojson";

/* -------------------- mesh cleanup -------------------- */
function removeMeshLayers(map: maplibregl.Map) {
    const mesh = [
        "mesh-250m-fill", "mesh-500m-fill", "mesh-1km-fill",
        "mesh-250m-outline", "mesh-500m-outline", "mesh-1km-outline",
    ];
    mesh.forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
    mesh.forEach(id => { if (map.getSource(id)) map.removeSource(id as any); });
}

/* -------------------- sources & layers -------------------- */
async function ensureOdSources(map: maplibregl.Map) {
    const resp = await fetch(DATA_URL);
    const data: GeoJSON.FeatureCollection = await resp.json();

    // Build endpoints from line start/end
    const origins: GeoJSON.Feature[] = [];
    const dests: GeoJSON.Feature[] = [];

    for (const f of data.features as any[]) {
        if (f?.geometry?.type !== "LineString") continue;
        const coords = f.geometry.coordinates as number[][];
        if (!coords?.length) continue;

        origins.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: coords[0] },
            properties: { ...(f.properties || {}), endpoint: "origin" }
        });

        dests.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: coords[coords.length - 1] },
            properties: { ...(f.properties || {}), endpoint: "destination" }
        });
    }

    if (!map.getSource(KASHIWAKURU_OD_SOURCE_ID)) {
        map.addSource(KASHIWAKURU_OD_SOURCE_ID, { type: "geojson", data });
    } else {
        (map.getSource(KASHIWAKURU_OD_SOURCE_ID) as maplibregl.GeoJSONSource).setData(data);
    }

    const originsFC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: origins };
    const destsFC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: dests };

    if (!map.getSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID)) {
        map.addSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID, { type: "geojson", data: originsFC });
    } else {
        (map.getSource(KASHIWAKURU_OD_ORIGINS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(originsFC);
    }

    if (!map.getSource(KASHIWAKURU_OD_DESTS_SOURCE_ID)) {
        map.addSource(KASHIWAKURU_OD_DESTS_SOURCE_ID, { type: "geojson", data: destsFC });
    } else {
        (map.getSource(KASHIWAKURU_OD_DESTS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(destsFC);
    }
}

function addOdLayers(map: maplibregl.Map) {
    // main visual lines
    if (!map.getLayer(KASHIWAKURU_OD_LAYER_ID)) {
        map.addLayer({
            id: KASHIWAKURU_OD_LAYER_ID,
            type: "line",
            source: KASHIWAKURU_OD_SOURCE_ID,
            paint: {
                "line-color": "#1d4ed8",
                "line-opacity": 0.85,
                "line-width": [
                    "interpolate", ["linear"], ["to-number", ["get", "count"]],
                    1, 1, 5, 2.5, 10, 4, 20, 6, 50, 9, 100, 12
                ]
            }
        });
    }

    // wide invisible hit layer (easier clicks)
    if (!map.getLayer(KASHIWAKURU_OD_HIT_LAYER_ID)) {
        map.addLayer({
            id: KASHIWAKURU_OD_HIT_LAYER_ID,
            type: "line",
            source: KASHIWAKURU_OD_SOURCE_ID,
            paint: { "line-color": "#000000", "line-opacity": 0.01, "line-width": 16 }
        });
    }

    // origins (green)
    if (!map.getLayer(KASHIWAKURU_OD_ORIGINS_LAYER_ID)) {
        map.addLayer({
            id: KASHIWAKURU_OD_ORIGINS_LAYER_ID,
            type: "circle",
            source: KASHIWAKURU_OD_ORIGINS_SOURCE_ID,
            paint: {
                "circle-radius": 4,
                "circle-color": "#059669",
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 1
            }
        });
    }

    // destinations (red)
    if (!map.getLayer(KASHIWAKURU_OD_DESTS_LAYER_ID)) {
        map.addLayer({
            id: KASHIWAKURU_OD_DESTS_LAYER_ID,
            type: "circle",
            source: KASHIWAKURU_OD_DESTS_SOURCE_ID,
            paint: {
                "circle-radius": 4,
                "circle-color": "#dc2626",
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 1
            }
        });
    }
}

// ADD this export anywhere below your other exports
export function setKashiwakuruOdFilter(
    map: maplibregl.Map,
    enabled: boolean,
    hour: number
) {
    if (enabled) {
        setKashiwakuruOdHour(map, hour);   // strict hour filter on
    } else {
        showAllKashiwakuruOd(map);         // show everything
    }
}


/* -------------------- “show all hours” & hour filter -------------------- */
export function showAllKashiwakuruOd(map: maplibregl.Map) {
    const ids = [
        KASHIWAKURU_OD_LAYER_ID,
        KASHIWAKURU_OD_HIT_LAYER_ID,
        KASHIWAKURU_OD_ORIGINS_LAYER_ID,
        KASHIWAKURU_OD_DESTS_LAYER_ID,
    ];
    ids.forEach(id => { if (map.getLayer(id)) map.setFilter(id, null as any); });

    // Keep endpoint-focus highlight if active (handled below); otherwise restore opacity
    if (!currentEndpointFocus && map.getLayer(KASHIWAKURU_OD_LAYER_ID)) {
        map.setPaintProperty(KASHIWAKURU_OD_LAYER_ID, "line-opacity", 0.85);
    }

    // If highlight layer exists while “all hours” is active, ensure it filters by endpoint only
    const hi = "od-endpoint-highlight";
    if (map.getLayer(hi)) {
        const filt = currentEndpointFocus ? endpointFilterForName(currentEndpointFocus) : null;
        map.setFilter(hi, filt as any);
    }
}

export function setKashiwakuruOdHour(map: maplibregl.Map, hour: number) {
    const hourOnly: any = ["==", ["get", "hour_start"], hour];

    [KASHIWAKURU_OD_LAYER_ID, KASHIWAKURU_OD_HIT_LAYER_ID].forEach(id => {
        if (map.getLayer(id)) map.setFilter(id, hourOnly);
    });
    if (map.getLayer(KASHIWAKURU_OD_ORIGINS_LAYER_ID)) map.setFilter(KASHIWAKURU_OD_ORIGINS_LAYER_ID, hourOnly);
    if (map.getLayer(KASHIWAKURU_OD_DESTS_LAYER_ID)) map.setFilter(KASHIWAKURU_OD_DESTS_LAYER_ID, hourOnly);

    // If endpoint highlight is active, AND slider is used, highlight := hour AND endpoint
    const hi = "od-endpoint-highlight";
    if (map.getLayer(hi)) {
        const filt = currentEndpointFocus
            ? ["all", hourOnly, endpointFilterForName(currentEndpointFocus)]
            : hourOnly;
        map.setFilter(hi, filt as any);
    }
}

/* -------------------- endpoint focus (highlight by stop) -------------------- */
let currentEndpointFocus: string | null = null;

import type { FilterSpecification } from "maplibre-gl";

function endpointFilterForName(name: string): FilterSpecification {
    return ["any",
        ["==", ["get", "origin"], name],
        ["==", ["get", "destination"], name]
    ];
}

export function setOdEndpointFocus(map: maplibregl.Map, name: string) {
    currentEndpointFocus = name;

    const highlightId = "od-endpoint-highlight";
    const base = {
        id: highlightId,
        type: "line" as const,
        source: KASHIWAKURU_OD_SOURCE_ID,
        paint: { "line-color": "#f59e0b", "line-width": 6 },
        filter: endpointFilterForName(name) as FilterSpecification
    };

    if (!map.getLayer(highlightId)) {
        map.addLayer(base);
    } else {
        map.setFilter(highlightId, base.filter as FilterSpecification);
    }

    // Dim base layer for contrast
    if (map.getLayer(KASHIWAKURU_OD_LAYER_ID)) {
        map.setPaintProperty(KASHIWAKURU_OD_LAYER_ID, "line-opacity", 0.25);
    }
}

export function clearOdEndpointFocus(map: maplibregl.Map) {
    // reset module state if you track it
    try {
        // If you kept a module-scoped variable:
        // currentEndpointFocus = null;
    } catch { }

    // Remove any highlight layers we may have created
    const highlightIds = ["od-endpoint-highlight", "od-selected-highlight"];
    highlightIds.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
    });

    // Restore base line opacity so the user *sees* a change
    if (map.getLayer("kashiwakuru-od-line")) {
        map.setPaintProperty("kashiwakuru-od-line", "line-opacity", 0.85);
    }

    // (Optional) also clear any filter on the highlight layer (defensive)
    highlightIds.forEach(id => {
        if (map.getLayer(id)) map.setFilter(id, null as any);
    });

    // (Optional) close any open popup so the UI change is visible
    // If you pass a popup instance into this module, you could remove it here.
}

/* -------------------- popups & interactions -------------------- */
function odPopupHtml(p: any) {
    return `
    <div class="rounded-xl border bg-white p-4 shadow-xl text-xs space-y-2 w-72">
      <div><strong>O→D:</strong> ${p?.origin ?? "N/A"} → ${p?.destination ?? "N/A"}</div>
      <div><strong>時間帯:</strong> ${p?.timeband ?? "N/A"}</div>
      <div><strong>トリップ数:</strong> ${p?.count ?? "N/A"}</div>
      <button id="od-show-all" class="inline-flex items-center w-full justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90">
        全時間帯を表示
      </button>
    </div>
  `;
}

function endpointPopupHtml(name: string, role: "origin" | "destination") {
    const label = role === "origin" ? "この出発地を使う線をハイライト" : "この到着地を使う線をハイライト";
    return `
    <div class="rounded-xl border bg-white p-4 shadow-xl text-xs space-y-2 w-72">
      <div><strong>${role === "origin" ? "出発地" : "到着地"}:</strong> ${name}</div>
      <button id="od-endpoint-focus" class="inline-flex items-center w-full justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90">
        ${label}
      </button>
    </div>
  `;
}

function wireInteractions(map: maplibregl.Map, popup: maplibregl.Popup) {
    // Lines: popup with "show all hours" button
    map.on("click", KASHIWAKURU_OD_HIT_LAYER_ID, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p: any = f.properties || {};
        const geom = f.geometry as any;
        const coords: number[][] = geom?.coordinates || [];
        const start = coords[0], end = coords[coords.length - 1];

        popup.setLngLat(e.lngLat).setHTML(odPopupHtml(p)).addTo(map);

        popup.getElement()
            ?.querySelector<HTMLButtonElement>("#od-show-all")
            ?.addEventListener("click", () => {
                showAllKashiwakuruOd(map);
                if (start && end) {
                    const sw: [number, number] = [Math.min(start[0], end[0]), Math.min(start[1], end[1])];
                    const ne: [number, number] = [Math.max(start[0], end[0]), Math.max(start[1], end[1])];
                    map.fitBounds([sw, ne], { padding: 60, duration: 800 });
                }
            });
    });

    // Origins: popup with "highlight lines using this origin"
    map.on("click", KASHIWAKURU_OD_ORIGINS_LAYER_ID, (e) => {
        const f = e.features?.[0] as any;
        if (!f) return;
        const stopName = f.properties?.origin as string;
        popup.setLngLat(e.lngLat).setHTML(endpointPopupHtml(stopName, "origin")).addTo(map);
        popup.getElement()
            ?.querySelector<HTMLButtonElement>("#od-endpoint-focus")
            ?.addEventListener("click", () => setOdEndpointFocus(map, stopName));
    });

    // Destinations: popup with "highlight lines using this destination"
    map.on("click", KASHIWAKURU_OD_DESTS_LAYER_ID, (e) => {
        const f = e.features?.[0] as any;
        if (!f) return;
        const stopName = f.properties?.destination as string;
        popup.setLngLat(e.lngLat).setHTML(endpointPopupHtml(stopName, "destination")).addTo(map);
        popup.getElement()
            ?.querySelector<HTMLButtonElement>("#od-endpoint-focus")
            ?.addEventListener("click", () => setOdEndpointFocus(map, stopName));
    });

    // Pointer affordance
    [KASHIWAKURU_OD_HIT_LAYER_ID, KASHIWAKURU_OD_ORIGINS_LAYER_ID, KASHIWAKURU_OD_DESTS_LAYER_ID].forEach(id => {
        map.on("mouseenter", id, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", id, () => { map.getCanvas().style.cursor = ""; });
    });
}

/* -------------------- public API -------------------- */
export async function toggleKashiwakuruOdLayer(
    map: maplibregl.Map,
    visible: boolean,
    setIsLoading: (b: boolean) => void,
    setVisible: (b: boolean) => void,
    _selectedHour: number,                // kept for signature compatibility
    transportPopupRef?: maplibregl.Popup    // pass your existing popup instance from MapView
) {
    try {
        setIsLoading(true);
        if (!visible) {
            removeMeshLayers(map);
            await ensureOdSources(map);
            addOdLayers(map);
            if (transportPopupRef) wireInteractions(map, transportPopupRef);

            // default → show ALL hours
            showAllKashiwakuruOd(map);

            // ensure visibility
            [KASHIWAKURU_OD_LAYER_ID, KASHIWAKURU_OD_HIT_LAYER_ID, KASHIWAKURU_OD_ORIGINS_LAYER_ID, KASHIWAKURU_OD_DESTS_LAYER_ID]
                .forEach(id => map.getLayer(id) && map.setLayoutProperty(id, "visibility", "visible"));

            setVisible(true);
        } else {
            [KASHIWAKURU_OD_LAYER_ID, KASHIWAKURU_OD_HIT_LAYER_ID, KASHIWAKURU_OD_ORIGINS_LAYER_ID, KASHIWAKURU_OD_DESTS_LAYER_ID]
                .forEach(id => map.getLayer(id) && map.setLayoutProperty(id, "visibility", "none"));
            setVisible(false);
        }
    } finally {
        map.once("idle", () => setIsLoading(false));
    }
}
