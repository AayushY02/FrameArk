// MapView.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';
import { Card } from './components/ui/card';
import 'ldrs/react/Grid.css';
import { MAP_STYLES } from './constants/mapStyles';
import { JAPAN_BOUNDS, CHIBA_BOUNDS, KASHIWA_BOUNDS } from './constants/bounds';
import { getColorExpression } from './utils/expressions';
import { addMeshLayers } from './layers/meshLayers';
import { toggleAdminBoundaries } from './layers/adminBoundaries';
// import { toggleTerrain } from './layers/terrain';
import { toggleAgriLayer } from './layers/agriLayer';
import LoadingOverlay from './components/LoadingOverlay';
import MapControls from './components/MapControls';
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
import { toggleBusPassengerLayer, toggleMasuoCourseDropLayer, toggleMasuoCourseRideLayer, toggleSakaeCourseDropLayer, toggleSakaeCourseRideLayer, toggleShonanCourseDropLayer, toggleShonanCourseRideLayer } from './layers/busPassengerLayer';
import { toggleNewBusPassengerLayer, toggleNewKashiwakuruDropLayer, toggleNewKashiwakuruRideLayer } from './layers/newbusPassengerLayer';
import { categories, toggleKashiwaPublicFacilityLayer } from './layers/kashiwaPublicFacilities';
import { shopCategories, toggleKashiwaShopsLayer } from './layers/kashiwaBusStops';
import PptxGenJS from "pptxgenjs";
import { globalVisibleLayersState } from './state/activeLayersAtom';
import BusPassengerLayerLegend from './components/Legend/BusPassengerLayerLegend';
import LegendsStack from './components/Legend/LegendsStack';
import KashiwaPublicFacilitiesLegend, { facilityCategories } from './components/Legend/KashiwaPublicFacilitiesLegend';
import KashiwakuruStopsLegend from './components/Legend/KashiwakuruStopsLegend';
import KashiwaShopsLegend, { shopCategoriesLegend } from './components/Legend/KashiwaShopsLegend';
import { toggleMasuoRoute, toggleSakaiRoute, toggleShonanRoute } from './layers/busRouteLayer';
import { clearOdEndpointFocus, setKashiwakuruOdFilter, setKashiwakuruOdHour, showAllKashiwakuruOd, toggleKashiwakuruOdLayer } from './layers/kashiwakuruOdLayer';
import KashiwakuruOdLegend from './components/Legend/KashiwakuruOdLegend';
import { setKashiwaChomeLabelsVisible, setKashiwaChomeRangeFilter, toggleKashiwaChomeAging2040Layer, toggleKashiwaChomeAgingLayer, toggleKashiwaChomeDensityLayer, toggleKashiwaChomeTotal2040Layer, toggleKashiwaChomeTotalLayer, updateKashiwaChomeStyle } from './layers/kashiwaChomePopulationLayer';
import KashiwaChomePopulationLegend from './components/Legend/KashiwaChomePopulationLegend';
// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView() {
    const mapRef = useRef<Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const popupRef = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
    const transportPopupRef = new maplibregl.Popup({ closeButton: false, closeOnClick: true, className: "ai-popup" });
    const clampRef = useRef<maplibregl.LngLatBoundsLike | null>(JAPAN_BOUNDS);
    const [roadsVisible, setRoadsVisible] = useState(false);
    const [adminVisible, setAdminVisible] = useState(false);
    const [meshVisible, setMeshVisible] = useState(true);
    // const [terrainEnabled, setTerrainEnabled] = useState(false);
    const [currentStyle,] = useState(MAP_STYLES.ストリート);
    const [selectedMetric, setSelectedMetric] = useState('PTN_2020');
    const selectedMetricRef = useRef(selectedMetric);
    const [agriLayerVisible, setAgriLayerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const setSelectedMeshId = useSetRecoilState(selectedMeshIdState);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMeshId, setChatMeshId] = useState<string | null>(null);
    const selectionPopupRef = useRef<maplibregl.Popup | null>(null);
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
    const [shonanRouteVisible, setShonanRouteVisible] = useState(false);
    const [masuoRouteVisible, setMasuoRouteVisible] = useState(false);
    const [sakaiRouteVisible, setSakaiRouteVisible] = useState(false);
    const globalVisibleLayers = useRecoilValue(globalVisibleLayersState)

    const [newBusLayerVisible, setNewBusLayerVisible] = useState(false);
    const [newKashiwakuruRideLayerVisible, setNewKashiwakuruRideLayerVisible] = useState(false);
    const [newKashiwakuruDropLayerVisible, setNewKashiwakuruDropLayerVisible] = useState(false);

    const [kashiwaPublicFacilityVisible, setKashiwaPublicFacilityVisible] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [kashiwaShopsVisible, setKashiwaShopsVisible] = useState(false);
    const [selectedShopCategories, setSelectedShopCategories] = useState<string[]>([]);

    // MapView.tsx (inside component state block)
    const [kashiwakuruOdVisible, setKashiwakuruOdVisible] = useState(false); // ⬅ NEW
    const [kashiwakuruOdHour, setKashiwakuruOdHourState] = useState(8);     // ⬅ NEW (default hour band)
    const [kashiwakuruOdFilterOn, setKashiwakuruOdFilterOn] = useState(false);

    const [chomeTotalVisible, setChomeTotalVisible] = useState(false);
    const [chomeAgingVisible, setChomeAgingVisible] = useState(false);
    const [chomeDensityVisible, setChomeDensityVisible] = useState(false);
    const [chomeTotal2040Visible, setChomeTotal2040Visible] = useState(false);
    const [chomeAging2040Visible, setChomeAging2040Visible] = useState(false);
    type ChomeMetric = "total" | "aging" | "density" | "total_2040" | "aging_2040";
    const hasAnyBusLegend = [
        busPassengerLayerVisible,
        sakaeCourseRideLayerVisible,
        sakaeCourseDropLayerVisible,
        masuoCourseRideLayerVisible,
        masuoCourseDropLayerVisible,
        shonanCourseRideLayerVisible,
        shonanCourseDropLayerVisible,
        sakaiRouteVisible,
        masuoRouteVisible,
        shonanRouteVisible,
    ].some(Boolean);
    // const hasAnyOtherLegend = someOtherLegendVisible || anotherLegendVisible;

    type BoolSetter = React.Dispatch<React.SetStateAction<boolean>>;

    // Keep only *layer* visibility setters here (no UI flags like chatOpen/isLoading)
    const LAYER_SETTERS: BoolSetter[] = [
        setRoadsVisible,
        setAdminVisible,
        setMeshVisible,

        setAgriLayerVisible,
        setTransportVisible,
        setPbFacilityVisible,
        setSchoolLayerVisible,
        setMedicalLayerVisible,
        setTouristLayerVisible,
        setRoadsideStationLayerVisible,

        setBusStopsVisible,
        setBoardingVisible,
        setAlightingVisible,
        setAttractionLayerVisible,
        setBusPickDropLayerVisible,
        setBusPassengerLayerVisible,

        setSakaeCourseRideLayerVisible,
        setSakaeCourseDropLayerVisible,
        setMasuoCourseRideLayerVisible,
        setMasuoCourseDropLayerVisible,
        setShonanCourseRideLayerVisible,
        setShonanCourseDropLayerVisible,

        setShonanRouteVisible,
        setMasuoRouteVisible,
        setSakaiRouteVisible,

        setNewBusLayerVisible,
        setNewKashiwakuruRideLayerVisible,
        setNewKashiwakuruDropLayerVisible,

        setKashiwaPublicFacilityVisible,
        setKashiwaShopsVisible,

        setKashiwakuruOdVisible,

        setChomeTotalVisible,
        setChomeAgingVisible,
        setChomeDensityVisible,
        setChomeTotal2040Visible,
        setChomeAging2040Visible,
    ];

    // Flip all at once
    const setAllLayersVisibility = (visible: boolean) => {
        LAYER_SETTERS.forEach(setter => setter(visible));
    };

    const getMeshLayerIds = useCallback((map: maplibregl.Map) => {
        const layers = map.getStyle()?.layers ?? [];
        return layers.map(l => l.id).filter(id => id.startsWith('mesh-'));
    }, []);

    // NEW — apply visibility to *all* mesh layers
    const applyMeshVisibility = useCallback((visible: boolean) => {
        const map = mapRef.current;
        if (!map) return;
        const v = visible ? 'visible' : 'none';
        getMeshLayerIds(map).forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }, [getMeshLayerIds]);

    // NEW — (re)build mesh layers, recolor by metric, then apply current toggle
    const rebuildMeshLayers = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;

        // Only re-add if they don't exist in this style yet
        if (getMeshLayerIds(map).length === 0) {
            addMeshLayers(map, selectedMetric);
        }

        // recolor to match current metric (your existing util)
        updateMetricStyles();

        // and finally respect the toggle
        applyMeshVisibility(meshVisible);
    }, [applyMeshVisibility, getMeshLayerIds, meshVisible, selectedMetric]);

    const toggleMesh = () => {
        const map = mapRef.current;
        if (!map) return;

        const next = !meshVisible;

        setIsLoading(true);

        // // if layers were lost (e.g., after style change) and user is turning ON,
        // // ensure they exist before making them visible
        // if (next && getMeshLayerIds(map).length === 0) {
        //     addMeshLayers(map, selectedMetric);
        //     updateMetricStyles();
        // }

        // applyMeshVisibility(next);
        // setMeshVisible(next);

        requestAnimationFrame(() => {
            if (next && getMeshLayerIds(map).length === 0) {
                // レイヤーが消えていて、ON にする場合は再追加
                addMeshLayers(map, selectedMetric);
                updateMetricStyles();

                // 新しいレイヤーが描画完了したら idle イベントで OFF
                map.once("idle", () => {
                    applyMeshVisibility(next);
                    setMeshVisible(next);
                    setIsLoading(false);
                });
            } else {
                // 既存レイヤーの可視状態だけ変える場合
                applyMeshVisibility(next);
                setMeshVisible(next);

                // 少し遅延させてローディング OFF (描画反映待ち)
                map.once("idle", () => setIsLoading(false));
            }
        });
    };


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

    // const GH_BASE = "https://aayushy02.github.io/map-data";

    // Helper: add the vector source once if it doesn't exist
    // function ensurePmtilesVectorSource(
    //     map: maplibregl.Map,
    //     id: string,
    //     pmtilesFilename: string
    // ) {
    //     if (map.getSource(id)) return;
    //     map.addSource(id, {
    //         type: "vector",
    //         url: `pmtiles://${GH_BASE}/${pmtilesFilename}`,
    //     });
    // }

    async function downloadPpt() {
        const map = mapRef.current;
        if (!map) {
            console.warn("Map not ready");
            return;
        }

        try {
            setIsLoading(true);

            // Ensure the canvas is fresh
            await new Promise<void>((resolve) => {
                map.once("render", () => resolve());
                map.triggerRepaint();
                setTimeout(() => resolve(), 300);
            });

            const canvas = map.getCanvas();
            const mapImageDataUrl = canvas.toDataURL("image/png");

            // Build the layers text from your visible layers list
            const labels = [...globalVisibleLayers];
            let layersText = labels.join(" | ");
            if (!layersText && selectedMetric === "PTN_2020") {
                layersText = "総人口（2020年）";
            }

            // --- PPT layout constants ---
            const pptx = new PptxGenJS();
            const slide = pptx.addSlide();

            const slideWidth = 10;
            const slideHeight = 5.63;
            const margin = 0.4;
            const usableWidth = slideWidth - 2 * margin;

            // --- Title (heading + layers on the same line) ---
            const titleY = margin - 0.4;
            const titleHeight = 0.6;

            // 1) Fixed-width heading (won’t wrap)
            const headW = 2.6; // tweak if your font changes
            slide.addText("（対象地域）：", {
                x: margin,
                y: titleY + 0.1,
                w: headW,
                h: titleHeight,
                fontSize: 18,
                bold: true,
                fontFace: "Arial",
            });

            // 2) Layers text box starts on the same line and wraps
            const layersFontSize = 12;
            const layersX = margin + headW + 0.1 - 0.7;             // small gap after the colon
            const layersW = usableWidth - headW - 0.1;

            // Simple token-based wrapping so we can estimate height for layout below
            const TOKENS = layersText ? layersText.split(" | ") : [];
            const MAX_CHARS_PER_LINE = 48; // rough fit for layersW; adjust if needed
            const LINE_H = 0.28;           // visual line-height for 12pt in this deck

            function wrapTokens(tokens: string[], maxChars: number) {
                const lines: string[] = [];
                let curr = "";
                for (const t of tokens) {
                    const seg = curr ? curr + " | " + t : t;
                    if (seg.length > maxChars) {
                        if (curr) lines.push(curr);
                        curr = t;
                    } else {
                        curr = seg;
                    }
                }
                if (curr) lines.push(curr);
                return lines;
            }

            const wrapped = TOKENS.length ? wrapTokens(TOKENS, MAX_CHARS_PER_LINE) : (layersText ? [layersText] : []);
            const layersBoxHeight = Math.max(LINE_H, wrapped.length * LINE_H);

            slide.addText(wrapped.join("\n"), {
                x: layersX,
                y: titleY + 0.1 + 0.12,     // same baseline as heading
                w: layersW,
                h: layersBoxHeight,  // tall enough for wrapped lines
                fontSize: layersFontSize,
                fontFace: "Arial",
                lineSpacingMultiple: 1.15,
            });

            // --- Blue bar placed after whichever is taller (heading vs wrapped layers) ---
            const afterTitleH = Math.max(titleHeight, layersBoxHeight);
            const barY = titleY + 0.1 + afterTitleH + 0.12;
            const barHeight = 0.03;

            slide.addShape(pptx.ShapeType.rect, {
                x: margin,
                y: barY,
                w: usableWidth,
                h: barHeight,
                fill: { color: "0070C0" },
            });

            // --- Lead texts (shifted down) ---
            const lead1Y = barY + 0.2;
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

            // --- Map image (fits below lead text) ---
            const imageTopY = lead1Y + 1.0;
            const imageBottomY = slideHeight - margin - 0.2; // reserve for footer
            const imageMaxHeight = imageBottomY - imageTopY;

            const imgOriginalWidth = canvas.width;
            const imgOriginalHeight = canvas.height;
            const imageAspect = imgOriginalWidth / imgOriginalHeight;

            const imageWidth = usableWidth;
            let imageHeight = imageWidth / imageAspect + 1;
            if (imageHeight > imageMaxHeight) imageHeight = imageMaxHeight;

            slide.addImage({
                data: mapImageDataUrl,
                x: margin,
                y: imageTopY,
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

    // const ROAD_LAYER_IDS = [
    //     'road', 'road-street', 'road-street-low', 'road-secondary-tertiary',
    //     'road-primary', 'road-trunk', 'road-motorway', 'road-rail', 'road-path', 'road-network'
    // ];

    // const toggleRoads = () => {
    //     const map = mapRef.current;
    //     if (!map) return;
    //     const visibility = roadsVisible ? 'none' : 'visible';
    //     ROAD_LAYER_IDS.forEach(id => {
    //         if (map.getLayer(id)) {
    //             map.setLayoutProperty(id, 'visibility', visibility);
    //         }
    //     });
    //     setRoadsVisible(!roadsVisible);
    // };


    // Detect road layers (strokes + optional labels) from the *current* style
    function getRoadLayerIds(map: maplibregl.Map) {
        const layers = map.getStyle().layers ?? [];
        const strokeIds: string[] = [];
        const labelIds: string[] = [];

        for (const layer of layers) {
            const id = layer.id;
            const type = (layer as any).type;
            const sourceLayer = (layer as any)['source-layer'];

            // Road strokes in MapTiler styles use source-layer "transportation" (type usually "line")
            if (sourceLayer === 'transportation' && (type === 'line' || type === 'fill')) {
                strokeIds.push(id);
                continue;
            }
            // Road labels use "transportation_name" (type "symbol")
            if (sourceLayer === 'transportation_name' && type === 'symbol') {
                labelIds.push(id);
                continue;
            }

            // Fallback: match common id patterns if source-layer isn’t present (rare)
            if (/road|transport|street|bridge|tunnel/i.test(id)) {
                if (type === 'symbol') labelIds.push(id);
                else strokeIds.push(id);
            }
        }
        return { strokeIds, labelIds };
    }

    // Toggle roads (strokes + labels). If you want to keep labels, remove the labelIds loop.
    const toggleRoads = () => {
        const map = mapRef.current;
        if (!map) return;

        const visibility = roadsVisible ? 'none' : 'visible';
        const { strokeIds, labelIds } = getRoadLayerIds(map);

        [...strokeIds, ...labelIds].forEach((id) => {
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

        // if (isKashiwaBounds) {
        //     // Fit map to Kashiwa bounds
        //     map.fitBounds(KASHIWA_BOUNDS, {
        //         padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Padding for better view
        //         duration: 1000 // Smooth transition duration
        //     });
        //     map.setMaxBounds(KASHIWA_BOUNDS); // Limit panning to Kashiwa bounds
        // } else {
        //     // Fit map to Chiba bounds
        //     map.fitBounds(CHIBA_BOUNDS, {
        //         padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Padding for better view
        //         duration: 1000 // Smooth transition duration
        //     });
        //     map.setMaxBounds(CHIBA_BOUNDS); // Limit panning to Chiba bounds
        // }

        // // Toggle the state for the next time
        // setIsKashiwaBounds(!isKashiwaBounds);


        // If we're NOT in Kashiwa mode yet, go TO Kashiwa and clamp to it.
        // Next click: go TO Chiba and clamp to it. (Toggles back and forth.)
        const target = !isKashiwaBounds ? KASHIWA_BOUNDS : CHIBA_BOUNDS;
        fitAndClamp(map, target, true);

        setIsKashiwaBounds(!isKashiwaBounds);

    };

    function downloadMapScreenshot(map: maplibregl.Map, fileName = 'map-screenshot.png') {
        const originalCanvas = map.getCanvas();

        map.once('render', () => {
            try {
                // Create a new canvas to draw map + attribution
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = originalCanvas.width;
                exportCanvas.height = originalCanvas.height;

                const ctx = exportCanvas.getContext('2d');
                if (!ctx) throw new Error('Canvas context not available');

                // Draw the map first
                ctx.drawImage(originalCanvas, 0, 0);

                // Attribution text
                const text = '© MaplibreGL © OpenStreetMap';
                ctx.font = '14px Arial';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';

                // Optional: background for readability
                const padding = 4;
                const metrics = ctx.measureText(text);
                const textHeight = 16;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(
                    exportCanvas.width - metrics.width - padding * 2 - 10,
                    exportCanvas.height - textHeight - padding,
                    metrics.width + padding * 2,
                    textHeight + padding
                );

                // Draw text flush with the bottom edge
                ctx.fillStyle = 'black';
                ctx.fillText(text, exportCanvas.width - 10, exportCanvas.height - 2);

                // Export image
                const dataURL = exportCanvas.toDataURL('image/png');
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

        map.triggerRepaint();
    }

    const handleStyleChange = (styleUrl: string) => {
        const map = mapRef.current;
        if (!map) return;

        setIsLoading(true);
        const nextMetric = 'PTN_2020';
        setSelectedMetric(nextMetric);

        setAllLayersVisibility(false);
        setChatOpen(false);
        
        map.setStyle(styleUrl);

        map.once('idle', () => setIsLoading(false));

    };

    function fitAndClamp(
        map: maplibregl.Map,
        bounds: maplibregl.LngLatBoundsLike,
        clampAfter: boolean
    ) {
        map.setMaxBounds(null); // free the camera to animate
        map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 800
        });
        map.once('moveend', () => {
            if (clampAfter) {
                map.setMaxBounds(bounds);
                clampRef.current = bounds;     // <-- remember active clamp
            } else {
                clampRef.current = null;       // <-- no clamp
            }
        });
    }
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

        let protocol = new Protocol();
        maplibregl.addProtocol('pmtiles', protocol.tile)

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: currentStyle,
            center: [139.9797, 35.8676],
            zoom: 5.5,
            minZoom: 4.5,
            maxZoom: 18,
            maxBounds: JAPAN_BOUNDS,
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
            // map.flyTo({
            //     center: [139.9797, 35.8676],
            //     zoom: 10,
            //     speed: 1.2,
            //     curve: 1,
            //     essential: true
            // });

            // map.once('moveend', () => {
            //     map.setMaxBounds(CHIBA_BOUNDS);
            // });

            // Show Japan first (constructor uses maxBounds: JAPAN_BOUNDS),
            // then fly to Chiba once the map idles and CLAMP to Chiba.
            map.once('idle', () => {
                fitAndClamp(map, CHIBA_BOUNDS, true);
            });

            map.getStyle().layers?.forEach(layer => {
                if (layer.type === 'symbol' && ['poi-label', 'road-label', 'waterway-label'].some(id => layer.id.startsWith(id))) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });

            rebuildMeshLayers();                 // ← replace addMeshLayers + manual color with this
            ensureHighlightLayer();

            map.once('idle', () => setIsLoading(false));


        });

        map.on('style.load', () => {
            rebuildMeshLayers();                 // ← guarantees meshes come back for the new style
            ensureHighlightLayer();
            if (clampRef.current) {
                map.setMaxBounds(clampRef.current);
            }
        });

        // const showPopup = (e: maplibregl.MapMouseEvent) => {
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

        ['mesh-500m-fill', 'mesh-1km-fill', 'mesh-250m-fill'].forEach(layer => {
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
                (map.getSource('clicked-mesh') as maplibregl.GeoJSONSource).setData(geojson);

                // 3️⃣ Show / update the *selection* popup with the "Ask Mirai AI" button
                if (selectionPopupRef.current) {
                    selectionPopupRef.current.remove();
                }

                const selectionPopup = new maplibregl.Popup({ closeButton: false, offset: 0, className: "ai-popup" })
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

        map.on('mousemove', 'kashiwakuru-od-line', (e) => {                      // ⬅ NEW
            const feature = e.features?.[0];
            if (feature) {
                map.getCanvas().style.cursor = 'pointer';
                const p = feature.properties || {};
                const html = `
      <div class="rounded-xl border bg-white p-4 shadow-xl text-xs space-y-1 w-64">
        <div><strong>O→D:</strong> ${p.origin} → ${p.destination}</div>
        <div><strong>時間帯:</strong> ${p.timeband}</div>
        <div><strong>トリップ数:</strong> ${p.count}</div>
      </div>
    `;
                transportPopupRef.setLngLat(e.lngLat).setHTML(html).addTo(map);
            }
        });

        map.on('mouseleave', 'kashiwakuru-od-line', () => {                      // ⬅ NEW
            map.getCanvas().style.cursor = '';
            transportPopupRef.remove();
        });


        const showKashiwaPublicFacilityPopup = (e: maplibregl.MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point);
            if (!features.length) return; // No features found

            const feature = features[0];
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


        const showKashiwaShopsPopup = (e: maplibregl.MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point);

            if (!features.length) return; // No features found

            const feature = features[0];
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

        return () => {
            maplibregl.removeProtocol('pmtiles');
        };

    }, []);

    const onClearOdEndpointHighlight = () => {
        if (mapRef.current) clearOdEndpointFocus(mapRef.current);
    };

    const onToggleKashiwakuruOdFilter = (enabled: boolean) => {
        setKashiwakuruOdFilterOn(enabled);
        if (!mapRef.current) return;
        setKashiwakuruOdFilter(mapRef.current, enabled, kashiwakuruOdHour);
    };

    const onKashiwakuruOdHourChange = (h: number) => {
        setKashiwakuruOdHourState(h);
        if (!mapRef.current) return;
        if (kashiwakuruOdFilterOn) {
            setKashiwakuruOdHour(mapRef.current, h); // strict filter only when filter mode is enabled
        }
    };


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

    // metric = "total" | "aging" | "density"
    // opts = { palette?: "Blues"|"Greens"|"Oranges"|"Purples"; method?: "quantile"|"equal"|"jenks"; bins?: number; opacity?: number }
    const onChomeStyleChange = (
        metric: ChomeMetric,
        opts: { palette?: "Blues" | "Greens" | "Oranges" | "Purples"; method?: "quantile" | "equal" | "jenks"; bins?: number; opacity?: number }
    ) => {
        const map = mapRef.current!;
        updateKashiwaChomeStyle(map, metric, opts);
    };

    // Range filter: pass null for open-ended
    const onChomeRangeChange = (
        metric: ChomeMetric,
        min: number | null,
        max: number | null
    ) => {
        const map = mapRef.current!;
        setKashiwaChomeRangeFilter(map, metric, min, max);
    };

    // Labels toggle: mode = "name" | "metric"; if metric labels, specify which metric
    const onChomeLabelsChange = (
        visible: boolean,
        mode: "name" | "metric",
        metric: ChomeMetric
    ) => {
        const map = mapRef.current!;
        setKashiwaChomeLabelsVisible(map, visible, mode, metric);
    };


    const hasAnyFacilities = selectedCategories.length > 0;
    const hasAnyKashiwakuru = newBusLayerVisible || newKashiwakuruRideLayerVisible || newKashiwakuruDropLayerVisible;
    const hasAnyShops = selectedShopCategories.includes("") ||
        shopCategoriesLegend.some(c => c.category && selectedShopCategories.includes(c.category));
    const hasAnyOdLegend = kashiwakuruOdVisible;

    const hasAnyChomeLegend =
        chomeTotalVisible || chomeAgingVisible || chomeDensityVisible || chomeTotal2040Visible || chomeAging2040Visible;


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
                        className="absolute top-0 left-0 z-40 h-full w-[400px]"
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
                // terrainEnabled={terrainEnabled}
                // toggleTerrain={() => toggleTerrain(mapRef.current!, terrainEnabled, setTerrainEnabled)}
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
                toggleMasuoCourseDropLayerVisible={() => toggleMasuoCourseDropLayer(mapRef.current!, masuoCourseDropLayerVisible, setIsLoading, setMasuoCourseDropLayerVisible)}
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

                shonanRouteVisible={shonanRouteVisible}
                toggleShonanRouteVisible={() =>
                    toggleShonanRoute(mapRef.current!, shonanRouteVisible, setIsLoading, setShonanRouteVisible)
                }

                masuoRouteVisible={masuoRouteVisible}
                toggleMasuoRouteVisible={() =>
                    toggleMasuoRoute(mapRef.current!, masuoRouteVisible, setIsLoading, setMasuoRouteVisible)
                }

                sakaiRouteVisible={sakaiRouteVisible}
                toggleSakaiRouteVisible={() =>
                    toggleSakaiRoute(mapRef.current!, sakaiRouteVisible, setIsLoading, setSakaiRouteVisible)
                }

                kashiwakuruOdVisible={kashiwakuruOdVisible}
                toggleKashiwakuruOdVisible={() => {
                    toggleKashiwakuruOdLayer(
                        mapRef.current!,
                        kashiwakuruOdVisible,
                        setIsLoading,
                        setKashiwakuruOdVisible,
                        kashiwakuruOdHour,
                        transportPopupRef
                    );

                    // If we just turned the layer ON, force "show all" and turn filter mode OFF.
                    const nowVisible = !kashiwakuruOdVisible;
                    if (nowVisible && mapRef.current) {
                        setKashiwakuruOdFilterOn(false);
                        showAllKashiwakuruOd(mapRef.current);
                    }
                }}
                kashiwakuruOdFilterOn={kashiwakuruOdFilterOn}                 // NEW
                onToggleKashiwakuruOdFilter={onToggleKashiwakuruOdFilter}     // NEW
                kashiwakuruOdHour={kashiwakuruOdHour}
                onKashiwakuruOdHourChange={onKashiwakuruOdHourChange}         // UPDATED
                onClearOdEndpointHighlight={onClearOdEndpointHighlight}

                chomeTotalVisible={chomeTotalVisible}
                toggleChomeTotalVisible={() =>
                    toggleKashiwaChomeTotalLayer(
                        mapRef.current!, chomeTotalVisible, setIsLoading, setChomeTotalVisible, transportPopupRef
                    )
                }

                chomeAgingVisible={chomeAgingVisible}
                toggleChomeAgingVisible={() =>
                    toggleKashiwaChomeAgingLayer(
                        mapRef.current!, chomeAgingVisible, setIsLoading, setChomeAgingVisible, transportPopupRef
                    )
                }

                chomeDensityVisible={chomeDensityVisible}
                toggleChomeDensityVisible={() =>
                    toggleKashiwaChomeDensityLayer(
                        mapRef.current!, chomeDensityVisible, setIsLoading, setChomeDensityVisible, transportPopupRef
                    )
                }

                chomeTotal2040Visible={chomeTotal2040Visible}
                toggleChomeTotal2040Visible={() =>
                    toggleKashiwaChomeTotal2040Layer(
                        mapRef.current!, chomeTotal2040Visible, setIsLoading, setChomeTotal2040Visible, transportPopupRef
                    )
                }
                chomeAging2040Visible={chomeAging2040Visible}
                toggleChomeAging2040Visible={() =>
                    toggleKashiwaChomeAging2040Layer(
                        mapRef.current!, chomeAging2040Visible, setIsLoading, setChomeAging2040Visible, transportPopupRef
                    )
                }

                onChomeStyleChange={onChomeStyleChange}
                onChomeRangeChange={onChomeRangeChange}
                onChomeLabelsChange={onChomeLabelsChange}
                downloadPpt={downloadPpt}

                meshVisible={meshVisible}            // NEW
                toggleMesh={toggleMesh}

            />

            {/* <Legend selectedMetric={selectedMetric} /> */}
            <LegendsStack visible={hasAnyBusLegend || hasAnyFacilities || hasAnyKashiwakuru || hasAnyShops || hasAnyOdLegend || hasAnyChomeLegend} width="w-80">
                <AnimatePresence mode="popLayout">
                    {hasAnyBusLegend && (
                        <motion.div
                            key="legend-bus"
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="w-full"
                        >
                            <BusPassengerLayerLegend
                                className="w-full" // fills stack width
                                busPassengerLayerVisible={busPassengerLayerVisible}
                                sakaeCourseRideLayerVisible={sakaeCourseRideLayerVisible}
                                sakaeCourseDropLayerVisible={sakaeCourseDropLayerVisible}
                                masuoCourseRideLayerVisible={masuoCourseRideLayerVisible}
                                masuoCourseDropLayerVisible={masuoCourseDropLayerVisible}
                                shonanCourseRideLayerVisible={shonanCourseRideLayerVisible}
                                shonanCourseDropLayerVisible={shonanCourseDropLayerVisible}
                                sakaiRouteVisible={sakaiRouteVisible}
                                masuoRouteVisible={masuoRouteVisible}
                                shonanRouteVisible={shonanRouteVisible}
                            />
                        </motion.div>
                    )}

                    {hasAnyFacilities && (
                        <motion.div
                            key="legend-facilities"
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="w-full"
                        >
                            <KashiwaPublicFacilitiesLegend
                                className="w-full"
                                categories={facilityCategories}
                                selectedCategories={selectedCategories}
                            />
                        </motion.div>
                    )}

                    {hasAnyKashiwakuru && (
                        <motion.div
                            key="legend-kashiwakuru"
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="w-full"
                        >
                            <KashiwakuruStopsLegend
                                className="w-full"
                                newbusLayerVisible={newBusLayerVisible}
                                newKashiwakuruRideLayerVisible={newKashiwakuruRideLayerVisible}
                                newKashiwakuruDropLayerVisible={newKashiwakuruDropLayerVisible}

                            />
                        </motion.div>
                    )}

                    {hasAnyShops && (
                        <motion.div
                            key="legend-shops"
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="w-full"
                        >
                            <KashiwaShopsLegend
                                className="w-full"
                                categories={shopCategoriesLegend}
                                selectedCategories={selectedShopCategories}
                            />
                        </motion.div>
                    )}


                    { /* OD legend */}
                    {kashiwakuruOdVisible && (
                        <motion.div
                            key="legend-od"
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="w-full"
                        >
                            <KashiwakuruOdLegend
                                className="w-full"
                                visible={kashiwakuruOdVisible}
                                filterOn={kashiwakuruOdFilterOn}
                                hour={kashiwakuruOdHour}
                            />
                        </motion.div>
                    )}

                    {hasAnyChomeLegend && (
                        <motion.div
                            key="legend-chome"
                            layout
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="w-full"
                        >
                            <KashiwaChomePopulationLegend
                                map={mapRef.current || undefined}
                                totalVisible={chomeTotalVisible}
                                agingVisible={chomeAgingVisible}
                                densityVisible={chomeDensityVisible}
                                total2040Visible={chomeTotal2040Visible}
                                aging2040Visible={chomeAging2040Visible}
                            />
                        </motion.div>
                    )}

                </AnimatePresence>
            </LegendsStack>





            <h1 className={`absolute top-3 left-3 z-10 ${currentStyle === MAP_STYLES.ダーク ? "text-white" : "text-black"} text-lg font-mono rounded-2xl`}>
                FrameArk 1.0 Beta
            </h1>
            {!chatOpen && !chatMeshId && (
                <Card className='absolute bottom-10 right-3 z-10 text-black font-extrabold bg-white p-3 rounded-2xl'>
                    <h1>{cardTitle}</h1>
                </Card>
            )
            }

            <div ref={mapContainerRef} className="w-full h-full" />
        </div>
    );
}


