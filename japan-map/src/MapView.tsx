// MapView.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import { Card } from './components/ui/card';
import 'ldrs/react/Grid.css';
import { MAP_STYLES } from './constants/mapStyles';
import { JAPAN_BOUNDS, CHIBA_BOUNDS } from './constants/bounds';
import { getColorExpression } from './utils/expressions';
import { addMeshLayers } from './layers/meshLayers';
import { toggleAdminBoundaries } from './layers/adminBoundaries';
import { toggleTerrain } from './layers/terrain';
import { toggleAgriLayer } from './layers/agriLayer';
import LoadingOverlay from './components/LoadingOverlay';
import MapControls from './components/MapControls';
import Legend from './components/Legend';
import { useSetRecoilState } from 'recoil';
import { selectedMeshIdState } from './state/meshSelection';
import ChatPanel from './components/ChatPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { toggleTransportationLayer } from './layers/transportationLayer';
import { togglePublicFacilityLayer } from './layers/publicFacilityLayer';
import { toggleSchoolLayer } from './layers/schoolLandLayer';
import { toggleMedicalLayer } from './layers/medicalInstituteLayer';
import { toggleTouristLayer } from './layers/touristSpot';
import { toggleRoadsideStationLayer } from './layers/roadsideStationLayer';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView() {
    const mapRef = useRef<Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const popupRef = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
    const transportPopupRef = new mapboxgl.Popup({ closeButton: false, closeOnClick: true, className: "ai-popup" });

    const [roadsVisible, setRoadsVisible] = useState(false);
    const [adminVisible, setAdminVisible] = useState(false);
    const [terrainEnabled, setTerrainEnabled] = useState(false);
    const [currentStyle, setCurrentStyle] = useState(MAP_STYLES.ストリート);
    const [selectedMetric, setSelectedMetric] = useState('PTN_2020');
    const selectedMetricRef = useRef(selectedMetric);
    const [agriLayerVisible, setAgriLayerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const setSelectedMeshId = useSetRecoilState(selectedMeshIdState);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMeshId, setChatMeshId] = useState<string | null>(null);
    const selectionPopupRef = useRef<mapboxgl.Popup | null>(null);
    const [transportVisible, setTransportVisible] = useState(false);
    const [pbFacilityVisible, setPbFacilityVisible] = useState(false);
    const [schoolLayerVisible, setSchoolLayerVisible] = useState(false);
    const [medicalLayerVisible, setMedicalLayerVisible] = useState(false);
    const [touristLayerVisible, setTouristLayerVisible] = useState(false);
    const [roadsideStationLayerVisible, setRoadsideStationLayerVisible] = useState(false);

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
        setTransportVisible(false)
        setPbFacilityVisible(false)
        setSchoolLayerVisible(false)
        setMedicalLayerVisible(false)

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
        const handleAskMirai = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setChatMeshId(detail.meshId);
            setChatOpen(true);
        };
        window.addEventListener('mirai:ask', handleAskMirai);
        return () => window.removeEventListener('mirai:ask', handleAskMirai);
    }, []);

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

        const ensureHighlightLayer = () => {
            if (map.getSource('clicked-mesh')) return;   // already present

            map.addSource('clicked-mesh', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.addLayer({
                id: 'clicked-mesh-fill',
                type: 'fill',
                source: 'clicked-mesh',
                paint: { 'fill-color': '#ff0000', 'fill-opacity': 0.65 },
            });
            map.addLayer({
                id: 'clicked-mesh-line',
                type: 'line',
                source: 'clicked-mesh',
                paint: { 'line-color': '#ff0000', 'line-width': 2 },
            });
        };

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

            ensureHighlightLayer();
            map.once('idle', () => setIsLoading(false));
        });

        map.on('style.load', () => {
            addMeshLayers(map, selectedMetric);
            ensureHighlightLayer();
        });

        // const showPopup = (e: mapboxgl.MapMouseEvent) => {
        //     const feature = e.features?.[0];
        //     if (!feature) return;

        //     map.getCanvas().style.cursor = 'pointer';
        //     const metric = selectedMetricRef.current;

        //     const value = metric === 'ELDERLY_RATIO'
        //         ? ((feature.properties?.PTC_2020 / feature.properties?.PTN_2020) * 100).toFixed(1) + '%'
        //         : feature.properties?.[metric] ?? 'N/A';

        //     const label = {
        //         PTN_2020: '総人口（2020年）',
        //         PTA_2020: '0〜14歳の人口（2020年）',
        //         PTC_2020: '65歳以上の人口（2020年）',
        //         ELDERLY_RATIO: '高齢者比率（65歳以上／総人口）'
        //     }[metric];

        //     popupRef.setLngLat(e.lngLat).setHTML(`<strong>${label}:</strong> ${value}`).addTo(map);
        // };

        // ['mesh-1km-fill', 'mesh-500m-fill', 'mesh-250m-fill'].forEach(layer => {
        //     map.on('mousemove', layer, showPopup);
        //     map.on('mouseleave', layer, () => {
        //         map.getCanvas().style.cursor = '';
        //         popupRef.remove();
        //     });
        // });

        ['mesh-250m-fill', 'mesh-500m-fill', 'mesh-1km-fill'].forEach(layer => {
            map.on('click', layer, e => {
                const feature = e.features?.[0];
                if (!feature) return;

                const meshId = feature.properties?.MESH_ID as string | undefined;
                if (!meshId) return;

                // 1️⃣ Update global state (Recoil)
                setSelectedMeshId(meshId);

                // 2️⃣ Highlight the clicked mesh
                ensureHighlightLayer();
                const geojson: GeoJSON.FeatureCollection = {
                    type: 'FeatureCollection',
                    features: [
                        {
                            ...(feature.toJSON ? feature.toJSON() : (feature as any)),
                            id: meshId,
                        },
                    ],
                };
                (map.getSource('clicked-mesh') as mapboxgl.GeoJSONSource).setData(geojson);

                // 3️⃣ Show / update the *selection* popup with the "Ask Mirai AI" button
                if (selectionPopupRef.current) {
                    selectionPopupRef.current.remove();
                }

                const selectionPopup = new mapboxgl.Popup({ closeButton: false, offset: 0, className: "ai-popup" })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        `
                        <div class="rounded-xl border bg-white p-4 shadow-xl space-y-2 w-40">
      <div class="text-sm font-semibold text-gray-900">Mesh ID : <span class="text-base text-muted-foreground">${meshId}</span> </div>
      
      <button
        id="ask-mirai-btn"
        class="inline-flex items-center w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none"
      >
        Ask Mirai AI
      </button>
    </div>
                        `,
                    )
                    .addTo(map);

                selectionPopupRef.current = selectionPopup;

                // Optional: wire up an event handler for the button
                const popupElement = selectionPopup.getElement();
                const askBtn = popupElement?.querySelector<HTMLButtonElement>('#ask-mirai-btn');

                askBtn?.addEventListener('click', () => {
                    window.dispatchEvent(
                        new CustomEvent('mirai:ask', {
                            detail: { meshId },
                        }),
                    );
                    // optionally close popup
                    selectionPopupRef.current?.remove();
                });

            });
        });

        /**
         * ===== Extra interactions for agricultural layer =====
         */


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


        map.on('mousemove', 'transportation-line-hover', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    transportPopupRef
                        .setLngLat(e.lngLat)
                        .setHTML(`
                             <div class="rounded-xl border bg-white p-4 shadow-xl space-y-2 w-40">
                            <strong>Name:</strong> ${props.N07_001}<br/>
                            </div>
                    
                        `)
                        .addTo(map);
                }
            }
        });


        map.on('mouseleave', 'transportation-line-hover', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        map.on('mousemove', 'school-layer', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
            <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-72 text-xs">
                <div><strong>都道府県コード (P29_001):</strong> ${props.P29_001}</div>
                <div><strong>施設ID (P29_002):</strong> ${props.P29_002}</div>
                <div><strong>施設種別コード (P29_003):</strong> ${props.P29_003}</div>
                <div><strong>施設名 (P29_004):</strong> ${props.P29_004}</div>
                <div><strong>住所 (P29_005):</strong> ${props.P29_005}</div>
                <div><strong>分類コード (P29_006):</strong> ${props.P29_006}</div>
                <div><strong>ステータスコード (P29_007):</strong> ${props.P29_007}</div>
                <div><strong>不明コード (P29_008):</strong> ${props.P29_008}</div>
                <div><strong>予備フィールド (P29_009):</strong> ${props.P29_009 ?? 'N/A'}</div>
            </div>
        `;

                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'school-layer', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        map.on('mousemove', 'medical-layer', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-72 text-xs">
                    <div><strong>都道府県コード (P04_001):</strong> ${props.P04_001}</div>
                    <div><strong>病院名 (P04_002):</strong> ${props.P04_002}</div>
                    <div><strong>住所 (P04_003):</strong> ${props.P04_003}</div>
                    <div><strong>診療科目 (P04_004):</strong> ${props.P04_004}</div>
                    <div><strong>電話番号 (P04_005):</strong> ${props.P04_005 ?? 'N/A'}</div>
                    <div><strong>FAX番号 (P04_006):</strong> ${props.P04_006 ?? 'N/A'}</div>
                    <div><strong>病床数 (P04_007):</strong> ${props.P04_007}</div>
                    <div><strong>診療日数 (P04_008):</strong> ${props.P04_008}</div>
                    <div><strong>外来数 (P04_009):</strong> ${props.P04_009}</div>
                    <div><strong>救急数 (P04_010):</strong> ${props.P04_010}</div>
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'medical-layer', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        map.on('mousemove', 'tourist-layer', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border bg-white p-4 shadow-xl text-xs space-y-1 w-60">
                    <div><strong>名称 (P12_002):</strong> ${props.P12_002}</div>
                    <div><strong>住所 (P12_006):</strong> ${props.P12_006}</div>
                    <div><strong>コード (P12_001):</strong> ${props.P12_001}</div>
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'tourist-layer', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        map.on('mousemove', 'roadside-station', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            map.getCanvas().style.cursor = 'pointer';
            const props = feature.properties;
            if (!props) return;

            const html = `
    <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-80 text-xs">
      <div><strong>緯度 (P35_001):</strong> ${props.P35_001}</div>
      <div><strong>経度 (P35_002):</strong> ${props.P35_002}</div>
      <div><strong>都道府県 (P35_003):</strong> ${props.P35_003}</div>
      <div><strong>市区町村 (P35_004):</strong> ${props.P35_004}</div>
      <div><strong>市区町村コード (P35_005):</strong> ${props.P35_005}</div>
      <div><strong>駅名 (P35_006):</strong> ${props.P35_006}</div>
      <div><strong>道の駅公式URL (P35_007):</strong> ${props.P35_007
                    ? `<a class="text-blue-500 underline" href="${props.P35_007}" target="_blank">リンク</a>`
                    : 'なし'}</div>
      <div><strong>地方会公式URL (P35_008):</strong> ${props.P35_008
                    ? `<a class="text-blue-500 underline" href="${props.P35_008}" target="_blank">リンク</a>`
                    : 'なし'}</div>
      <div><strong>市町村公式URL (P35_009):</strong> ${props.P35_009
                    ? `<a class="text-blue-500 underline" href="${props.P35_009}" target="_blank">リンク</a>`
                    : 'なし'}</div>
      <div><strong>備考 (P35_010):</strong> ${props.P35_010 ?? 'N/A'}</div>

      ${[...Array(18)].map((_, i) => {
                        const index = i + 11;
                        return `<div><strong>P35_${String(index).padStart(3, '0')}:</strong> ${props[`P35_${String(index).padStart(3, '0')}`]}</div>`;
                    }).join('')}
    </div>
  `;

            transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
        });


        map.on('mouseleave', 'roadside-station', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        map.on('click', 'facilities-circle', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const props = feature.properties ?? {};
            const lngLat = e.lngLat;

            const popupContent = `
        <div class="rounded-xl border bg-white p-4 shadow-xl space-y-2 w-64 text-sm">
            <div><strong>施設名:</strong> ${props.P02_004 ?? '不明'}</div>
            <div><strong>住所:</strong> ${props.P02_005 ?? '不明'}</div>
            <div><strong>種別コード:</strong> ${props.P02_003}</div>
            <div><strong>出典:</strong> ${props.P02_007}</div>
        </div>
    `;

            transportPopupRef.setLngLat(lngLat).setHTML(popupContent).addTo(map);
        });
    }, []);

    const cardTitle = (() => {
        if (agriLayerVisible) return '柏市農地データ';
        if (transportVisible) return '交通機関運行情報_国土数値情報_2022年度';
        if (pbFacilityVisible) return '公共施設_国土数値情報_2006年度';
        if (schoolLayerVisible) return '学校_国土数値情報_2023年度';
        if (medicalLayerVisible) return '医療機関_国土数値情報_2020年度';
        if (touristLayerVisible) return '観光施設_国土数値情報_2014年度';
        if (roadsideStationLayerVisible) return '道の駅_国土数値情報_2018年度';
        // you can add more cases here, e.g.:
        // if (adminVisible) return '行政界データ';
        // if (terrainEnabled) return '地形データ';
        return '2020年の人口推計データ';
    })();

    return (
        <div className="relative w-screen h-screen">
            {isLoading && <LoadingOverlay />}

            <AnimatePresence>
                {chatOpen && chatMeshId && (
                    <motion.div
                        key="chat-container"
                        initial={{ x: -400, opacity: 1 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -400, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute top-0 left-0 z-30 h-full w-[400px]"
                    >
                        <ChatPanel meshId={chatMeshId} onClose={() => setChatOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
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
                transportVisible={transportVisible}
                toggleTransport={() => toggleTransportationLayer(mapRef.current!, transportVisible, setIsLoading, setTransportVisible)}
                pbFacilityVisible={pbFacilityVisible}
                togglePbFacility={() => togglePublicFacilityLayer(mapRef.current!, pbFacilityVisible, setIsLoading, setPbFacilityVisible)}
                schoolLayerVisible={schoolLayerVisible}
                toggleSchoolLayer={() => toggleSchoolLayer(mapRef.current!, schoolLayerVisible, setIsLoading, setSchoolLayerVisible)}
                medicalLayerVisible={medicalLayerVisible}
                toggleMedicalLayer={() => toggleMedicalLayer(mapRef.current!, medicalLayerVisible, setIsLoading, setMedicalLayerVisible)}
                touristLayerVisible={medicalLayerVisible}
                toggleTouristLayer={() => toggleTouristLayer(mapRef.current!, touristLayerVisible, setIsLoading, setTouristLayerVisible)}
                roadsideStationLayerVisible={roadsideStationLayerVisible}
                toggleRoadsideStationLayerVisible={() => toggleRoadsideStationLayer(mapRef.current!, roadsideStationLayerVisible, setIsLoading, setRoadsideStationLayerVisible)}
            />

            <Legend selectedMetric={selectedMetric} />

            <h1 className={`absolute top-3 left-3 z-10 ${currentStyle === MAP_STYLES.ダーク ? "text-white" : "text-black"} text-lg font-mono rounded-2xl`}>
                FrameArk 1.0 Beta
            </h1>
            {!chatOpen && !chatMeshId && (
                <Card className='absolute bottom-10 left-3 z-10 text-black font-extrabold bg-white p-3 rounded-2xl'>
                    <h1>{cardTitle}</h1>
                </Card>
            )
            }

            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}
