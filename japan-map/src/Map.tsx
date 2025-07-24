import { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

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

    const ROAD_LAYER_IDS = [
        'road', 'road-street', 'road-street-low', 'road-secondary-tertiary', 'road-primary',
        'road-trunk', 'road-motorway', 'road-rail', 'road-path', 'road-network'
    ];

    // const generateColorExpressions = () => {
    //     const fillMatch: ExpressionSpecification = ['match', ['get', 'nam_ja']];
    //     const lineMatch: ExpressionSpecification = ['match', ['get', 'nam_ja']];
    //     fillMatch.push('#ccc');
    //     lineMatch.push('#333');
    //     return { fillMatch, lineMatch };
    // };

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

    const addMeshLayers = (map: mapboxgl.Map) => {
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
                'fill-color': [
                    'interpolate', ['linear'], ['get', 'PTN_2020'],
                    0, '#00FF00', 100, '#7FFF00', 300, '#ADFF2F',
                    600, '#FFFF00', 1000, '#FFD700', 1500, '#FFA500',
                    2000, '#FF8C00', 2500, '#FF4500', 3000, '#FF0000',
                    4000, '#B22222', 5000, '#8B0000'
                ],
                'fill-opacity': 0.6
            }
        });
        map.addLayer({
            id: 'mesh-1km-outline',
            type: 'line',
            source: 'chiba-1km-mesh',
            minzoom: 0,
            maxzoom: 12,
            paint: { 'line-color': '#ff9900', 'line-width': 1 }
        });

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
        });

        map.addLayer({
            id: 'mesh-500m-fill',
            type: 'fill',
            source: 'chiba-500m-mesh',
            minzoom: 12,
            maxzoom: 13.5,
            paint: {
                'fill-color': [
                    'interpolate', ['linear'], ['get', 'PTN_2020'],
                    0, '#00FF00', 100, '#7FFF00', 300, '#ADFF2F',
                    600, '#FFFF00', 1000, '#FFD700', 1500, '#FFA500',
                    2000, '#FF8C00', 2500, '#FF4500', 3000, '#FF0000',
                    4000, '#B22222', 5000, '#8B0000'
                ],
                'fill-opacity': 0.6
            }
        });

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
        });
        map.addLayer({
            id: 'mesh-250m-outline',
            type: 'line',
            source: 'chiba-250m-mesh',
            minzoom: 13.5,
            paint: { 'line-color': '#000000', 'line-width': 0.5 }
        });
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
                const pop = feature.properties?.PTN_2020 ?? 'N/A';
                popupRef.setLngLat(e.lngLat).setHTML(`<strong>Population (2020):</strong> ${pop}`).addTo(map);
            }
        });
        map.on('mouseleave', 'mesh-1km-fill', () => {
            map.getCanvas().style.cursor = '';
            popupRef.remove();
        });
    }, []);

    return (
        <div className="relative w-screen h-screen">
            <div className="absolute top-4 left-4 z-10 space-y-2 bg-white p-2 rounded shadow">
                <select
                    value={currentStyle}
                    onChange={(e) => handleStyleChange(e.target.value)}
                    className="block w-full mb-2 border rounded px-2 py-1 text-sm"
                >
                    {Object.entries(MAP_STYLES).map(([label, url]) => (
                        <option key={url} value={url}>{label}</option>
                    ))}
                </select>

                <button onClick={toggleRoads} className="w-full px-4 py-1 bg-sky-600 text-white text-sm rounded hover:bg-sky-700">
                    {roadsVisible ? 'Hide 道路' : 'Show 道路'}
                </button>
                <button onClick={toggleAdminBoundaries} className="w-full px-4 py-1 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700">
                    {adminVisible ? 'Hide 行政界' : 'Show 行政界'}
                </button>
                <button onClick={toggleTerrain} className="w-full px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    {terrainEnabled ? 'Hide 地形' : 'Show 地形'}
                </button>
                <button onClick={fitBoundsToKashiwa} className="w-full px-4 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                    Focus 柏市 (Kashiwa)
                </button>
            </div>
            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}
