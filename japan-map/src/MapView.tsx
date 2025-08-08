// MapView.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import { Card } from './components/ui/card';
import 'ldrs/react/Grid.css';
import { MAP_STYLES } from './constants/mapStyles';
import { JAPAN_BOUNDS, CHIBA_BOUNDS, KASHIWA_BOUNDS } from './constants/bounds';
import { getColorExpression } from './utils/expressions';
import { addMeshLayers } from './layers/meshLayers';
import { toggleAdminBoundaries } from './layers/adminBoundaries';
import { toggleTerrain } from './layers/terrain';
import { toggleAgriLayer } from './layers/agriLayer';
import LoadingOverlay from './components/LoadingOverlay';
import MapControls from './components/MapControls';
import Legend from './components/Legend';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedMeshIdState } from './state/meshSelection';
import ChatPanel from './components/ChatPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { toggleAlightingLayer, toggleBoardingLayer, toggleBusStops, toggleTransportationLayer } from './layers/transportationLayer';
import { togglePublicFacilityLayer } from './layers/publicFacilityLayer';
import { toggleSchoolLayer } from './layers/schoolLandLayer';
import { toggleMedicalLayer } from './layers/medicalInstituteLayer';
import { toggleTouristLayer } from './layers/touristSpot';
import { toggleRoadsideStationLayer } from './layers/roadsideStationLayer';
import { toggleAttractionLayer } from './layers/attractionLayer';
import { toggleBusPickDropLayer } from './layers/busPickDropLayer';
import { toggleBusPassengerLayer, toggleMasuoCourseRideLayer, toggleSakaeCourseDropLayer, toggleSakaeCourseRideLayer, toggleShonanCourseDropLayer, toggleShonanCourseRideLayer } from './layers/busPassengerLayer';
import { toggleNewBusPassengerLayer, toggleNewKashiwakuruDropLayer, toggleNewKashiwakuruRideLayer } from './layers/newbusPassengerLayer';
import { categories, toggleKashiwaPublicFacilityLayer } from './layers/kashiwaPublicFacilities';
import { shopCategories, toggleKashiwaShopsLayer } from './layers/kashiwaBusStops';
import PptxGenJS from "pptxgenjs";
import { globalVisibleLayersState } from './state/activeLayersAtom';
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
    const [busStopsVisible, setBusStopsVisible] = useState(false);
    const [boardingVisible, setBoardingVisible] = useState(false);
    const [alightingVisible, setAlightingVisible] = useState(false);
    const [attractionLayerVisible, setAttractionLayerVisible] = useState(false);
    const [busPickDropLayerVisible, setBusPickDropLayerVisible] = useState(false);
    const [busPassengerLayerVisible, setBusPassengerLayerVisible] = useState(false);
    const [sakaeCourseRideLayerVisible, setSakaeCourseRideLayerVisible] = useState(false);
    const [sakaeCourseDropLayerVisible, setSakaeCourseDropLayerVisible] = useState(false);
    const [masuoCourseRideLayerVisible, setMasuoCourseRideLayerVisible] = useState(false);
    const [masuoCourseDropLayerVisible, setMasuoCourseDropLayerVisible] = useState(false);
    const [shonanCourseRideLayerVisible, setShonanCourseRideLayerVisible] = useState(false);
    const [shonanCourseDropLayerVisible, setShonanCourseDropLayerVisible] = useState(false);
    const [isKashiwaBounds, setIsKashiwaBounds] = useState(false); // Track the toggle stat

    const globalVisibleLayers = useRecoilValue(globalVisibleLayersState)

    const [newBusLayerVisible, setNewBusLayerVisible] = useState(false);
    const [newKashiwakuruRideLayerVisible, setNewKashiwakuruRideLayerVisible] = useState(false);
    const [newKashiwakuruDropLayerVisible, setNewKashiwakuruDropLayerVisible] = useState(false);

    const [kashiwaPublicFacilityVisible, setKashiwaPublicFacilityVisible] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [kashiwaShopsVisible, setKashiwaShopsVisible] = useState(false);
    const [selectedShopCategories, setSelectedShopCategories] = useState<string[]>([]);

    const toggleKashiwaPublicFacilityVisible = (category: string) => {
        // Toggle category selection
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((cat) => cat !== category)
                : [...prev, category]
        );
    };
    const toggleKashiwaShopsVisible = (category: string) => {
        // Toggle category selection
        setSelectedShopCategories((prev) =>
            prev.includes(category)
                ? prev.filter((cat) => cat !== category)
                : [...prev, category]
        );
    };

        async function downloadPpt() {
        const map = mapRef.current;
        if (!map) {
            console.warn("Map not ready");
            return;
        }

        try {
            setIsLoading(true);

            await new Promise<void>((resolve) => {
                map.once("render", () => resolve());
                map.triggerRepaint();
                setTimeout(() => resolve(), 300);
            });

            const canvas = map.getCanvas();
            const mapImageDataUrl = canvas.toDataURL("image/png");

            const Layers = globalVisibleLayers.join(' | ');
            const pptx = new PptxGenJS();
            const slide = pptx.addSlide();

            // --- Layout constants ---
            const slideWidth = 10;
            const slideHeight = 5.63;
            const margin = 0.4;
            const usableWidth = slideWidth - 2 * margin;

            // --- Title ---
            const titleY = margin - 0.4;
            const titleHeight = 0.6;

            slide.addText(`（対象地域）： ${Layers}`, {
                x: margin,
                y: titleY + 0.1,
                w: usableWidth,
                h: titleHeight,
                fontSize: 18,
                bold: true,
                fontFace: "Arial",
            });

            // --- Blue bar below title ---
            const barHeight = 0.03;
            slide.addShape(pptx.ShapeType.rect, {
                x: margin,
                y: titleY + titleHeight + 0.05,
                w: usableWidth,
                h: barHeight,
                fill: { color: "0070C0" }, // Blue
            });

            // --- Lead texts ---
            const lead1Y = titleY + titleHeight + barHeight + 0.2;
            slide.addText("リード文 1:", {
                x: margin,
                y: lead1Y,
                w: usableWidth,
                h: 0.4,
                fontSize: 12,
                fontFace: "Arial",
            });

            slide.addText("リード文 2:", {
                x: margin,
                y: lead1Y + 0.5,
                w: usableWidth,
                h: 0.4,
                fontSize: 12,
                fontFace: "Arial",
            });

            // --- Image (full width with aspect fit) ---
            const imageTopY = lead1Y + 1.0;
            const imageBottomY = slideHeight - margin - 0.2; // reserve 0.4 for footer
            const imageMaxHeight = imageBottomY - imageTopY;

            const imgOriginalWidth = canvas.width;
            const imgOriginalHeight = canvas.height;
            const imageAspect = imgOriginalWidth / imgOriginalHeight;

            const imageWidth = usableWidth;
            let imageHeight = imageWidth / imageAspect + 1;

            if (imageHeight > imageMaxHeight) {
                imageHeight = imageMaxHeight;
            }

            const imageX = margin;
            const imageY = imageTopY;

            slide.addImage({
                data: mapImageDataUrl,
                x: imageX,
                y: imageY,
                w: imageWidth,
                h: imageHeight + 0.3,
            });

            // --- Footer ---
            slide.addText("Mapbox / OpenStreetMap", {
                x: margin,
                y: slideHeight - margin - 0.2,
                w: usableWidth,
                h: 0.3,
                fontSize: 10,
                italic: true,
                fontFace: "Arial",
            });

            await pptx.writeFile({ fileName: "Map_Export.pptx" });

        } catch (err) {
            console.error("Export to PPT failed:", err);
        } finally {
            setIsLoading(false);
        }
    }



    useEffect(() => {
        if (mapRef.current) {
            toggleKashiwaPublicFacilityLayer(mapRef.current, kashiwaPublicFacilityVisible, setIsLoading, setKashiwaPublicFacilityVisible, selectedCategories);
        }
    }, [selectedCategories]);

    useEffect(() => {
        if (mapRef.current) {
            toggleKashiwaShopsLayer(mapRef.current, kashiwaShopsVisible, setIsLoading, setKashiwaShopsVisible, selectedShopCategories);
        }
    }, [selectedShopCategories]);

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
        // const map = mapRef.current;
        // if (!map) return;
        // map.fitBounds([[139.935, 35.825], [140.05, 35.91]], { padding: 40, duration: 1000 });

        // map.setMaxBounds(KASHIWA_BOUNDS)

        const map = mapRef.current;
        if (!map) return;

        if (isKashiwaBounds) {
            // Fit map to Kashiwa bounds
            map.fitBounds(KASHIWA_BOUNDS, {
                padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Padding for better view
                duration: 1000 // Smooth transition duration
            });
            map.setMaxBounds(KASHIWA_BOUNDS); // Limit panning to Kashiwa bounds
        } else {
            // Fit map to Chiba bounds
            map.fitBounds(CHIBA_BOUNDS, {
                padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Padding for better view
                duration: 1000 // Smooth transition duration
            });
            map.setMaxBounds(CHIBA_BOUNDS); // Limit panning to Chiba bounds
        }

        // Toggle the state for the next time
        setIsKashiwaBounds(!isKashiwaBounds);
    };


    function downloadMapScreenshot(map: mapboxgl.Map, fileName = 'map-screenshot.png') {
        const canvas = map.getCanvas();

        // Force a re-render to ensure everything is drawn
        map.once('render', () => {
            try {
                const dataURL = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = dataURL;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (e) {
                console.error('Screenshot failed:', e);
            }
        });

        // Trigger a render if needed
        map.triggerRepaint();
    }


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
            language: "ja",
            preserveDrawingBuffer: true,
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
       ミライに聞く
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

        map.on('click', 'roadside-station', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            map.getCanvas().style.cursor = 'pointer';
            const props = feature.properties;
            if (!props) return;

            const html = `
    <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-80 text-xs select-text">
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

            transportPopupRef
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);
        });

        // Clear popup if user clicks outside the feature
        map.on('click', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['roadside-station']
            });
            if (!features.length) {
                transportPopupRef.remove();
                map.getCanvas().style.cursor = '';
            }
        });

        map.on('click', 'bus-stops', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const props = feature.properties;
            if (!props) return;

            const html = `
    <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-80 text-xs">
      <div><strong>P11_001:</strong> ${props.P11_001 ?? 'N/A'}</div>
      <div><strong>P11_002:</strong> ${props.P11_002 ?? 'N/A'}</div>
      <div><strong>P11_003_01:</strong> ${props.P11_003_01 ?? 'N/A'}</div>
      <div><strong>P11_003_02</strong>${props.P11_003_02 ?? 'N/A'}</div>
    </div>
    `;

            transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
        });

        map.on('click', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['bus-stops']
            });
            if (!features.length) {
                transportPopupRef.remove();
                map.getCanvas().style.cursor = '';
            }
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


        map.on('mousemove', 'attraction-layer', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-72 text-xs">
                    <div><strong>都道府県コード (P33_001):</strong> ${props.P33_001}</div>
                    <div><strong>市区町村コード (P33_002):</strong> ${props.P33_002}</div>
                    <div><strong>施設コード (P33_003):</strong> ${props.P33_003}</div>
                    <div><strong>施設種別 (P33_004):</strong> ${props.P33_004}</div>
                    <div><strong>施設名 (P33_005):</strong> ${props.P33_005}</div>
                    <div><strong>郵便番号 (P33_006):</strong> ${props.P33_006}</div>
                    <div><strong>住所 (P33_007):</strong> ${props.P33_007}</div>
                    <div><strong>電話番号 (P33_008):</strong> ${props.P33_008}</div>
                    <div><strong>備考 (P33_009):</strong> ${props.P33_009 ?? 'N/A'}</div>
                    <div><strong>Webサイト (P33_010):</strong> 
                        ${props.P33_010
                            ? `<a href="${props.P33_010}" target="_blank" class="text-blue-500 underline">${props.P33_010}</a>`
                            : 'N/A'}
                    </div>
                    <div><strong>分類 (P33_011):</strong> ${props.P33_011 ?? 'N/A'}</div>
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'attraction-layer', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        // POINT CIRCLE CLICK TOOLTIP
        map.on('mousemove', 'bus-pick-drop-points', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            map.getCanvas().style.cursor = 'pointer';
            const props = feature.properties || {};

            const rows = Object.entries(props)
                .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
                .join('');

            transportPopupRef
                .setLngLat(e.lngLat)
                .setHTML(`
      <div class="rounded-xl border bg-white p-3 shadow-md text-xs w-72">
        ${rows}
      </div>
    `)
                .addTo(map);
        });

        map.on('mouseleave', 'bus-pick-drop-points', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        // POLYGON HOVER TOOLTIP
        map.on('click', 'bus-pick-drop-polygons', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const props = feature.properties || {};

            const rows = Object.entries(props)
                .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
                .join('');

            transportPopupRef
                .setLngLat(e.lngLat)
                .setHTML(`
      <div class="rounded-xl border bg-white p-4 shadow-xl text-xs w-72">
        ${rows}
      </div>
    `)
                .addTo(map);
        });

        map.on('mousemove', 'bus-layer', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.P11_001}</strong> 
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'bus-layer', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        map.on('mousemove', 'sakae-course-ride', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.sakae_ride}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'sakae-course-ride', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });
        map.on('mousemove', 'sakae-course-drop', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.sakae_drop}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'sakae-course-drop', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });
        map.on('mousemove', 'masuo-course-ride', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.masuo_ride}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'masuo-course-ride', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });
        map.on('mousemove', 'masuo-course-drop', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.masuo_drop}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'masuo-course-drop', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });
        map.on('mousemove', 'shonan-course-ride', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.shonan_ride}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'shonan-course-ride', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });
        map.on('mousemove', 'shonan-course-drop', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.shonan_drop}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'shonan-course-drop', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });

        map.on('mousemove', 'new-bus-layer', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>表示番号: ${props.表示番号}</strong> 
                    <strong>Name: ${props.name}</strong> 
                    <strong>乗車数: ${props.乗車数}</strong> 
                    <strong>降車数: ${props.降車数}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'new-bus-layer', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });



        map.on('mousemove', 'ride-data', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.乗車数}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'ride-data', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });
        map.on('mousemove', 'drop-data', (e) => {
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const props = feature.properties;
                if (props) {
                    const html = `
                <div class="rounded-xl border flex flex-col bg-white p-4 shadow-xl space-y-2 w-fit text-xs">
                    <strong>${props.乗車数}</strong> 
           
                </div>
            `;
                    transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }
            }
        });

        map.on('mouseleave', 'drop-data', () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });


        const showKashiwaPublicFacilityPopup = (e: mapboxgl.MapMouseEvent) => {
            const feature = e.features?.[0];
            if (!feature) return;

            map.getCanvas().style.cursor = 'pointer';

            const properties = feature.properties ?? {};
            const popupContent = `
            <div class="rounded-xl border bg-white p-4 shadow-xl space-y-2 w-64">
                <strong>施設名:</strong> ${properties?.名前 ?? '不明'}<br />
                <strong>住所:</strong> ${properties?.住所 ?? '不明'}<br />
                <strong>カテゴリ:</strong> ${properties?.カテゴリ ?? '不明'}
            </div>
        `;

            transportPopupRef.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
        };

        const hideKashiwaPublicFacilityPopup = () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        };

        // Add hover interaction for all layers (individual filters and subete layer)
        const layers = [
            'kashiwa-public-facility-subete', // Subete layer
            ...categories.map(category => `kashiwa-public-facility-${category.label}`) // Individual filter layers
        ];

        layers.forEach(layerId => {
            // Ensure the hover event is added for each layer
            map.on('mousemove', layerId, showKashiwaPublicFacilityPopup);
            map.on('mouseleave', layerId, hideKashiwaPublicFacilityPopup);
        });


        const showKashiwaShopsPopup = (e: mapboxgl.MapMouseEvent) => {
            const feature = e.features?.[0];
            if (!feature) return;

            map.getCanvas().style.cursor = 'pointer';

            const properties = feature.properties ?? {};
            const popupContent = `
            <div class="rounded-xl border bg-white p-4 shadow-xl space-y-2 w-64">
            <strong>カテゴリ:</strong> ${properties?.カテゴリ ?? '不明'}
                <strong>店舗ブランド:</strong> ${properties?.店舗ブランド ?? '不明'}<br />
                <strong>店舗名:</strong> ${properties?.店舗名 ?? '不明'}<br />
                <strong>郵便番号:</strong> ${properties?.郵便番号 ?? '不明'}<br />
                <strong>住所:</strong> ${properties?.住所 ?? '不明'}<br />
            </div>
        `;

            transportPopupRef.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
        };

        const hideKashiwaShopsPopup = () => {
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        };

        // Add hover interaction for all layers (individual filters and subete layer)
        const kashiwaStopLayers = [
            'kashiwa-shops-subete', // Subete layer
            ...shopCategories.map(category => `kashiwa-shops-${category.label}`) // Individual filter layers
        ];

        kashiwaStopLayers.forEach(layerId => {
            // Ensure the hover event is added for each layer
            map.on('mousemove', layerId, showKashiwaShopsPopup);
            map.on('mouseleave', layerId, hideKashiwaShopsPopup);
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
        if (attractionLayerVisible) return '集客施設_国土数値情報_2014年度';
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
                touristLayerVisible={touristLayerVisible}
                toggleTouristLayer={() => toggleTouristLayer(mapRef.current!, touristLayerVisible, setIsLoading, setTouristLayerVisible)}
                attractionLayerVisible={attractionLayerVisible}
                toggleAttractionLayer={() => toggleAttractionLayer(mapRef.current!, attractionLayerVisible, setIsLoading, setAttractionLayerVisible)}
                roadsideStationLayerVisible={roadsideStationLayerVisible}
                toggleRoadsideStationLayerVisible={() => toggleRoadsideStationLayer(mapRef.current!, roadsideStationLayerVisible, setIsLoading, setRoadsideStationLayerVisible)}
                busStopsVisible={busStopsVisible}
                toggleBusStops={() =>
                    toggleBusStops(mapRef.current!, busStopsVisible, setIsLoading, setBusStopsVisible)
                }
                boardingVisible={boardingVisible}
                toggleBoarding={() => toggleBoardingLayer(mapRef.current!, setBoardingVisible)}
                alightingVisible={alightingVisible}
                toggleAlighting={() => toggleAlightingLayer(mapRef.current!, setAlightingVisible)}
                busPickDropLayerVisible={busPickDropLayerVisible}
                toggleBusPickDropLayerVisible={() => toggleBusPickDropLayer(mapRef.current!, busPickDropLayerVisible, setIsLoading, setBusPickDropLayerVisible)}
                busPassengerLayerVisible={busPassengerLayerVisible}
                toggleBusPassengerLayerVisible={() => toggleBusPassengerLayer(mapRef.current!, busPassengerLayerVisible, setIsLoading, setBusPassengerLayerVisible)}
                sakaeCourseRideLayerVisible={sakaeCourseRideLayerVisible}
                toggleSakaeCourseRideLayerVisible={() => toggleSakaeCourseRideLayer(mapRef.current!, sakaeCourseRideLayerVisible, setIsLoading, setSakaeCourseRideLayerVisible)}
                sakaeCourseDropLayerVisible={sakaeCourseDropLayerVisible}
                toggleSakaeCourseDropLayerVisible={() => toggleSakaeCourseDropLayer(mapRef.current!, sakaeCourseDropLayerVisible, setIsLoading, setSakaeCourseDropLayerVisible)}
                masuoCourseRideLayerVisible={masuoCourseRideLayerVisible}
                toggleMasuoCourseRideLayerVisible={() => toggleMasuoCourseRideLayer(mapRef.current!, masuoCourseRideLayerVisible, setIsLoading, setMasuoCourseRideLayerVisible)}
                masuoCourseDropLayerVisible={masuoCourseDropLayerVisible}
                toggleMasuoCourseDropLayerVisible={() => toggleSakaeCourseDropLayer(mapRef.current!, masuoCourseDropLayerVisible, setIsLoading, setMasuoCourseDropLayerVisible)}
                shonanCourseRideLayerVisible={shonanCourseRideLayerVisible}
                toggleShonanCourseRideLayerVisible={() => toggleShonanCourseRideLayer(mapRef.current!, shonanCourseRideLayerVisible, setIsLoading, setShonanCourseRideLayerVisible)}
                shonanCourseDropLayerVisible={shonanCourseDropLayerVisible}
                toggleShonanCourseDropLayerVisible={() => toggleShonanCourseDropLayer(mapRef.current!, shonanCourseDropLayerVisible, setIsLoading, setShonanCourseDropLayerVisible)}
                captureMapScreenshot={() => {
                    if (mapRef.current) {
                        downloadMapScreenshot(mapRef.current);
                    }
                }}

                newbusLayerVisible={newBusLayerVisible}
                toggleNewBusLayerVisible={() => toggleNewBusPassengerLayer(mapRef.current!, newBusLayerVisible, setIsLoading, setNewBusLayerVisible)}

                newKashiwakuruRideLayerVisible={newKashiwakuruRideLayerVisible}
                toggleNewKashiwakuruRideLayerVisible={() => toggleNewKashiwakuruRideLayer(mapRef.current!, newKashiwakuruRideLayerVisible, setIsLoading, setNewKashiwakuruRideLayerVisible)}

                newKashiwakuruDropLayerVisible={newKashiwakuruDropLayerVisible}
                toggleNewKashiwakuruDropLayerVisible={() => toggleNewKashiwakuruDropLayer(mapRef.current!, newKashiwakuruDropLayerVisible, setIsLoading, setNewKashiwakuruDropLayerVisible)}

                kashiwaPublicFacilityVisible={kashiwaPublicFacilityVisible}
                toggleKashiwaPublicFacilityVisible={toggleKashiwaPublicFacilityVisible}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}

                toggleKashiwaShopsVisible={toggleKashiwaShopsVisible}
                selectedShopCategories={selectedShopCategories}

                downloadPpt={downloadPpt}

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


