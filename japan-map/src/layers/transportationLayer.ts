
const TRANSPORT_LAYER_IDS = ['transportation-line', 'transportation-line-hover'];


export const toggleBoardingLayer = (
    map: mapboxgl.Map,
    setVisible: (v: boolean) => void
) => {
    const layerId = 'boarding-layer';
    if (!map.getLayer(layerId)) return;
    const isVisible = map.getLayoutProperty(layerId, 'visibility') === 'visible';
    map.setLayoutProperty(layerId, 'visibility', isVisible ? 'none' : 'visible');
    setVisible(!isVisible);
};

export const toggleAlightingLayer = (
    map: mapboxgl.Map,
    setVisible: (v: boolean) => void
) => {
    const layerId = 'alighting-layer';
    if (!map.getLayer(layerId)) return;
    const isVisible = map.getLayoutProperty(layerId, 'visibility') === 'visible';
    map.setLayoutProperty(layerId, 'visibility', isVisible ? 'none' : 'visible');
    setVisible(!isVisible);
};
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

    const addVectorSource = (id: string, url: string) => {
        if (!map.getSource(id)) {
            map.addSource(id, { type: 'vector', url });
        }
    };

    if (!transportVisible) {
        // add vector source once
        addVectorSource(sourceId, tilesetUrl);
        // addVectorSource('bus-flows', 'mapbox://frame-ark.bus-flows');


        if (!map.getLayer('transportation-line')) {
            map.addLayer({
                id: 'transportation-line',
                type: 'line',
                source: sourceId,
                minzoom: 0,
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



        // if (!map.getLayer('boarding-layer')) {
        //     map.addLayer({
        //         id: 'boarding-layer',
        //         type: 'circle',
        //         source: 'bus-flows',
        //         'source-layer': 'bus-flows',
        //         filter: ['==', ['get', 'type'], 'boarding'],
        //         paint: {
        //             'circle-radius': ['interpolate', ['linear'], ['get', 'count'], 0, 4, 100, 20],
        //             'circle-color': '#27ae60',
        //             'circle-opacity': 0.6
        //         }
        //     });
        // }

        // if (!map.getLayer('alighting-layer')) {
        //     map.addLayer({
        //         id: 'alighting-layer',
        //         type: 'circle',
        //         source: 'bus-flows',
        //         'source-layer': 'bus-flows',
        //         filter: ['==', ['get', 'type'], 'alighting'],
        //         paint: {
        //             'circle-radius': ['interpolate', ['linear'], ['get', 'count'], 0, 4, 100, 20],
        //             'circle-color': '#e74c3c',
        //             'circle-opacity': 0.6
        //         }
        //     });
        // }



        // hide everything else
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
            'agri-fill', 'agri-outline', 'agri-labels',
            'admin-fill', 'admin-line',
            'school-layer', 'medical-layer', 'tourist-layer', 'roadside-station',
            'facilities-circle'
        ].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
        });

    } else {
        // hide the transport layer
        TRANSPORT_LAYER_IDS.forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
        });

        ['agri-fill', 'agri-outline', 'agri-labels',
            'facilities-circle',
            'admin-fill', 'admin-line'].forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', 'none');
                }
            });

        // show mesh layers again

    }

    setTransportVisible(!transportVisible);

    map.once('idle', () => setIsLoading(false));
};


const BUS_STOP_LAYER_IDS = ['bus-stops'];

export const toggleBusStops = (
    map: mapboxgl.Map,
    busStopsLayerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setBusStopsLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'bus-stops';
    const tilesetUrl = 'mapbox://frame-ark.bus-stops';
    const sourceLayer = 'bus-stops';

    const beforeId = map.getLayer('transportation-line-hover') ? 'transportation-line-hover' : undefined;

    // const labelLayerId = map.getStyle().layers?.find(
    //     l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    // )?.id;

    if (!busStopsLayerVisible) {
        // Add vector source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'vector', url: tilesetUrl });
        }

        // Add circle layer
        if (!map.getLayer('bus-stops')) {
            map.addLayer({
                id: 'bus-stops',
                type: 'symbol',
                source: sourceId,
                'source-layer': sourceLayer,
                minzoom: 5,
                layout: {
                    'icon-image': 'bus',
                    'icon-size': 1,
                    'icon-allow-overlap': true,
                    'icon-anchor': 'bottom',
                    visibility: 'visible'
                }
            }, beforeId);




        } else {
            map.setLayoutProperty('bus-stops', 'visibility', 'visible');
        }

        // Hide all other relevant layers
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
            'agri-fill', 'agri-outline', 'agri-labels',
            'admin-fill', 'admin-line',
            'facilities-circle', 'medical-layer', 'school-layer'

        ].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

    } else {
        // Hide facility layer
        BUS_STOP_LAYER_IDS.forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });
        ['agri-fill', 'agri-outline', 'agri-labels',
            'admin-fill', 'admin-line'].forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', 'none');
                }
            });

        // Show mesh layers again
    }

    setBusStopsLayerVisible(!busStopsLayerVisible);

    map.once('idle', () => setIsLoading(false));
};