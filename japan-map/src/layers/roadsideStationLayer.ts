const SCHOOL_LAYER_IDS = ['roadside-station'];

export const toggleRoadsideStationLayer = (
    map: mapboxgl.Map,
    roadsideStationLayerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setRoadsideStationLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'roadside-station';
    const tilesetUrl = 'mapbox://frame-ark.roadside-station';
    const sourceLayer = 'roadside-station';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!roadsideStationLayerVisible) {
        // Add vector source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'vector', url: tilesetUrl });
        }

        // Add circle layer
        if (!map.getLayer('roadside-station')) {
            map.addLayer({
                id: 'roadside-station',
                type: 'symbol',
                source: sourceId,
                'source-layer': sourceLayer,
                minzoom: 5,
                layout: {
                    'icon-image': 'convenience',
                    'icon-size': 3,
                    'icon-allow-overlap': true,
                    'icon-anchor': 'bottom',
                    visibility: 'visible'
                }
            }, labelLayerId);
        } else {
            map.setLayoutProperty('roadside-station', 'visibility', 'visible');
        }

        // Hide all other relevant layers
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
            'agri-fill', 'agri-outline', 'agri-labels',
            'transportation-line-hover', 'transportation-line',
            'admin-fill', 'admin-line',
            'facilities-circle', 'medical-layer', 'school-layer', 'tourist-layer'

        ].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

    } else {
        // Hide facility layer
        SCHOOL_LAYER_IDS.forEach(id => {
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

    setRoadsideStationLayerVisible(!roadsideStationLayerVisible);

    map.once('idle', () => setIsLoading(false));
};