const TOURIST_LAYER_IDS = ['tourist-layer'];

export const toggleTouristLayer = (
    map: mapboxgl.Map,
    touristLayerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setTouristLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'tourist-spots';
    const tilesetUrl = 'mapbox://frame-ark.tourist-spots';
    const sourceLayer = 'tourist-spots';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!touristLayerVisible) {
        // Add vector source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'vector', url: tilesetUrl });
        }

        // Add circle layer
        if (!map.getLayer('tourist-layer')) {
            map.addLayer({
                id: 'tourist-layer',
                type: 'symbol',
                source: sourceId,
                'source-layer': sourceLayer,
                minzoom: 5,
                layout: {
                    'icon-image': ['get', 'marker-icon'],
                    'icon-size': 2,
                    'icon-allow-overlap': true,
                    'icon-anchor': 'bottom',
                    visibility: 'visible'
                }
            }, labelLayerId);

            

            
        } else {
            map.setLayoutProperty('tourist-layer', 'visibility', 'visible');
        }

        // Hide all other relevant layers
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
            'agri-fill', 'agri-outline', 'agri-labels',
            'transportation-line-hover', 'transportation-line',
            'admin-fill', 'admin-line',
            'facilities-circle', 'medical-layer', 'school-layer'

        ].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

    } else {
        // Hide facility layer
        TOURIST_LAYER_IDS.forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });
        ['agri-fill', 'agri-outline', 'agri-labels',
            'transportation-line-hover', 'transportation-line',
            'admin-fill', 'admin-line'].forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', 'none');
                }
            });

        // Show mesh layers again
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline'
        ].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'visible');
            }
        });
    }

    setTouristLayerVisible(!touristLayerVisible);

    map.once('idle', () => setIsLoading(false));
};