
const TRANSPORT_LAYER_IDS = ['transportation-line', 'transportation-line-hover'];

export const toggleTransportationLayer = (
    map: mapboxgl.Map,
    transportVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setTransportVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'transportation-info-2022';
    const tilesetUrl = 'mapbox://frame-ark.transportation';
    const sourceLayer = 'transportation';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!transportVisible) {
        // add vector source once
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'vector', url: tilesetUrl });
        }


        if (!map.getLayer('transportation-line')) {
            map.addLayer({
                id: 'transportation-line',
                type: 'line',
                source: sourceId,
                minzoom:0,
                'source-layer': sourceLayer,
                layout: { visibility: 'visible' },
                paint: {
                    'line-color': ['get', 'Color'],
                    'line-width': 2
                }
            }, labelLayerId);
        } else {
            map.setLayoutProperty('transportation-line', 'visibility', 'visible');
        }

        if (!map.getLayer('transportation-line-hover')) {
            map.addLayer({
                id: 'transportation-line-hover',
                type: 'line',
                source: sourceId,
                'source-layer': sourceLayer,
                layout: {},
                paint: {
                    'line-color': '#000000',
                    'line-opacity': 0,
                    'line-width': 15 // Invisible but catches mouse events
                }
            });
        }
        // hide everything else
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
            'agri-fill', 'agri-outline', 'agri-labels',
            'admin-fill', 'admin-line'
        ].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
        });

    } else {
        // hide the transport layer
        TRANSPORT_LAYER_IDS.forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
        });

        // show mesh layers again
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline'
        ].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible');
        });
    }

    setTransportVisible(!transportVisible);

    map.once('idle', () => setIsLoading(false));
};