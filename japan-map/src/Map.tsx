import { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map, type ExpressionSpecification } from 'mapbox-gl';
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
    [122.93457, 20.42596], // SW corner
    [153.98667, 45.55148]  // NE corner
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
        'road', 'road-street', 'road-street-low',
        'road-secondary-tertiary', 'road-primary', 'road-trunk',
        'road-motorway', 'road-rail', 'road-path', 'road-network'
    ];

    // Prefectures
    const prefectureNames = [
        '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
        '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
        '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
        '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県',
        '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
        '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
        '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
    ];

    const generateColorExpressions = () => {
        const fillMatch: ExpressionSpecification = ['match', ['get', 'nam_ja']];
        const lineMatch: ExpressionSpecification = ['match', ['get', 'nam_ja']];
        prefectureNames.forEach(name => {
            fillMatch.push(name, `hsl(${Math.random() * 360}, 60%, 70%)`);
            lineMatch.push(name, `hsl(${Math.random() * 360}, 50%, 40%)`);
        });
        fillMatch.push('#ccc');
        lineMatch.push('#333');
        return { fillMatch, lineMatch };
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

            map.addLayer({
                id: 'hillshading',
                type: 'hillshade',
                source: 'mapbox-dem',
                layout: { visibility: 'visible' },
                paint: {}
            });
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

        const kashiwaBounds: mapboxgl.LngLatBoundsLike = [
            [139.935, 35.825], // Southwest corner
            [140.05, 35.91]    // Northeast corner
        ];

        map.fitBounds(kashiwaBounds, {
            padding: 40,
            duration: 1000
        });
    };

    const handleStyleChange = (styleUrl: string) => {
        const map = mapRef.current;
        if (!map) return;
        setCurrentStyle(styleUrl);
        map.setStyle(styleUrl);
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
            // Hide noisy labels but keep place names
            map.getStyle().layers?.forEach(layer => {
                if (
                    layer.type === 'symbol' &&
                    ['poi-label', 'road-label', 'waterway-label'].some(id => layer.id.startsWith(id))
                ) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });

            // Prefecture layer
            map.addSource('admin-tiles', {
                type: 'vector',
                url: 'mapbox://frame-ark.5l5v468c'
            });

            const { fillMatch, lineMatch } = generateColorExpressions();

            map.addLayer({
                id: 'admin-fill',
                type: 'fill',
                source: 'admin-tiles',
                'source-layer': 'japan-2ix0gj',
                layout: { visibility: 'none' },
                paint: {
                    'fill-color': fillMatch,
                    'fill-opacity': 0.6
                }
            });

            map.addLayer({
                id: 'admin-line',
                type: 'line',
                source: 'admin-tiles',
                'source-layer': 'japan-2ix0gj',
                layout: { visibility: 'none' },
                paint: {
                    'line-color': lineMatch,
                    'line-width': 1.5
                }
            });

            // Mesh sources
            map.addSource('chiba-1km-mesh', {
                type: 'geojson',
                data: '/data/12_chiba_1km_pop.geojson'
            });

            map.addSource('chiba-500m-mesh', {
                type: 'geojson',
                data: '/data/12_chiba_500m.geojson'
            });

            map.addSource('chiba-250m-mesh', {
                type: 'geojson',
                data: '/data/12_chiba_250m.geojson'
            });

            // 1km Mesh Layer (zoom 0–12)
            map.addLayer({
                id: 'mesh-1km-outline',
                type: 'line',
                source: 'chiba-1km-mesh',
                minzoom: 0,
                maxzoom: 12,
                paint: {
                    'line-color': '#ff9900',
                    'line-width': 1
                }
            });

            map.addLayer({
                id: 'mesh-1km-fill',
                type: 'fill',
                source: 'chiba-1km-mesh',
                minzoom: 0,
                maxzoom: 12,
                paint: {
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'PTN_2020'],
                        0, '#00FF00',   // bright green (very low pop)
                        100, '#7FFF00',   // chartreuse
                        300, '#ADFF2F',   // green-yellow
                        600, '#FFFF00',   // yellow
                        1000, '#FFD700',   // golden yellow
                        1500, '#FFA500',   // orange
                        2000, '#FF8C00',   // dark orange
                        2500, '#FF4500',   // orange-red
                        3000, '#FF0000',   // red
                        4000, '#B22222',   // firebrick
                        5000, '#8B0000'    // dark red (very high pop)
                    ],
                    'fill-opacity': 0.6
                }
            });

            // 500m Mesh Layer (zoom 12–13.5)
            map.addLayer({
                id: 'mesh-500m-outline',
                type: 'line',
                source: 'chiba-500m-mesh',
                minzoom: 12,
                maxzoom: 13.5,
                paint: {
                    'line-color': '#0099cc',
                    'line-width': 0.75
                }
            });

            // 250m Mesh Layer (zoom 13.5+)
            map.addLayer({
                id: 'mesh-250m-fill',
                type: 'fill',
                source: 'chiba-250m-mesh',
                minzoom: 13.5,
                paint: {
                    'fill-color': '#ffffff',
                    'fill-opacity': 0
                }
            });

            map.addLayer({
                id: 'mesh-250m-outline',
                type: 'line',
                source: 'chiba-250m-mesh',
                minzoom: 13.5,
                paint: {
                    'line-color': '#000000',
                    'line-width': 0.5
                }
            });

            // Interaction: click on 250m mesh
            map.on('click', 'mesh-250m-fill', (e) => {
                const lngLat = e.lngLat;
                new mapboxgl.Popup()
                    .setLngLat(lngLat)
                    .setHTML(`<strong>Mesh Cell</strong><br/>Lng: ${lngLat.lng.toFixed(6)}<br/>Lat: ${lngLat.lat.toFixed(6)}`)
                    .addTo(map);
            });

            map.on('mouseenter', 'mesh-250m-fill', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'mesh-250m-fill', () => {
                map.getCanvas().style.cursor = '';
            });

            // Center on Kashiwa
            map.flyTo({
                center: [139.9825, 35.8675],
                zoom: 12
            });
        });

        map.on('style.load', () => {
            // Restore layer visibility after style change
            ROAD_LAYER_IDS.forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', roadsVisible ? 'visible' : 'none');
                }
            });

            ['admin-fill', 'admin-line'].forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', adminVisible ? 'visible' : 'none');
                }
            });

            map.getStyle().layers?.forEach(layer => {
                if (
                    layer.type === 'symbol' &&
                    ['poi-label', 'road-label', 'waterway-label'].some(id => layer.id.startsWith(id))
                ) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });
        });

        map.on('mousemove', 'mesh-1km-fill', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const pop = feature.properties?.PTN_2020 ?? 'N/A';
                popupRef.setLngLat(e.lngLat)
                    .setHTML(`<strong>Population (2020):</strong> ${pop}`)
                    .addTo(map);
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
                <button
                    onClick={fitBoundsToKashiwa}
                    className="w-full px-4 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                    Focus 柏市 (Kashiwa)
                </button>
            </div>

            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}
