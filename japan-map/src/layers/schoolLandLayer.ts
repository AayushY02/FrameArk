const SCHOOL_LAYER_IDS = ['school-layer'];

export const toggleSchoolLayer = (
    map: mapboxgl.Map,
    schoolLayerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setSchoolLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'school-national-land';
    const tilesetUrl = 'mapbox://frame-ark.school-national-land';
    const sourceLayer = 'school-national-land';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!schoolLayerVisible) {
        // Add vector source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'vector', url: tilesetUrl });
        }

        // Add circle layer
        if (!map.getLayer('school-layer')) {
            map.addLayer({
                id: 'school-layer',
                type: 'symbol',
                source: sourceId,
                'source-layer': sourceLayer,
                minzoom: 5,
                layout: {
                    'icon-image': 'school',
                    'icon-size': 1,
                    'icon-allow-overlap': true,
                    'icon-anchor': 'bottom',
                    visibility: 'visible'
                }
            }, labelLayerId);
        } else {
            map.setLayoutProperty('school-layer', 'visibility', 'visible');
        }

        // Hide all other relevant layers
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',

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
    }

    setSchoolLayerVisible(!schoolLayerVisible);

    map.once('idle', () => setIsLoading(false));
};