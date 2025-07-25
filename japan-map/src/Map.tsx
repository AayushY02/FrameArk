import { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import type { ExpressionSpecification } from 'mapbox-gl';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Grid } from 'ldrs/react'
import 'ldrs/react/Grid.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MAP_STYLES = {
    ストリート: 'mapbox://styles/mapbox/streets-v12',
    ライト: 'mapbox://styles/mapbox/light-v11',
    ダーク: 'mapbox://styles/mapbox/dark-v11',
    衛星写真: 'mapbox://styles/mapbox/satellite-v9',
    アウトドア: 'mapbox://styles/mapbox/outdoors-v12',
    ナビゲーション: 'mapbox://styles/mapbox/navigation-day-v1'
};

const getGradientLegendForMetric = (metric: string) => {
    if (metric === 'ELDERLY_RATIO') {
        return {
            title: '高齢者比率（65歳以上／総人口）',
            gradient: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
            labels: ['<10%', '20%', '30%', '40%', '>40%']
        };
    } else if (metric === 'PTC_2020') {
        return {
            title: '65歳以上の人口（2020年）',
            gradient: ['#fff5eb', '#fd8d3c', '#f16913', '#d94801', '#a63603'],
            labels: ['<500', '1500', '3000', '5000', '>5000']
        };
    } else if (metric === 'PTA_2020') {
        return {
            title: '0〜14歳の人口（2020年）',
            gradient: ['#f7fbff', '#c6dbef', '#6baed6', '#2171b5', '#08306b'],
            labels: ['<300', '800', '1200', '2000', '>2000']
        };
    } else {
        return {
            title: '総人口（2020年）',
            gradient: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
            labels: ['<500', '1500', '3000', '5000', '>5000']
        };
    }
};


const JAPAN_BOUNDS: mapboxgl.LngLatBoundsLike = [
    [122.93457, 20.42596],
    [153.98667, 45.55148]
];

const CHIBA_BOUNDS: mapboxgl.LngLatBoundsLike = [
    [139.544, 34.856],  // south-west corner of Chiba
    [140.974, 35.898]   // north-east corner of Chiba
];

export default function JapanMap() {
    const mapRef = useRef<Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const popupRef = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
    const [roadsVisible, setRoadsVisible] = useState(false);
    const [adminVisible, setAdminVisible] = useState(false);
    const [terrainEnabled, setTerrainEnabled] = useState(false);
    const [currentStyle, setCurrentStyle] = useState(MAP_STYLES.ストリート);
    const [selectedMetric, setSelectedMetric] = useState('PTN_2020');
    const [isLoading, setIsLoading] = useState(true);
    const ROAD_LAYER_IDS = [
        'road', 'road-street', 'road-street-low', 'road-secondary-tertiary', 'road-primary',
        'road-trunk', 'road-motorway', 'road-rail', 'road-path', 'road-network'
    ];
    const selectedMetricRef = useRef(selectedMetric);
    const [agriLayerVisible, setAgriLayerVisible] = useState(false);


    // const generateColorExpressions = () => {
    //     const fillMatch: ExpressionSpecification = ['match', ['get', 'nam_ja']];
    //     const lineMatch: ExpressionSpecification = ['match', ['get', 'nam_ja']];
    //     fillMatch.push('#ccc');
    //     lineMatch.push('#333');
    //     return { fillMatch, lineMatch };
    // };

    const toggleAgriLayer = () => {
        setIsLoading(true);
        const map = mapRef.current;
        if (!map) return;

        if (!agriLayerVisible) {
            if (!map.getSource('kashiwa-agri')) {
                map.addSource('kashiwa-agri', {
                    type: 'geojson',
                    data: '/data/kashiwa_agricultural_land.geojson'
                });
            }

            if (!map.getLayer('agri-fill')) {
                map.addLayer({
                    id: 'agri-fill',
                    type: 'fill',
                    source: 'kashiwa-agri',
                    paint: {
                        'fill-color': [
                            'match',
                            ['get', 'KOUCHI'],
                            '畑', '#8bc34a',
                            '田', '#4caf50',
                            '樹園地', '#aed581',
                            'その他', '#c8e6c9',
                            '#e0e0e0' // fallback
                        ],
                        'fill-opacity': 0.6
                    }
                });
            }

            if (!map.getLayer('agri-outline')) {
                map.addLayer({
                    id: 'agri-outline',
                    type: 'line',
                    source: 'kashiwa-agri',
                    paint: {
                        'line-color': '#2e7d32',
                        'line-width': 1
                    }
                });
            }

            if (!map.getLayer('agri-labels')) {
                map.addLayer({
                    id: 'agri-labels',
                    type: 'symbol',
                    source: 'kashiwa-agri',
                    layout: {
                        'text-field': ['get', 'KOUCHI'],
                        'text-size': 11,
                        'text-anchor': 'center'
                    },
                    paint: {
                        'text-color': '#1b5e20',
                        'text-halo-color': '#ffffff',
                        'text-halo-width': 1
                    }
                });
            }

            // Hide other layers
            const layersToHide = [
                'mesh-1km-fill', 'mesh-1km-outline',
                'mesh-500m-fill', 'mesh-500m-outline',
                'mesh-250m-fill', 'mesh-250m-outline',
                'admin-fill', 'admin-line'
            ];
            layersToHide.forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', 'none');
                }
            });

        } else {
            // Remove agri layers
            ['agri-fill', 'agri-outline', 'agri-labels'].forEach(id => {
                if (map.getLayer(id)) map.removeLayer(id);
            });
            if (map.getSource('kashiwa-agri')) {
                map.removeSource('kashiwa-agri');
            }

            // Show other layers again
            const layersToShow = [
                'mesh-1km-fill', 'mesh-1km-outline',
                'mesh-500m-fill', 'mesh-500m-outline',
                'mesh-250m-fill', 'mesh-250m-outline',
            ];
            layersToShow.forEach(id => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', 'visible');
                }
            });
        }

        setAgriLayerVisible(!agriLayerVisible);
        map.once('idle', () => {
            setIsLoading(false);
        });
    };



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

        if (map.getLayer('mesh-1km-outline')) {
            map.setPaintProperty('mesh-1km-outline', 'line-color', color);
        }
        if (map.getLayer('mesh-500m-outline')) {
            map.setPaintProperty('mesh-500m-outline', 'line-color', color);
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
        setIsLoading(true);
        setCurrentStyle(styleUrl);
        map.setStyle(styleUrl);
        setSelectedMetric('PTN_2020');
        setTerrainEnabled(false);
        setAgriLayerVisible(false)

        map.once('style.load', () => {
            addMeshLayers(map, selectedMetric);
            updateMetricStyles();  // <-- Ensures styles are applied for new base layer
        });
        map.once('idle', () => setIsLoading(false));
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
        const map = mapRef.current;
        setIsLoading(true);
        updateMetricStyles();
        if (map) {
            // wait until map finishes rendering
            map.once('idle', () => {
                setIsLoading(false);
            });
        }
    }, [selectedMetric]);

    useEffect(() => {
        selectedMetricRef.current = selectedMetric;
    }, [selectedMetric]);

    const addMeshLayers = (map: mapboxgl.Map, metric: string) => {
        const labelLayerId = getLabelLayerId(map);
        if (!map.getSource('chiba-1km-mesh')) {
            map.addSource('chiba-1km-mesh', {
                type: 'geojson',
                data: '/data/12_chiba_1km_pop.geojson'
            });
        }

        // if (!map.getSource('mapbox-dem')) {
        //     map.addSource('mapbox-dem', {
        //         type: 'raster-dem',
        //         url: 'mapbox://mapbox.terrain-rgb',
        //         tileSize: 512,
        //         maxzoom: 14
        //     });
        // }

        // map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        // map.addLayer({
        //     id: 'hillshading',
        //     type: 'hillshade',
        //     source: 'mapbox-dem',
        //     layout: { visibility: 'visible' },
        //     paint: {}
        // });
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
                'fill-color': getColorExpression(metric),
                'fill-opacity': 0.6
            }
        }, labelLayerId);
        map.addLayer({
            id: 'mesh-1km-outline',
            type: 'line',
            source: 'chiba-1km-mesh',
            minzoom: 0,
            maxzoom: 12,
            paint: { 'line-color': '#0099cc', 'line-width': 1 }
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
                'fill-color': getColorExpression(metric),
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
        setIsLoading(true);
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: currentStyle,
            center: [139.9797, 35.8676],
            zoom: 5.5,
            minZoom: 4.5,
            maxZoom: 18,
            maxBounds: JAPAN_BOUNDS
        });
        mapRef.current = map;

        map.on('load', () => {

            map.flyTo({
                center: [139.9797, 35.8676], // 📍 Kashiwa
                zoom: 10,
                speed: 1.2,
                curve: 1,
                essential: true
            });

            map.once('idle', () => setIsLoading(false));

            map.once('moveend', () => {
                map.setMaxBounds(CHIBA_BOUNDS);
            });

            map.getStyle().layers?.forEach(layer => {
                if (layer.type === 'symbol' && ['poi-label', 'road-label', 'waterway-label'].some(id => layer.id.startsWith(id))) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });
            addMeshLayers(map, selectedMetric);

            // map.addLayer({
            //     id: '3d-buildings',
            //     source: 'composite',
            //     'source-layer': 'building',
            //     filter: ['==', 'extrude', 'true'],
            //     type: 'fill-extrusion',
            //     minzoom: 15,
            //     paint: {
            //         'fill-extrusion-color': '#aaa',
            //         'fill-extrusion-height': ['get', 'height'],
            //         'fill-extrusion-base': ['get', 'min_height'],
            //         'fill-extrusion-opacity': 0.6
            //     }
            // });
        });



        map.on('style.load', () => {
            addMeshLayers(map, selectedMetric);
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
                    PTN_2020: '総人口（2020年）',
                    PTA_2020: '0〜14歳の人口（2020年）',
                    PTC_2020: '65歳以上の人口（2020年）',
                    ELDERLY_RATIO: '高齢者比率（65歳以上／総人口）'
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
                    PTN_2020: '総人口（2020年）',
                    PTA_2020: '0〜14歳の人口（2020年）',
                    PTC_2020: '65歳以上の人口（2020年）',
                    ELDERLY_RATIO: '高齢者比率（65歳以上／総人口）'
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

        map.on('mousemove', 'agri-fill', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    popupRef
                        .setLngLat(e.lngLat)
                        .setHTML(`
        <strong>Type:</strong> ${props.KOUCHI}<br/>
        <strong>City:</strong> ${props.CITY}<br/>
        <strong>ID:</strong> ${props.ID}
      `)
                        .addTo(map);
                }
            }
        });

        map.on('mouseleave', 'agri-fill', () => {
            map.getCanvas().style.cursor = '';
            popupRef.remove();
        });
    }, []);

    return (
        <div className="relative w-screen h-screen">
            {isLoading && (
                <Card
                    className="
    absolute
    top-1/2 left-1/2
    transform -translate-x-1/2 -translate-y-1/2
    p-5 z-50
    rounded-2xl bg-white
  "
                >
                    <Grid size="60" speed="1.5" color="black" />
                </Card>
            )}
            <div className="absolute right-3 top-3 z-10  flex flex-col items-center justify-center space-y-2 w-fit">
                <Select value={currentStyle} onValueChange={handleStyleChange}>
                    <SelectTrigger className="w-full px-4 py-2 text-sm bg-white rounded-2xl text-black shadow-2xl border border-gray-200">
                        <SelectValue placeholder="Select map style" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(MAP_STYLES).map(([label, url]) => (
                            <SelectItem key={url} value={url}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={toggleRoads} className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  ">
                    {roadsVisible ? '道路を非表示' : '道路を表示'}
                </Button>
                <Button onClick={toggleAdminBoundaries} className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  ">
                    {adminVisible ? '行政界を非表示' : '行政界を表示'}
                </Button>
                <Button onClick={toggleTerrain} className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  ">
                    {terrainEnabled ? '地形を非表示' : '地形を表示'}
                </Button>
                <Button onClick={fitBoundsToKashiwa} className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  ">
                    柏市にフォーカス
                </Button>
                <Button onClick={toggleAgriLayer} className="w-full px-4 py-2 text-black bg-white hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  ">
                    {agriLayerVisible ? '農業レイヤーを非表示' : '農業レイヤーを表示'}
                </Button>

                <Select value={selectedMetric} onValueChange={(val) => { setIsLoading(true); setSelectedMetric(val) }}>
                    <SelectTrigger className="w-full px-4 py-2 text-sm bg-white rounded-2xl text-black shadow-2xl border border-gray-200">
                        <SelectValue placeholder="Select Metric" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PTN_2020">総人口（2020年）</SelectItem>
                        <SelectItem value="PTC_2020">65歳以上の人口（2020年）</SelectItem>
                        <SelectItem value="PTA_2020">0〜14歳の人口（2020年）</SelectItem>
                        <SelectItem value="ELDERLY_RATIO">高齢者比率（65歳以上／総人口）</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Card className="absolute bottom-10 right-3 z-10 bg-white p-3 rounded-2xl shadow-xl text-xs w-64 ">
                {(() => {
                    const legend = getGradientLegendForMetric(selectedMetric);
                    return (
                        <div className='space-y-2'>
                            <CardHeader>
                                <CardTitle className="font-semibold text-center">{legend.title}</CardTitle>
                            </CardHeader>
                            <CardContent className='p-0 space-y-1'>
                                <div className="relative h-4 w-full rounded overflow-hidden " style={{
                                    background: `linear-gradient(to right, ${legend.gradient.join(',')})`
                                }} />
                                <div className="flex justify-between text-[10px] text-gray-700">
                                    {legend.labels.map((label, idx) => (
                                        <span key={idx}>{label}</span>
                                    ))}
                                </div>
                            </CardContent>
                        </div>
                    );
                })()}
            </Card>

            <h1 className={`absolute top-3 left-3 z-10 ${currentStyle === MAP_STYLES.ダーク ? "text-white" : "text-black"} text-lg font-mono  rounded-2xl`}>
                FrameArk 1.0 Beta
            </h1>
            <Card className='absolute bottom-3 left-3 z-10 text-black font-extrabold bg-white p-3 rounded-2xl'>
                {!agriLayerVisible ? <h1>2020年の人口推計データ</h1> : <h1>柏市農地データ</h1>}
            </Card>
            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}
