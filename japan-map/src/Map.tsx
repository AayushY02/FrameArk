import { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import type { ExpressionSpecification } from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MAP_STYLES = {
    Streets: 'mapbox://styles/mapbox/streets-v12',
    Light: 'mapbox://styles/mapbox/light-v11',
    Dark: 'mapbox://styles/mapbox/dark-v11',
    Satellite: 'mapbox://styles/mapbox/satellite-v9',
    Outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    Navigation: 'mapbox://styles/mapbox/navigation-day-v1'
};


const JAPAN_BOUNDS: mapboxgl.LngLatBoundsLike = [
    [122.93457, 20.42596],
    [153.98667, 45.55148]
];

export default function JapanMap() {
    const mapRef = useRef<Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const popupRef = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
    const [roadsVisible, setRoadsVisible] = useState(false);
    const [adminVisible, setAdminVisible] = useState(false);
    const [terrainEnabled, setTerrainEnabled] = useState(false);
    const [currentStyle, setCurrentStyle] = useState(MAP_STYLES.Streets);
    const [selectedMetric, setSelectedMetric] = useState('PTN_2020');
    const ROAD_LAYER_IDS = [
        'road', 'road-street', 'road-street-low', 'road-secondary-tertiary', 'road-primary',
        'road-trunk', 'road-motorway', 'road-rail', 'road-path', 'road-network'
    ];
    const selectedMetricRef = useRef(selectedMetric);

    // const generateColorExpressions = () => {
    //     const fillMatch: ExpressionSpecification = ['match', ['get', 'nam_ja']];
    //     const lineMatch: ExpressionSpecification = ['match', ['get', 'nam_ja']];
    //     fillMatch.push('#ccc');
    //     lineMatch.push('#333');
    //     return { fillMatch, lineMatch };
    // };


    const getColorExpression = (metric: string): ExpressionSpecification => {
        let field: any;
        let colorStops: (string | number)[];

        if (metric === 'ELDERLY_RATIO') {
            field = ['/', ['get', 'PTC_2020'], ['get', 'PTN_2020']];
            colorStops = [
                0, '#edf8e9',
                0.1, '#bae4b3',
                0.2, '#74c476',
                0.3, '#31a354',
                0.4, '#006d2c'
            ];
        } else if (metric === 'PTC_2020') { // Age 65+
            field = ['get', 'PTC_2020'];
            colorStops = [
                0, '#fff5eb',
                500, '#fd8d3c',
                1500, '#f16913',
                3000, '#d94801',
                5000, '#a63603'
            ];
        } else if (metric === 'PTA_2020') { // Age 0–14
            field = ['get', 'PTA_2020'];
            colorStops = [
                0, '#f7fbff',
                300, '#c6dbef',
                800, '#6baed6',
                1200, '#2171b5',
                2000, '#08306b'
            ];
        } else { // PTN_2020: Total population
            field = ['get', 'PTN_2020'];
            colorStops = [
                0, '#ffffcc',
                500, '#a1dab4',
                1500, '#41b6c4',
                3000, '#2c7fb8',
                5000, '#253494'
            ];
        }

        return ['interpolate', ['linear'], field, ...colorStops] as ExpressionSpecification;
    };

    const updateMetricStyles = () => {
        const map = mapRef.current;
        if (!map) return;

        const color = getColorExpression(selectedMetric);

        if (map.getLayer('mesh-1km-fill')) {
            map.setPaintProperty('mesh-1km-fill', 'fill-color', color);
        }
        if (map.getLayer('mesh-500m-fill')) {
            map.setPaintProperty('mesh-500m-fill', 'fill-color', color);
        }
    };

    const toggleRoads = () => {
        const map = mapRef.current;
        if (!map) return;
        const visibility = roadsVisible ? 'none' : 'visible';
        ROAD_LAYER_IDS.forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', visibility);
            }
        });
        setRoadsVisible(!roadsVisible);
    };

    const toggleAdminBoundaries = () => {
        const map = mapRef.current;
        if (!map) return;
        const visibility = adminVisible ? 'none' : 'visible';
        ['admin-fill', 'admin-line'].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', visibility);
            }
        });
        setAdminVisible(!adminVisible);
    };

    const toggleTerrain = () => {
        const map = mapRef.current;
        if (!map) return;
        if (!terrainEnabled) {
            map.addSource('mapbox-dem', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.terrain-rgb',
                tileSize: 512,
                maxzoom: 14
            });
            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
            map.addLayer({ id: 'hillshading', type: 'hillshade', source: 'mapbox-dem', layout: { visibility: 'visible' }, paint: {} });
        } else {
            map.setTerrain(null);
            if (map.getLayer('hillshading')) map.removeLayer('hillshading');
            if (map.getSource('mapbox-dem')) map.removeSource('mapbox-dem');
        }
        setTerrainEnabled(!terrainEnabled);
    };

    const fitBoundsToKashiwa = () => {
        const map = mapRef.current;
        if (!map) return;
        map.fitBounds([[139.935, 35.825], [140.05, 35.91]], { padding: 40, duration: 1000 });
    };

    const handleStyleChange = (styleUrl: string) => {
        const map = mapRef.current;
        if (!map) return;
        setCurrentStyle(styleUrl);
        map.setStyle(styleUrl);
    };

    const getLabelLayerId = (map: mapboxgl.Map): string | undefined => {
        const layers = map.getStyle().layers;
        if (!layers) return;

        const labelLayer = layers.find(l =>
            l.type === 'symbol' &&
            l.layout?.['text-field'] &&
            l.id.includes('place') // e.g. place-label, place-town, etc.
        );

        return labelLayer?.id;
    };

    useEffect(() => {
        updateMetricStyles();
    }, [selectedMetric]);

    useEffect(() => {
        selectedMetricRef.current = selectedMetric;
    }, [selectedMetric]);

    const addMeshLayers = (map: mapboxgl.Map) => {
        const labelLayerId = getLabelLayerId(map);
        if (!map.getSource('chiba-1km-mesh')) {
            map.addSource('chiba-1km-mesh', {
                type: 'geojson',
                data: '/data/12_chiba_1km_pop.geojson'
            });
        }
        map.addLayer({
            id: 'mesh-1km-fill',
            type: 'fill',
            source: 'chiba-1km-mesh',
            minzoom: 0,
            maxzoom: 12,
            paint: {
                // 'fill-color': [
                //     'interpolate', ['linear'], ['get', 'PTN_2020'],
                //     0, '#00FF00', 100, '#7FFF00', 300, '#ADFF2F',
                //     600, '#FFFF00', 1000, '#FFD700', 1500, '#FFA500',
                //     2000, '#FF8C00', 2500, '#FF4500', 3000, '#FF0000',
                //     4000, '#B22222', 5000, '#8B0000'
                // ],
                'fill-color': getColorExpression(selectedMetric),
                'fill-opacity': 0.6
            }
        }, labelLayerId);
        map.addLayer({
            id: 'mesh-1km-outline',
            type: 'line',
            source: 'chiba-1km-mesh',
            minzoom: 0,
            maxzoom: 12,
            paint: { 'line-color': '#ff9900', 'line-width': 1 }
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
            minzoom: 12,
            maxzoom: 13.5,
            paint: { 'line-color': '#0099cc', 'line-width': 0.75 }
        }, labelLayerId);

        map.addLayer({
            id: 'mesh-500m-fill',
            type: 'fill',
            source: 'chiba-500m-mesh',
            minzoom: 12,
            maxzoom: 13.5,
            paint: {
                // 'fill-color': [
                //     'interpolate', ['linear'], ['get', 'PTN_2020'],
                //     0, '#00FF00', 100, '#7FFF00', 300, '#ADFF2F',
                //     600, '#FFFF00', 1000, '#FFD700', 1500, '#FFA500',
                //     2000, '#FF8C00', 2500, '#FF4500', 3000, '#FF0000',
                //     4000, '#B22222', 5000, '#8B0000'
                // ],
                'fill-color': getColorExpression(selectedMetric),
                'fill-opacity': 0.6
            }
        }, labelLayerId);

        if (!map.getSource('chiba-250m-mesh')) {
            map.addSource('chiba-250m-mesh', {
                type: 'geojson',
                data: '/data/12_chiba_250m.geojson'
            });
        }
        map.addLayer({
            id: 'mesh-250m-fill',
            type: 'fill',
            source: 'chiba-250m-mesh',
            minzoom: 13.5,
            paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 }
        }, labelLayerId);
        map.addLayer({
            id: 'mesh-250m-outline',
            type: 'line',
            source: 'chiba-250m-mesh',
            minzoom: 13.5,
            paint: { 'line-color': '#000000', 'line-width': 0.5 }
        });
        map.addSource('admin-tiles', {
            type: 'vector',
            url: 'mapbox://frame-ark.5l5v468c' // replace with your own vector tileset if different
        });

        map.addLayer({
            id: 'admin-fill',
            type: 'fill',
            source: 'admin-tiles',
            'source-layer': 'japan-2ix0gj', // replace with your actual source-layer name
            layout: { visibility: 'none' }, // keep off initially
            paint: {
                'fill-color': '#cccccc',
                'fill-opacity': 0.4
            }
        }, labelLayerId);

        map.addLayer({
            id: 'admin-line',
            type: 'line',
            source: 'admin-tiles',
            'source-layer': 'japan-2ix0gj',
            layout: { visibility: 'none' },
            paint: {
                'line-color': '#444444',
                'line-width': 1.2
            }
        }, labelLayerId);
    };

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: currentStyle,
            center: [139.6917, 35.6895],
            zoom: 5.5,
            minZoom: 4.5,
            maxZoom: 18,
            maxBounds: JAPAN_BOUNDS
        });
        mapRef.current = map;

        map.on('load', () => {
            map.getStyle().layers?.forEach(layer => {
                if (layer.type === 'symbol' && ['poi-label', 'road-label', 'waterway-label'].some(id => layer.id.startsWith(id))) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });
            addMeshLayers(map);
        });

        map.on('style.load', () => {
            addMeshLayers(map);
        });

        map.on('mousemove', 'mesh-1km-fill', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const metric = selectedMetricRef.current;

                const value = metric === 'ELDERLY_RATIO'
                    ? ((feature.properties?.PTC_2020 / feature.properties?.PTN_2020) * 100).toFixed(1) + '%'
                    : feature.properties?.[metric] ?? 'N/A';

                const label = {
                    PTN_2020: 'Total Population (2020)',
                    PTA_2020: 'Age 0–14 (2020)',
                    PTC_2020: 'Age 65+ (2020)',
                    ELDERLY_RATIO: 'Elderly Ratio (65+ / Total)'
                }[metric];

                popupRef
                    .setLngLat(e.lngLat)
                    .setHTML(`<strong>${label}:</strong> ${value}`)
                    .addTo(map);
            }
        });
        map.on('mousemove', 'mesh-500m-fill', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const metric = selectedMetricRef.current;

                const value = metric === 'ELDERLY_RATIO'
                    ? ((feature.properties?.PTC_2020 / feature.properties?.PTN_2020) * 100).toFixed(1) + '%'
                    : feature.properties?.[metric] ?? 'N/A';

                const label = {
                    PTN_2020: 'Total Population (2020)',
                    PTA_2020: 'Age 0–14 (2020)',
                    PTC_2020: 'Age 65+ (2020)',
                    ELDERLY_RATIO: 'Elderly Ratio (65+ / Total)'
                }[metric];

                popupRef
                    .setLngLat(e.lngLat)
                    .setHTML(`<strong>${label}:</strong> ${value}`)
                    .addTo(map);
            }
        });
        map.on('mouseleave', 'mesh-1km-fill', () => {
            map.getCanvas().style.cursor = '';
            popupRef.remove();
        });
        map.on('mouseleave', 'mesh-500m-fill', () => {
            map.getCanvas().style.cursor = '';
            popupRef.remove();
        });
    }, []);

    return (
        <div className="relative w-screen h-screen">
            <div className="absolute right-2 top-2 z-10  flex flex-col items-center justify-center space-y-2 w-fit">
                <select
                    value={currentStyle}
                    onChange={(e) => handleStyleChange(e.target.value)}
                    className="block w-full px-4 py-2 text-sm bg-white rounded-full text-black shadow-2xl border border-gray-200"
                >
                    {Object.entries(MAP_STYLES).map(([label, url]) => (
                        <option key={url} value={url}>{label}</option>
                    ))}
                </select>

                <button onClick={toggleRoads} className="w-full px-4 py-2 text-[#f2f2f2] bg-black hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-full border border-gray-800">
                    {roadsVisible ? 'Hide 道路' : 'Show 道路'}
                </button>
                <button onClick={toggleAdminBoundaries} className="w-full px-4 py-2 text-[#f2f2f2] bg-black hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-full border border-gray-800">
                    {adminVisible ? 'Hide 行政界' : 'Show 行政界'}
                </button>
                <button onClick={toggleTerrain} className="w-full px-4 py-2 text-[#f2f2f2] bg-black hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-full border border-gray-800">
                    {terrainEnabled ? 'Hide 地形' : 'Show 地形'}
                </button>
                <button onClick={fitBoundsToKashiwa} className="w-full px-4 py-2 text-[#f2f2f2] bg-black hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-full border border-gray-800">
                    Focus 柏市
                </button>

                <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="block w-full px-4 py-2 text-sm bg-white rounded-full text-black shadow-2xl border border-gray-200"
                >
                    <option value="PTN_2020">Total Population</option>
                    <option value="PTC_2020">Age 65+</option>
                    <option value="PTA_2020">Age 0–14</option>
                    <option value="ELDERLY_RATIO">Elderly Ratio</option>
                </select>
            </div>
            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}
