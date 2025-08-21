export const shopCategories = [
    { label: 'デパート・ショッピングモール', color: '#FF5733' },  // Red for Shopping Mall
    { label: 'スーパーマーケット', color: '#33FF57' }  // Green for Supermarket
];

export const toggleKashiwaShopsLayer = (
    map: maplibregl.Map,
    kashiwaShopsVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setKashiwaShopsVisible: (v: boolean) => void,
    selectedCategories: string[]
) => {
    setIsLoading(true);

    const addShopsLayer = (map: maplibregl.Map, selectedCategories: string[]) => {
        const sourceId = 'kashiwa-shops';
        const geojsonUrl = '/data/kashiwa_shops.geojson';

        // Add the source if it's not already present
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: geojsonUrl
            });
        }

        // Define the categories and their corresponding colors


        // Check if "全て" (All) is selected
        const showAllShops = selectedCategories.includes('');  // Check if "全て" is selected

        // Remove "subete" layer if it exists
        if (map.getLayer('kashiwa-shops-subete')) {
            map.removeLayer('kashiwa-shops-subete');
        }

        // Add the "subete" layer if "全て" is selected
        if (showAllShops) {
            // Add the "subete" layer that shows all categories without any filter
            const layerId = `kashiwa-shops-subete`;

            if (!map.getLayer(layerId)) {
                map.addLayer({
                    id: layerId,
                    type: 'circle',
                    source: sourceId,
                    paint: {
                        'circle-radius': 6,
                        'circle-opacity': 0.8,
                        'circle-stroke-width': 1,
                        'circle-color': [
                            'match',
                            ['get', 'カテゴリ'],
                            'デパート・ショッピングモール', '#FF5733',  // Red for Shopping Mall
                            'スーパーマーケット', '#33FF57',  // Green for Supermarket
                            '#808080'  // Default color (gray)
                        ]
                    }

                });
            }
        } else {
            // Add layers for selected categories if "subete" is not selected
            shopCategories.forEach((category) => {
                const layerId = `kashiwa-shops-${category.label}`;

                // Remove individual layer if it exists before adding a new one
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }

                // Add the layer only if it's selected
                if (selectedCategories.includes(category.label)) {
                    map.addLayer({
                        id: layerId,
                        type: 'circle',
                        source: sourceId,
                        filter: ['==', ['get', 'カテゴリ'], category.label],
                        paint: {
                            'circle-radius': 6,
                            'circle-opacity': 0.8,
                            'circle-stroke-width': 1,
                            'circle-color': category.color // Use category color
                        }
                    });
                }
            });


        }

        // Mark layer visibility state as updated
        setKashiwaShopsVisible(!kashiwaShopsVisible);
        map.once('idle', () => setIsLoading(false));
    };
    // Ensure that the map style is loaded
    if (map.isStyleLoaded()) {

        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
        ].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

        addShopsLayer(map, selectedCategories);
    } else {
        // Wait for style to load before adding the layer
        map.on('style.load', () => {
            addShopsLayer(map, selectedCategories);
        });
    }


};











// import mapboxgl from "mapbox-gl";
// import { PmTilesSource } from "mapbox-pmtiles";

// export const shopCategories = [
//     { label: "デパート・ショッピングモール", color: "#FF5733" },
//     { label: "スーパーマーケット", color: "#33FF57" }
// ];

// // optional: keep ASCII-only layer ids
// const slug = (s: string) =>
//     s
//         .normalize("NFKD")
//         .replace(/[^\w\s-]/g, "")
//         .trim()
//         .replace(/\s+/g, "-")
//         .toLowerCase();

// export const toggleKashiwaShopsLayer = (
//     map: maplibregl.Map,
//     kashiwaShopsVisible: boolean,
//     setIsLoading: (v: boolean) => void,
//     setKashiwaShopsVisible: (v: boolean) => void,
//     selectedCategories: string[]
// ) => {
//     setIsLoading(true);

//     const ensurePmtilesRegistered = () => {
//         const g = mapboxgl as any;
//         if (!g.__pmtilesRegistered) {
//             (mapboxgl.Style as any).setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource);
//             g.__pmtilesRegistered = true;
//         }
//     };

//     const addShopsLayer = async (map: maplibregl.Map, selectedCategories: string[]) => {
//         ensurePmtilesRegistered();

//         const sourceId = "kashiwa-shops";
//         const pmtilesUrl = `${location.origin}/tiles/kashiwa_shops.pmtiles`;
//         const SOURCE_LAYER = "kashiwa_shops"; // <- tippecanoe -l name from your script

//         // header gives min/max zoom and optional bounds/center
//         const h = await PmTilesSource.getHeader(pmtilesUrl);

//         if (!map.getSource(sourceId)) {
//             map.addSource(sourceId, {
//                 type: PmTilesSource.SOURCE_TYPE as any,
//                 url: pmtilesUrl,
//                 minzoom: h.minZoom,
//                 maxzoom: h.maxZoom,
//                 bounds:
//                     h.minLon !== undefined
//                         ? [h.minLon, h.minLat, h.maxLon, h.maxLat]
//                         : undefined
//             } as any);
//         }

//         const showAllShops = selectedCategories.includes(""); // your "全て" sentinel

//         // Always clear the "all" layer first
//         if (map.getLayer("kashiwa-shops-subete")) {
//             map.removeLayer("kashiwa-shops-subete");
//         }

//         if (showAllShops) {
//             // Also clear any category layers if switching to "all"
//             for (const category of shopCategories) {
//                 const layerId = `kashiwa-shops-${slug(category.label)}`;
//                 if (map.getLayer(layerId)) map.removeLayer(layerId);
//             }

//             const layerId = "kashiwa-shops-subete";
//             if (!map.getLayer(layerId)) {
//                 map.addLayer({
//                     id: layerId,
//                     type: "circle",
//                     source: sourceId,
//                     "source-layer": SOURCE_LAYER,
//                     paint: {
//                         "circle-radius": 6,
//                         "circle-opacity": 0.8,
//                         "circle-stroke-width": 1,
//                         "circle-stroke-color": "#000000", // optional
//                         "circle-color": [
//                             "match",
//                             ["get", "カテゴリ"],
//                             "デパート・ショッピングモール",
//                             "#FF5733",
//                             "スーパーマーケット",
//                             "#33FF57",
//                             "#808080"
//                         ]
//                     }
//                 });
//             }
//         } else {
//             // Build per-category layers; first clear any that exist
//             for (const category of shopCategories) {
//                 const layerId = `kashiwa-shops-${slug(category.label)}`;

//                 if (map.getLayer(layerId)) {
//                     map.removeLayer(layerId);
//                 }
//                 if (selectedCategories.includes(category.label)) {
//                     map.addLayer({
//                         id: layerId,
//                         type: "circle",
//                         source: sourceId,
//                         "source-layer": SOURCE_LAYER, // <-- REQUIRED
//                         filter: ["==", ["get", "カテゴリ"], category.label],
//                         paint: {
//                             "circle-radius": 6,
//                             "circle-opacity": 0.8,
//                             "circle-stroke-width": 1,
//                             "circle-stroke-color": "#000000", // optional
//                             "circle-color": category.color
//                         }
//                     });
//                 }
//             }
//         }

//         // Set initial view once (optional)
//         if (h.centerLon != null && h.centerLat != null && !(map as any).__kashiwaViewSet) {
//             map.setCenter([h.centerLon, h.centerLat]);
//             if (typeof h.maxZoom === "number") {
//                 map.setZoom(Math.max(0, h.maxZoom - 2));
//             }
//             (map as any).__kashiwaViewSet = true;
//         }

//         setKashiwaShopsVisible(!kashiwaShopsVisible);
//         map.once("idle", () => setIsLoading(false));
//     };

//     // Hide your mesh layers (unchanged)
//     const hideMeshLayers = () => {
//         [
//             "mesh-1km-fill",
//             "mesh-1km-outline",
//             "mesh-500m-fill",
//             "mesh-500m-outline",
//             "mesh-250m-fill",
//             "mesh-250m-outline"
//         ].forEach((id) => {
//             if (map.getLayer(id)) {
//                 map.setLayoutProperty(id, "visibility", "none");
//             }
//         });
//     };

//     if (map.isStyleLoaded()) {
//         hideMeshLayers();
//         addShopsLayer(map, selectedCategories);
//     } else {
//         map.on("style.load", () => {
//             hideMeshLayers();
//             addShopsLayer(map, selectedCategories);
//         });
//     }
// };
