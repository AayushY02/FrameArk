const SCHOOL_LAYER_IDS = ['medical-layer'];

export const toggleMedicalLayer = (
    map: mapboxgl.Map,
    medicalLayerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setMedicalLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'medical-institute-land';
    const tilesetUrl = 'mapbox://frame-ark.medical-institute-land';
    const sourceLayer = 'medical-institute-land';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!medicalLayerVisible) {
        // Add vector source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'vector', url: tilesetUrl });
        }

        // Add circle layer
        if (!map.getLayer('medical-layer')) {
            map.addLayer({
                id: 'medical-layer',
                type: 'symbol',
                source: sourceId,
                'source-layer': sourceLayer,
                minzoom: 5,
                layout: {
                    'icon-image': 'hospital', // built-in Mapbox icon
                    'icon-size': 1,
                    'icon-allow-overlap': true,
                    'icon-anchor': 'bottom',
                    visibility: 'visible'
                }
            }, labelLayerId);
        } else {
            map.setLayoutProperty('medical-layer', 'visibility', 'visible');
        }

        // Hide all other relevant layers
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
            'agri-fill', 'agri-outline', 'agri-labels',
            'transportation-line-hover', 'transportation-line',
            'school-layer',
            'admin-fill', 'admin-line'
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

    setMedicalLayerVisible(!medicalLayerVisible);

    map.once('idle', () => setIsLoading(false));
};