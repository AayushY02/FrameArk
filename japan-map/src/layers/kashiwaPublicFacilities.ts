

export const categories = [
    { label: '公立保育園', color: '#FF5733' },
    { label: '私立認可保育園', color: '#33FF57' },
    { label: '小規模保育施設', color: '#DDD92A' },
    { label: '私立幼稚園', color: '#313715' },
    { label: '認定こども園', color: '#91E5F6' },
    { label: '児童センター', color: '#FF1053' },
    { label: '地域子育て支援拠点', color: '#725AC1' },
    { label: 'こどもルーム', color: '#A1EF8B' },
    { label: 'こども図書館', color: '#5D737E' },
    { label: '市役所・支所・出張所', color: '#FF9000' },
    { label: '図書館', color: '#13070C' },
    { label: '薬局', color: '#7fc6a4' },
    { label: '市立小学校', color: '#3357FF' },
    { label: '市内中学校', color: '#B1740F' },
    { label: '高等学校', color: '#23022E' },
    { label: '大学・大学校', color: '#764134' },
    { label: '特別支援学校', color: '#BD2D87' },
    { label: 'その他', color: '#808080' }
];

export const toggleKashiwaPublicFacilityLayer = (
    map: mapboxgl.Map,
    kashiwaPublicFacilityVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setKashiwaPublicFacilityVisible: (v: boolean) => void,
    selectedCategories: string[]
) => {
    setIsLoading(true);

    const addFacilityLayer = (map: mapboxgl.Map, selectedCategories: string[]) => {
        const sourceId = 'kashiwa-public-facility';
        const geojsonUrl = '/data/kashiwa_public_facility.geojson';

        // Add the source if it's not already present
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: geojsonUrl
            });
        }

        // Define the categories and their corresponding colors


        // Check if "全て" (All) is selected
        const showAllFacilities = selectedCategories.includes('');  // Check if "全て" is selected

        // Remove "subete" layer if it exists
        if (map.getLayer('kashiwa-public-facility-subete')) {
            map.removeLayer('kashiwa-public-facility-subete');
        }

        // Add the "subete" layer if "全て" is selected
        if (showAllFacilities) {
            // Add the "subete" layer that shows all categories without any filter
            const layerId = `kashiwa-public-facility-subete`;

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
                            '公立保育園', '#FF5733',  // 1
                            '私立認可保育園', '#33FF57',   // 2
                            '小規模保育施設', '#DDD92A',  // 3
                            '私立幼稚園', '#313715',  // 4
                            '認定こども園', '#91E5F6',  // 5
                            '児童センター', '#FF1053',  // 6    
                            '地域子育て支援拠点', '#725AC1', // 7
                            'こどもルーム', '#A1EF8B',  // 8
                            'こどもルーム発達センター・キッズルーム', '#95C623', // 9  
                            'こども図書館', '#5D737E',  // 10
                            '市役所・支所・出張所', '#FF9000', // 11
                            '近隣センター', '#031926', // 12
                            '図書館', '#13070C',  // 13
                            '薬局', '#7fc6a4',  // 14
                            '市立小学校', '#3357FF', // 15
                            '市内中学校', '#B1740F',  // 16
                            '高等学校', '#23022E',  // 17
                            '大学・大学校', '#764134',  // 18
                            '特別支援学校', '#BD2D87',  // 19
                            '#808080'  // Default color for others
                        ]
                    }
                });
            }
        } else {
            // Add layers for selected categories if "subete" is not selected
            categories.forEach((category) => {
                const layerId = `kashiwa-public-facility-${category.label}`;

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
                        filter: ['==', ['get', 'カテゴリ'], category.label], // Apply filter by category
                        paint: {
                            'circle-radius': 6,
                            'circle-opacity': 0.8,
                            'circle-stroke-width': 1,
                        
                            'circle-color': category.color // Set the color based on the category
                        }
                    });
                }
            });

            
        }

        // Mark layer visibility state as updated
        setKashiwaPublicFacilityVisible(!kashiwaPublicFacilityVisible);
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

        addFacilityLayer(map, selectedCategories);
    } else {
        // Wait for style to load before adding the layer
        map.on('style.load', () => {
            addFacilityLayer(map, selectedCategories);
        });
    }


};









