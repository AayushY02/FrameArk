


// export const shopCategories = [
//     { label: 'デパート・ショッピングモール', color: '#FF5733' }, // Red for Shopping Mall
//     { label: 'スーパーマーケット', color: '#33FF57' },           // Green for Supermarket
//     { label: 'その他', color: '#FF99C8' },           // Green for Supermarket
// ];

// function registerShopSquareImages(map: maplibregl.Map) {
//     const baseSize = 80;  // px
//     const border = 10;     // px
//     const idsAndColors: Array<[string, string]> = [
//         ['shop-square-デパート・ショッピングモール', '#FF5733'],
//         ['shop-square-スーパーマーケット', '#33FF57'],
//         ['shop-square-その他', '#FF99C8'], // default
//     ];

//     const makeSquare = (fill: string) => {
//         const canvas = document.createElement('canvas');
//         canvas.width = baseSize;
//         canvas.height = baseSize;
//         const ctx = canvas.getContext('2d')!;
//         ctx.clearRect(0, 0, baseSize, baseSize);
//         // outer white
//         ctx.fillStyle = '#FFFFFF';
//         ctx.fillRect(0, 0, baseSize, baseSize);
//         // inner fill
//         ctx.fillStyle = fill;
//         ctx.fillRect(border, border, baseSize - border * 2, baseSize - border * 2);

//         // Get pixel data
//         const imageData = ctx.getImageData(0, 0, baseSize, baseSize);
//         return {
//             width: imageData.width,
//             height: imageData.height,
//             data: new Uint8ClampedArray(imageData.data.buffer),
//         };
//     };

//     idsAndColors.forEach(([id, color]) => {
//         if (!map.hasImage(id)) {
//             map.addImage(id, makeSquare(color), { pixelRatio: 2 });
//         }
//     });
// }
// export const toggleKashiwaShopsLayer = (
//     map: maplibregl.Map,
//     kashiwaShopsVisible: boolean,
//     setIsLoading: (v: boolean) => void,
//     setKashiwaShopsVisible: (v: boolean) => void,
//     selectedCategories: string[]
// ) => {
//     setIsLoading(true);

//     const addShopsLayer = (map: maplibregl.Map, selectedCategories: string[]) => {
//         const sourceId = 'kashiwa-shops';
//         const geojsonUrl = '/data/kashiwa_shops.geojson';

//         // Add or refresh the source
//         if (!map.getSource(sourceId)) {
//             map.addSource(sourceId, {
//                 type: 'geojson',
//                 data: geojsonUrl
//             });
//         } else {
//             const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
//             // @ts-ignore
//             src.setData(geojsonUrl);
//         }

//         // Ensure our square icons are registered
//         registerShopSquareImages(map);

//         // "All" toggle
//         const showAllShops = selectedCategories.includes('');

//         // Remove "subete" (all) layer if it exists
//         if (map.getLayer('kashiwa-shops-subete')) {
//             map.removeLayer('kashiwa-shops-subete');
//         }

//         if (showAllShops) {
//             // SYMBOL layer with square icons selected by category
//             const layerId = 'kashiwa-shops-subete';
//             if (!map.getLayer(layerId)) {
//                 map.addLayer({
//                     id: layerId,
//                     type: 'symbol',
//                     source: sourceId,
//                     layout: {
//                         // pick an icon per feature based on カテゴリ
//                         'icon-image': [
//                             'match',
//                             ['get', 'カテゴリ'],
//                             'デパート・ショッピングモール', 'shop-square-デパート・ショッピングモール',
//                             'スーパーマーケット', 'shop-square-スーパーマーケット',

//               /* default */ 'shop-square-その他'
//                         ],
//                         'icon-size': 0.5,            // ≈12px on a 24px base
//                         'icon-allow-overlap': true,
//                         'icon-ignore-placement': true
//                     },
//                     paint: {
//                         'icon-opacity': 0.9
//                     }
//                 });
//             }
//         } else {
//             // Per-category layers
//             shopCategories.forEach((category) => {
//                 const layerId = `kashiwa-shops-${category.label}`;

//                 // Remove if exists
//                 if (map.getLayer(layerId)) {
//                     map.removeLayer(layerId);
//                 }

//                 if (selectedCategories.includes(category.label)) {
//                     map.addLayer({
//                         id: layerId,
//                         type: 'symbol',
//                         source: sourceId,
//                         filter: ['==', ['get', 'カテゴリ'], category.label],
//                         layout: {
//                             'icon-image':
//                                 category.label === 'デパート・ショッピングモール'
//                                     ? 'shop-square-デパート・ショッピングモール'
//                                     : category.label === 'スーパーマーケット'
//                                         ? 'shop-square-スーパーマーケット'
//                                         : 'shop-square-その他',
//                             'icon-size': 0.5,
//                             'icon-allow-overlap': true,
//                             'icon-ignore-placement': true
//                         },
//                         paint: {
//                             'icon-opacity': 0.9
//                         }
//                     });
//                 }
//             });
//         }

//         // Mark layer visibility state as updated
//         setKashiwaShopsVisible(!kashiwaShopsVisible);
//         map.once('idle', () => setIsLoading(false));
//     };

//     // Ensure that the map style is loaded
//     if (map.isStyleLoaded()) {
//         [
//             'mesh-1km-fill', 'mesh-1km-outline',
//             'mesh-500m-fill', 'mesh-500m-outline',
//             'mesh-250m-fill', 'mesh-250m-outline',
//         ].forEach(id => {
//             if (map.getLayer(id)) {
//                 map.setLayoutProperty(id, 'visibility', 'none');
//             }
//         });

//         addShopsLayer(map, selectedCategories);
//     } else {
//         map.on('style.load', () => {
//             addShopsLayer(map, selectedCategories);
//         });
//     }
// };












export const shopCategories = [
    { label: 'デパート・ショッピングモール', color: '#FF5733' },
    { label: 'スーパーマーケット', color: '#33FF57' },
    { label: 'その他', color: '#FF99C8' },
];

function registerShopSquareImages(map: maplibregl.Map) {
    const baseSize = 80;  // px
    const border = 10;    // px
    const idsAndColors: Array<[string, string]> = [
        ['shop-square-デパート・ショッピングモール', '#FF5733'],
        ['shop-square-スーパーマーケット', '#33FF57'],
        ['shop-square-その他', '#FF99C8'], // default
    ];

    const makeSquare = (fill: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = baseSize;
        canvas.height = baseSize;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, baseSize, baseSize);

        // outer white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, baseSize, baseSize);

        // inner fill
        ctx.fillStyle = fill;
        ctx.fillRect(border, border, baseSize - border * 2, baseSize - border * 2);

        const imageData = ctx.getImageData(0, 0, baseSize, baseSize);
        return {
            width: imageData.width,
            height: imageData.height,
            data: new Uint8ClampedArray(imageData.data.buffer),
        };
    };

    idsAndColors.forEach(([id, color]) => {
        if (!map.hasImage(id)) {
            map.addImage(id, makeSquare(color), { pixelRatio: 2 });
        }
    });
}

/**
 * Filter for “その他” = anything that is NOT in the two main categories,
 * plus records with missing/empty カテゴリ.
 */
const SONOTA_FILTER: any = [
    'any',
    ['!', ['has', 'カテゴリ']],                                                    // property missing
    ['==', ['coalesce', ['to-string', ['get', 'カテゴリ']], ''], ''],             // empty/null -> empty string
    ['!', ['match', ['to-string', ['get', 'カテゴリ']],                           // NOT IN set
        ['デパート・ショッピングモール', 'スーパーマーケット'],
        true,   // if in the set
        false   // if not in the set
    ]],
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

        // Add or refresh the source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: geojsonUrl,
            });
        } else {
            const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
            // @ts-ignore - allow setting URL to refresh
            src.setData(geojsonUrl);
        }

        // Ensure our square icons are registered
        registerShopSquareImages(map);

        // “All” toggle
        const showAllShops = selectedCategories.includes('');

        // Clean up any existing shop layers to avoid duplicates
        if (map.getLayer('kashiwa-shops-subete')) {
            map.removeLayer('kashiwa-shops-subete');
        }
        shopCategories.forEach((c) => {
            const lid = `kashiwa-shops-${c.label}`;
            if (map.getLayer(lid)) {
                map.removeLayer(lid);
            }
        });

        if (showAllShops) {
            // One layer showing all features, with per-feature icon
            const layerId = 'kashiwa-shops-subete';
            if (!map.getLayer(layerId)) {
                map.addLayer({
                    id: layerId,
                    type: 'symbol',
                    source: sourceId,
                    layout: {
                        'icon-image': [
                            'match',
                            ['get', 'カテゴリ'],
                            'デパート・ショッピングモール', 'shop-square-デパート・ショッピングモール',
                            'スーパーマーケット', 'shop-square-スーパーマーケット',
              /* default */ 'shop-square-その他',
                        ],
                        'icon-size': 0.5,
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,
                    },
                    paint: {
                        'icon-opacity': 0.9,
                    },
                });
            }
        } else {
            // Per-category layers
            shopCategories.forEach((category) => {
                if (!selectedCategories.includes(category.label)) return;

                const layerId = `kashiwa-shops-${category.label}`;
                const isSonota = category.label === 'その他';

                map.addLayer({
                    id: layerId,
                    type: 'symbol',
                    source: sourceId,
                    filter: isSonota
                        ? SONOTA_FILTER
                        : ['==', ['get', 'カテゴリ'], category.label],
                    layout: {
                        'icon-image':
                            category.label === 'デパート・ショッピングモール'
                                ? 'shop-square-デパート・ショッピングモール'
                                : category.label === 'スーパーマーケット'
                                    ? 'shop-square-スーパーマーケット'
                                    : 'shop-square-その他',
                        'icon-size': 0.5,
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,
                    },
                    paint: {
                        'icon-opacity': 0.9,
                    },
                });
            });
        }

        // Mark layer visibility state as updated
        setKashiwaShopsVisible(!kashiwaShopsVisible);
        map.once('idle', () => setIsLoading(false));
    };

    // Ensure that the map style is loaded
    if (map.isStyleLoaded()) {
        // Hide mesh layers if desired when showing shops
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
        ].forEach((id) => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

        addShopsLayer(map, selectedCategories);
    } else {
        map.on('style.load', () => addShopsLayer(map, selectedCategories));
    }
};
