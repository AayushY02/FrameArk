
export const shopCategories = [
    { label: 'デパート・ショッピングモール', color: '#FF5733' },  // Red for Shopping Mall
    { label: 'スーパーマーケット', color: '#33FF57' }  // Green for Supermarket
];

export const toggleKashiwaShopsLayer = (
    map: mapboxgl.Map,
    kashiwaShopsVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setKashiwaShopsVisible: (v: boolean) => void,
    selectedCategories: string[]
) => {
    setIsLoading(true);

    const addShopsLayer = (map: mapboxgl.Map, selectedCategories: string[]) => {
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









