// layers/meshLayers.ts
import { getColorExpression } from '@/utils/expressions';

export const addMeshLayers = (map: maplibregl.Map, metric: string) => {
    const getLabelLayerId = (map: maplibregl.Map): string | undefined => {
        const layers = map.getStyle().layers;
        if (!layers) return;

        const labelLayer = layers.find(l =>
            l.type === 'symbol' &&
            l.layout?.['text-field'] &&
            l.id.includes('place')
        );

        return labelLayer?.id;
    };

    const labelLayerId = getLabelLayerId(map);

    if (!map.getSource('chiba-1km-mesh')) {
        
        map.addSource('chiba-1km-mesh', {
            // type: 'geojson',
            // data: '/data/12_chiba_1km_pop.geojson'

            type: "vector",
            tiles: ["http://localhost:9000/data/12_chiba_1km_pop/{z}/{x}/{y}.pbf"]
        });
    }

    map.addLayer({
        id: 'mesh-1km-fill',
        type: 'fill',
        source: 'chiba-1km-mesh',
        "source-layer": "12_chiba_1km_pop",
        minzoom: 0,
        maxzoom: 12,
        paint: {
            'fill-color': getColorExpression(metric),
            'fill-opacity': 0.6
        }
    }, labelLayerId);

    map.addLayer({
        id: 'mesh-1km-outline',
        type: 'line',
        source: 'chiba-1km-mesh',
        // "source-layer" : "L_12_chiba_1km_pop",
        "source-layer": "12_chiba_1km_pop",

        minzoom: 0,
        maxzoom: 12,
        paint: { 'line-color': '#0099cc', 'line-width': 0.75 }
    }, labelLayerId);

    if (!map.getSource('chiba-500m-mesh')) {
        map.addSource('chiba-500m-mesh', {
            type: 'geojson',
            data: '/data/12_chiba_500m_pop.geojson'
        });
    }

    map.addLayer({
        id: 'mesh-500m-outline',
        type: 'line',
        source: 'chiba-500m-mesh',
        // "source-layer": "mesh-500",
        minzoom: 12,
        maxzoom: 13.5,
        paint: { 'line-color': '#0099cc', 'line-width': 0.75 }
    }, labelLayerId);

    map.addLayer({
        id: 'mesh-500m-fill',
        type: 'fill',
        source: 'chiba-500m-mesh',
        // "source-layer": "mesh-500",
        minzoom: 12,
        maxzoom: 13.5,
        paint: {
            'fill-color': getColorExpression(metric),
            'fill-opacity': 0.6
        }
    }, labelLayerId);

    // if (!map.getSource('chiba-250m-mesh')) {
    //     map.addSource('chiba-250m-mesh', {
    //         type: 'geojson',
    //         data: '/data/12_chiba_250m_pop.geojson'
    //     });
    // }

    // map.addLayer({
    //     id: 'mesh-250m-fill',
    //     type: 'fill',
    //     source: 'chiba-250m-mesh',
    //     // "source-layer": "mesh-250",
    //     minzoom: 13.5,
    //     paint: {
    //         'fill-color': getColorExpression(metric),
    //         'fill-opacity': 0.6
    //     }
    // }, labelLayerId);

    // map.addLayer({
    //     id: 'mesh-250m-outline',
    //     type: 'line',
    //     source: 'chiba-250m-mesh',
    //     // "source-layer": "mesh-250",
    //     minzoom: 13.5,
    //     paint: { 'line-color': '#0099cc', 'line-width': 0.75 }
    // });

    // map.addSource('admin-tiles', {
    //     type: 'vector',
    //     url: 'mapbox://frame-ark.5l5v468c'
    // });

    // map.addLayer({
    //     id: 'admin-fill',
    //     type: 'fill',
    //     source: 'admin-tiles',
    //     'source-layer': 'japan-2ix0gj',
    //     layout: { visibility: 'none' },
    //     paint: {
    //         'fill-color': '#cccccc',
    //         'fill-opacity': 0.4
    //     }
    // }, labelLayerId);

    // map.addLayer({
    //     id: 'admin-line',
    //     type: 'line',
    //     source: 'admin-tiles',
    //     'source-layer': 'japan-2ix0gj',
    //     layout: { visibility: 'none' },
    //     paint: {
    //         'line-color': '#444444',
    //         'line-width': 1.2
    //     }
    // }, labelLayerId);


};
