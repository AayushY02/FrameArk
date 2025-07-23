import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MAP_STYLES = {
    Streets: 'mapbox://styles/mapbox/streets-v12',
    Light: 'mapbox://styles/mapbox/light-v11',
    Dark: 'mapbox://styles/mapbox/dark-v11',
    Satellite: 'mapbox://styles/mapbox/satellite-v9',
    Outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    Navigation: 'mapbox://styles/mapbox/navigation-day-v1',
};

function Map() {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [roadsVisible, setRoadsVisible] = useState(false);
    const [adminVisible, setAdminVisible] = useState(false);
    const [currentStyle, setCurrentStyle] = useState(MAP_STYLES.Streets);

    const ROAD_LAYER_IDS = [
        'road',
        'road-street',
        'road-street-low',
        'road-secondary-tertiary',
        'road-primary',
        'road-trunk',
        'road-motorway',
        'road-rail',
        'road-path',
        'road-network',
    ];

    const bounds: mapboxgl.LngLatBoundsLike = [
        [122.93457, 20.42596],
        [153.98667, 45.55148],
    ];

    const JAPANESE_PREFECTURES = [
        '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
        '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
        '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
        '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県',
        '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
        '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
        '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
    ];

    const fillMatch: mapboxgl.ExpressionSpecification = ['match', ['get', 'nam_ja']];
    const lineMatch: mapboxgl.ExpressionSpecification = ['match', ['get', 'nam_ja']];

    JAPANESE_PREFECTURES.forEach(name => {
        fillMatch.push(name, `hsl(${Math.random() * 360}, 70%, 75%)`);
        lineMatch.push(name, `hsl(${Math.random() * 360}, 60%, 35%)`);
    });

    fillMatch.push('#ccc'); // fallback
    lineMatch.push('#444'); // fallback

    const handleStyleChange = (styleUrl: string) => {
        const map = mapRef.current;
        if (!map) return;
        setCurrentStyle(styleUrl);
        map.setStyle(styleUrl);
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

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: currentStyle,
            center: [139.6917, 35.6895],
            zoom: 5.5,
            minZoom: 4.5,
            maxZoom: 18,
            maxBounds: bounds,
        });

        mapRef.current = map;

        map.on('load', () => {

            map.addSource('admin-tiles', {
                type: 'vector',
                url: 'mapbox://frame-ark.5l5v468c',
            });

            map.addLayer({
                id: 'admin-fill',
                type: 'fill',
                source: 'admin-tiles',
                'source-layer': 'japan-2ix0gj',
                layout: { visibility: 'none' },
                paint: {
                    'fill-color': fillMatch,
                    'fill-opacity': 0.4,
                },
            });

            map.addLayer({
                id: 'admin-line',
                type: 'line',
                source: 'admin-tiles',
                'source-layer': 'japan-2ix0gj',
                layout: { visibility: 'none' },
                paint: {
                    'line-color': lineMatch,
                    'line-width': 1.5,
                },
            });
        });

        map.on('style.load', () => {
            if (!map.getSource('admin-tiles')) {
                map.addSource('admin-tiles', {
                    type: 'vector',
                    url: 'mapbox://frame-ark.5l5v468c',
                });
            }

            if (!map.getLayer('admin-fill')) {
                map.addLayer({
                    id: 'admin-fill',
                    type: 'fill',
                    source: 'admin-tiles',
                    'source-layer': 'japan-2ix0gj',
                    layout: { visibility: adminVisible ? 'visible' : 'none' },
                    paint: {
                        'fill-color': fillMatch,
                        'fill-opacity': 0.4,
                    },
                });
            }

            if (!map.getLayer('admin-line')) {
                map.addLayer({
                    id: 'admin-line',
                    type: 'line',
                    source: 'admin-tiles',
                    'source-layer': 'japan-2ix0gj',
                    layout: { visibility: adminVisible ? 'visible' : 'none' },
                    paint: {
                        'line-color': lineMatch,
                        'line-width': 1.5,
                    },
                });
            }

            map.getStyle().layers?.forEach(layer => {
                const hideLayers = [
                    'poi-label', // optional
                    'road-label', // optional
                    'waterway-label' // optional
                ];

                if (layer.type === 'symbol' && hideLayers.some(prefix => layer.id.startsWith(prefix))) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });

            ROAD_LAYER_IDS.forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', roadsVisible ? 'visible' : 'none');
                }
            });
        });
    }, []);

    return (
        <div className="relative w-screen h-screen">
            <div className="absolute top-4 left-4 z-10 space-y-2">
                <select
                    onChange={(e) => handleStyleChange(e.target.value)}
                    className="px-2 py-1 text-sm rounded bg-white border shadow"
                    value={currentStyle}
                >
                    {Object.entries(MAP_STYLES).map(([label, url]) => (
                        <option key={url} value={url}>
                            {label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={toggleRoads}
                    className="block w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm shadow"
                >
                    {roadsVisible ? 'Hide 道路' : 'Show 道路'}
                </button>

                <button
                    onClick={toggleAdminBoundaries}
                    className="block w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm shadow"
                >
                    {adminVisible ? 'Hide 行政界' : 'Show 行政界'}
                </button>
            </div>

            <div id="map-container" ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}

export default Map;
