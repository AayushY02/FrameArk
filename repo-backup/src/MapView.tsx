// MapView.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Grid } from 'ldrs/react';
import 'ldrs/react/Grid.css';

import { MAP_STYLES } from './constants/mapStyles';
import { JAPAN_BOUNDS, CHIBA_BOUNDS } from './constants/bounds';
import { getGradientLegendForMetric } from './utils/metrics';
import { getColorExpression } from './utils/expressions';
import { addMeshLayers } from './layers/meshLayers';
import { toggleAdminBoundaries } from './layers/adminBoundaries';
import { toggleTerrain } from './layers/terrain';
import { toggleAgriLayer } from './layers/agriLayer';
import LoadingOverlay from './components/LoadingOverlay';
import MapControls from './components/MapControls';
import Legend from './components/Legend';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView() {
    const mapRef = useRef<Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const popupRef = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

    const [roadsVisible, setRoadsVisible] = useState(false);
    const [adminVisible, setAdminVisible] = useState(false);
    const [terrainEnabled, setTerrainEnabled] = useState(false);
    const [currentStyle, setCurrentStyle] = useState(MAP_STYLES.ストリート);
    const [selectedMetric, setSelectedMetric] = useState('PTN_2020');
    const selectedMetricRef = useRef(selectedMetric);
    const [agriLayerVisible, setAgriLayerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const ROAD_LAYER_IDS = [
        'road', 'road-street', 'road-street-low', 'road-secondary-tertiary',
        'road-primary', 'road-trunk', 'road-motorway', 'road-rail', 'road-path', 'road-network'
    ];

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

    const updateMetricStyles = () => {
        const map = mapRef.current;
        if (!map) return;
        const color = getColorExpression(selectedMetric);

        ['mesh-1km-fill', 'mesh-500m-fill', 'mesh-250m-fill'].forEach(id => {
            if (map.getLayer(id)) {
                map.setPaintProperty(id, 'fill-color', color);
            }
        });

        ['mesh-1km-outline', 'mesh-500m-outline', 'mesh-250m-outline'].forEach(id => {
            if (map.getLayer(id)) {
                map.setPaintProperty(id, 'line-color', color);
            }
        });
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
        setSelectedMetric('PTN_2020');
        setTerrainEnabled(false);
        setAgriLayerVisible(false);

        map.setStyle(styleUrl);
        map.once('style.load', () => {
            addMeshLayers(map, selectedMetric);
            updateMetricStyles();
        });
        map.once('idle', () => setIsLoading(false));
    };

    useEffect(() => {
        selectedMetricRef.current = selectedMetric;
    }, [selectedMetric]);

    useEffect(() => {
        updateMetricStyles();
        mapRef.current?.once('idle', () => setIsLoading(false));
    }, [selectedMetric]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: currentStyle,
            center: [139.9797, 35.8676],
            zoom: 5.5,
            minZoom: 4.5,
            maxZoom: 18,
            maxBounds: JAPAN_BOUNDS,
            language: "ja"
        });

        mapRef.current = map;

        map.on('load', () => {
            map.flyTo({
                center: [139.9797, 35.8676],
                zoom: 10,
                speed: 1.2,
                curve: 1,
                essential: true
            });

            map.once('moveend', () => {
                map.setMaxBounds(CHIBA_BOUNDS);
            });

            map.getStyle().layers?.forEach(layer => {
                if (layer.type === 'symbol' && ['poi-label', 'road-label', 'waterway-label'].some(id => layer.id.startsWith(id))) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });

            addMeshLayers(map, selectedMetric);
            map.once('idle', () => setIsLoading(false));
        });

        map.on('style.load', () => {
            addMeshLayers(map, selectedMetric);
        });

        const showPopup = (e: mapboxgl.MapMouseEvent) => {
            const feature = e.features?.[0];
            if (!feature) return;

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

            popupRef.setLngLat(e.lngLat).setHTML(`<strong>${label}:</strong> ${value}`).addTo(map);
        };

        ['mesh-1km-fill', 'mesh-500m-fill', 'mesh-250m-fill'].forEach(layer => {
            map.on('mousemove', layer, showPopup);
            map.on('mouseleave', layer, () => {
                map.getCanvas().style.cursor = '';
                popupRef.remove();
            });
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
            {isLoading && <LoadingOverlay />}

            <MapControls
                currentStyle={currentStyle}
                onStyleChange={handleStyleChange}
                roadsVisible={roadsVisible}
                toggleRoads={toggleRoads}
                adminVisible={adminVisible}
                toggleAdmin={() => toggleAdminBoundaries(mapRef.current!, adminVisible, setAdminVisible)}
                terrainEnabled={terrainEnabled}
                toggleTerrain={() => toggleTerrain(mapRef.current!, terrainEnabled, setTerrainEnabled)}
                fitToBounds={fitBoundsToKashiwa}
                agriLayerVisible={agriLayerVisible}
                toggleAgri={() => toggleAgriLayer(mapRef.current!, agriLayerVisible, setIsLoading, setAgriLayerVisible)}
                selectedMetric={selectedMetric}
                onMetricChange={(val) => {
                    setIsLoading(true);
                    setSelectedMetric(val);
                }}
                styles={MAP_STYLES}
            />

            <Legend selectedMetric={selectedMetric} />

            <h1 className={`absolute top-3 left-3 z-10 ${currentStyle === MAP_STYLES.ダーク ? "text-white" : "text-black"} text-lg font-mono rounded-2xl`}>
                FrameArk 1.0 Beta
            </h1>

            <Card className='absolute bottom-10 left-3 z-10 text-black font-extrabold bg-white p-3 rounded-2xl'>
                {!agriLayerVisible ? <h1>2020年の人口推計データ</h1> : <h1>柏市農地データ</h1>}
            </Card>

            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}
