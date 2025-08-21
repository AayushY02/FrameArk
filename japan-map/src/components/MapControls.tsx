// components/MapControls.tsx
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import {
    Layers,
    // Mountain,
    Ruler,
    Landmark,
    MapPin,
    Building,
    Bus,
    School,
    Hospital,
    Users,
    X,
    Menu,
    BusFront,
    MapPinCheckIcon,
    User2,
    Circle,
    ShoppingBasket,
    Store,
    ShoppingBag,
    NotepadTextDashed,
    Mountain,

} from 'lucide-react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// import { useRecoilState } from 'recoil';
// import { masuoCourseDropLayerVisibleState } from '@/state/layers';
// import { toggleMasuoCourseRideLayer } from '@/layers/busPassengerLayer';
import { useSetRecoilState } from "recoil";
import { globalVisibleLayersState } from '@/state/activeLayersAtom';
import { Slider } from './ui/slider';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal, Filter, Type } from 'lucide-react';
import { Input } from './ui/input';

// const allCourses = ['逆井 コース', '南増尾 コース', '沼南コース'];


type ChomeMetric = "total" | "aging" | "density" | "total_2040" | "aging_2040";

interface MapControlsProps {
    currentStyle: string;
    onStyleChange: (value: string) => void;
    roadsVisible: boolean;
    toggleRoads: () => void;
    adminVisible: boolean;
    toggleAdmin: () => void;
    // terrainEnabled: boolean;
    // toggleTerrain: () => void;
    fitToBounds: () => void;
    agriLayerVisible: boolean;
    toggleAgri: () => void;
    selectedMetric: string;
    onMetricChange: (val: string) => void;
    styles: Record<string, string>;
    transportVisible: boolean;
    toggleTransport: () => void;
    pbFacilityVisible: boolean;
    togglePbFacility: () => void;
    schoolLayerVisible: boolean;
    toggleSchoolLayer: () => void;
    medicalLayerVisible: boolean;
    toggleMedicalLayer: () => void;
    touristLayerVisible: boolean;
    toggleTouristLayer: () => void;
    roadsideStationLayerVisible: boolean;
    toggleAttractionLayer: () => void;
    attractionLayerVisible: boolean;
    toggleRoadsideStationLayerVisible: () => void;
    busStopsVisible: boolean;
    toggleBusStops: () => void;

    boardingVisible: boolean;
    toggleBoarding: () => void;

    alightingVisible: boolean;
    toggleAlighting: () => void;

    busPickDropLayerVisible: boolean;
    toggleBusPickDropLayerVisible: () => void;
    busPassengerLayerVisible: boolean;
    toggleBusPassengerLayerVisible: () => void;
    sakaeCourseRideLayerVisible: boolean;
    toggleSakaeCourseRideLayerVisible: () => void;
    sakaeCourseDropLayerVisible: boolean;
    toggleSakaeCourseDropLayerVisible: () => void;
    masuoCourseRideLayerVisible: boolean;
    toggleMasuoCourseRideLayerVisible: () => void;
    masuoCourseDropLayerVisible: boolean;
    toggleMasuoCourseDropLayerVisible: () => void;

    shonanCourseRideLayerVisible: boolean;
    toggleShonanCourseRideLayerVisible: () => void;
    shonanCourseDropLayerVisible: boolean;
    toggleShonanCourseDropLayerVisible: () => void;
    captureMapScreenshot: () => void

    newbusLayerVisible: boolean;
    toggleNewBusLayerVisible: () => void;

    newKashiwakuruRideLayerVisible: boolean;
    toggleNewKashiwakuruRideLayerVisible: () => void;

    newKashiwakuruDropLayerVisible: boolean;
    toggleNewKashiwakuruDropLayerVisible: () => void;

    kashiwaPublicFacilityVisible: boolean;
    toggleKashiwaPublicFacilityVisible: (category: string) => void;
    selectedCategories: string[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;

    toggleKashiwaShopsVisible: (category: string) => void;
    selectedShopCategories: string[];

    shonanRouteVisible: boolean;
    toggleShonanRouteVisible: () => void;

    masuoRouteVisible: boolean;
    toggleMasuoRouteVisible: () => void;

    sakaiRouteVisible: boolean;
    toggleSakaiRouteVisible: () => void;

    kashiwakuruOdVisible: boolean;
    toggleKashiwakuruOdVisible: () => void;
    kashiwakuruOdHour: number;
    onKashiwakuruOdHourChange: (h: number) => void;
    onClearOdEndpointHighlight: () => void;
    downloadPpt: () => void;

    kashiwakuruOdFilterOn: boolean;                   // NEW
    onToggleKashiwakuruOdFilter: (on: boolean) => void;

    chomeTotalVisible: boolean;
    toggleChomeTotalVisible: () => void;
    chomeAgingVisible: boolean;
    toggleChomeAgingVisible: () => void;
    chomeDensityVisible: boolean;
    toggleChomeDensityVisible: () => void;

    onChomeStyleChange: (
        metric: ChomeMetric,
        opts: { palette?: "Blues" | "Greens" | "Oranges" | "Purples"; method?: "quantile" | "equal" | "jenks"; bins?: number; opacity?: number }
    ) => void;

    onChomeRangeChange: (
        metric: ChomeMetric,
        min: number | null,
        max: number | null
    ) => void;

    onChomeLabelsChange: (
        visible: boolean,
        mode: "name" | "metric",
        metric: ChomeMetric,
    ) => void;

    chomeTotal2040Visible: boolean;
    toggleChomeTotal2040Visible: () => void;
    chomeAging2040Visible: boolean;
    toggleChomeAging2040Visible: () => void;

    meshVisible: boolean;
    toggleMesh: () => void;

    terrainEnabled: boolean;
    toggleTerrain: () => void;

}

export default function MapControls({
    currentStyle,
    onStyleChange,
    roadsVisible,
    toggleRoads,
    adminVisible,
    toggleAdmin,
    // terrainEnabled,
    // toggleTerrain,
    fitToBounds,
    agriLayerVisible,
    toggleAgri,
    selectedMetric,
    onMetricChange,
    styles,
    transportVisible,
    toggleTransport,
    pbFacilityVisible,
    togglePbFacility,
    schoolLayerVisible,
    toggleSchoolLayer,
    medicalLayerVisible,
    toggleMedicalLayer,
    touristLayerVisible,
    toggleTouristLayer,
    roadsideStationLayerVisible,
    toggleRoadsideStationLayerVisible,
    busStopsVisible,
    toggleBusStops,
    toggleAttractionLayer,
    attractionLayerVisible,
    busPickDropLayerVisible,
    toggleBusPickDropLayerVisible,
    busPassengerLayerVisible,
    toggleBusPassengerLayerVisible,
    sakaeCourseRideLayerVisible,
    toggleSakaeCourseRideLayerVisible,
    sakaeCourseDropLayerVisible,
    toggleSakaeCourseDropLayerVisible,

    masuoCourseRideLayerVisible,
    toggleMasuoCourseRideLayerVisible,
    masuoCourseDropLayerVisible,
    toggleMasuoCourseDropLayerVisible,

    shonanCourseRideLayerVisible,
    toggleShonanCourseRideLayerVisible,
    shonanCourseDropLayerVisible,
    toggleShonanCourseDropLayerVisible,
    downloadPpt,


    newbusLayerVisible,
    toggleNewBusLayerVisible,

    newKashiwakuruRideLayerVisible,
    toggleNewKashiwakuruRideLayerVisible,

    newKashiwakuruDropLayerVisible,
    toggleNewKashiwakuruDropLayerVisible,

    toggleKashiwaPublicFacilityVisible,
    selectedCategories,

    toggleKashiwaShopsVisible,
    selectedShopCategories,

    shonanRouteVisible,
    toggleShonanRouteVisible,
    masuoRouteVisible,
    toggleMasuoRouteVisible,
    sakaiRouteVisible,
    toggleSakaiRouteVisible,

    kashiwakuruOdVisible,
    toggleKashiwakuruOdVisible,
    kashiwakuruOdHour,
    onKashiwakuruOdHourChange,
    onClearOdEndpointHighlight,
    captureMapScreenshot,
    kashiwakuruOdFilterOn,
    onToggleKashiwakuruOdFilter,

    chomeTotalVisible,
    toggleChomeTotalVisible,
    chomeAgingVisible,
    toggleChomeAgingVisible,
    chomeDensityVisible,
    toggleChomeDensityVisible,
    onChomeStyleChange,

    onChomeRangeChange,

    onChomeLabelsChange,
    chomeTotal2040Visible,
    toggleChomeTotal2040Visible,
    chomeAging2040Visible,
    toggleChomeAging2040Visible,

    meshVisible,
    toggleMesh,

    terrainEnabled,
    toggleTerrain

}: MapControlsProps) {

    const [isOpen, setIsOpen] = useState(false);
    const setGlobalVisibleLayers = useSetRecoilState(globalVisibleLayersState);

    // target metric whose style/filter you’re editing
    const [chomeTarget, setChomeTarget] = useState<ChomeMetric>("total");
    const isAgingMetric = chomeTarget === "aging" || chomeTarget === "aging_2040";

    // style controls
    const [chomePalette, setChomePalette] = useState<"Blues" | "Greens" | "Oranges" | "Purples">("Purples");
    const [chomeMethod, setChomeMethod] = useState<"quantile" | "equal" | "jenks">("quantile");
    const [chomeBins, setChomeBins] = useState<number>(5);       // 3–7 sensible
    const [chomeOpacity, setChomeOpacity] = useState<number>(70); // 30–100 as percent

    // range filter
    const [chomeMin, setChomeMin] = useState<string>("");
    const [chomeMax, setChomeMax] = useState<string>("");

    // labels
    const [chomeLabelsOn, setChomeLabelsOn] = useState<boolean>(false);
    const [chomeLabelsMode, setChomeLabelsMode] = useState<"name" | "metric">("name");
    const [chomeLabelsMetric, setChomeLabelsMetric] = useState<ChomeMetric>("total");
    // 町丁目フィルターの開閉
    const [chomeFiltersOpen, setChomeFiltersOpen] = useState(false);

    function resetChomeUIAndLayers() {
        // Reset UI state
        setChomeTarget("total");
        setChomePalette("Purples");
        setChomeMethod("quantile");
        setChomeBins(5);
        setChomeOpacity(70);
        setChomeMin("");
        setChomeMax("");
        setChomeLabelsOn(false);
        setChomeLabelsMode("name");
        setChomeLabelsMetric("total");

        // Reset layers to defaults (safe regardless of visibility)
        const defaults = {
            total: { palette: "Purples" as const, method: "quantile" as const, bins: 5, opacity: 0.7 },
            aging: { palette: "Greens" as const, method: "quantile" as const, bins: 5, opacity: 0.7 },
            density: { palette: "Oranges" as const, method: "quantile" as const, bins: 5, opacity: 0.7 },
            total_2040: { palette: "Blues" as const, method: "quantile" as const, bins: 5, opacity: 0.7 },
            aging_2040: { palette: "Greens" as const, method: "quantile" as const, bins: 5, opacity: 0.7 },
        };

        (["total", "aging", "density", "total_2040", "aging_2040"] as const).forEach((metric) => {
            onChomeStyleChange(metric, defaults[metric]);   // default palette/method/bins/opacity
            onChomeRangeChange(metric, null, null);         // clear range filter
        });

        // Labels off
        onChomeLabelsChange(false, "name", "total");
    }

    useEffect(() => {
        if (!chomeFiltersOpen) return;
        onChomeStyleChange(chomeTarget, {
            palette: chomePalette,
            method: chomeMethod,
            bins: chomeBins,
            opacity: chomeOpacity / 100,
        });

    }, [chomeFiltersOpen, chomeTarget, chomePalette, chomeMethod, chomeBins, chomeOpacity]);


    useEffect(() => {
        if (!chomeFiltersOpen) return;
        const rawMin = chomeMin === "" ? null : Number(chomeMin);
        const rawMax = chomeMax === "" ? null : Number(chomeMax);
        const toProp = (v: number | null) => (v == null ? null : isAgingMetric ? v / 100 : v); // % → ratio for aging metrics

        const t = setTimeout(() => {
            onChomeRangeChange(chomeTarget, toProp(rawMin), toProp(rawMax));
        }, 200);
        return () => clearTimeout(t);

    }, [chomeFiltersOpen, chomeTarget, chomeMin, chomeMax]);


    useEffect(() => {
        if (!chomeFiltersOpen) return;
        onChomeLabelsChange(chomeLabelsOn, chomeLabelsMode, chomeLabelsMetric);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chomeFiltersOpen, chomeLabelsOn, chomeLabelsMode, chomeLabelsMetric]);

    const metricLabels: Record<string, string> = {
        PTN_2020: '総人口（2020年）',
        PTC_2020: '65歳以上の人口（2020年）',
        PTA_2020: '0〜14歳の人口（2020年）',
        ELDERLY_RATIO: '高齢者比率（65歳以上／総人口）',
    };

    function handleLayerToggle(
        layerName: string,
        layerCurrentState: boolean,
        toggleFunction: () => void,
    ) {
        setGlobalVisibleLayers((prev) => {
            if (!layerCurrentState) {
                // Hidden → visible: add to array
                if (!prev.includes(layerName)) {
                    return [...prev, layerName];
                }
                return prev;
            } else {
                // Visible → hidden: remove from array
                return prev.filter((name) => name !== layerName);
            }
        });

        toggleFunction();
    }
    const anyChomeLayerOn =
        chomeTotalVisible ||
        chomeAgingVisible ||
        chomeDensityVisible ||
        chomeTotal2040Visible ||
        chomeAging2040Visible;


    return (
        <div className="absolute right-3 top-3 z-10 max-h-screen w-fit flex flex-col items-end">
            {/* Toggle Button */}
            <Button
                className="px-4 py-2 bg-white/50 backdrop-blur-2xl hover:bg-[#f2f2f2] cursor-pointer text-black rounded-full shadow-md text-sm mb-2 flex items-center gap-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="map-controls"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="overflow-y-auto px-4 py-4 flex flex-col space-y-3 bg-white/50 backdrop-blur-2xl rounded-2xl shadow-2xl w-72 sm:w-80 max-h-[75vh]"
                    >
                        {/* Map style selector */}
                        <Select value={currentStyle} onValueChange={onStyleChange}>
                            <SelectTrigger className="w-full px-4 py-2 text-sm bg-white rounded-xl text-black shadow border border-gray-200">
                                <SelectValue placeholder="地図スタイルを選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(styles).map(([label, url]) => (
                                    <SelectItem key={url} value={url}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Layer Toggles */}
                        <Button className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer" onClick={captureMapScreenshot}>
                            <MapPinCheckIcon />
                            画像をエクスポート
                        </Button>
                        <Button className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer" onClick={downloadPpt}>
                            <NotepadTextDashed />
                            パワーポイントにエクスポート
                        </Button>
                        <Button className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer" onClick={fitToBounds}>
                            <MapPinCheckIcon />
                            柏市にフォーカス
                        </Button>

                        {/* <div className="flex items-center justify-between absolute top-4 right-4 z-50">
                            <Label className="text-sm text-black flex items-center gap-2">
                                <MapPinCheckIcon /> 柏市にフォーカス
                            </Label>
                            <Switch
                                checked={isKashiwaBounds}
                                onCheckedChange={(checked) => {
                                    setIsKashiwaBounds(checked);  // Update the state
                                    fitToBounds(checked);          // Apply bounds change
                                }}
                                className="w-12 h-6 bg-gray-200 rounded-full" // Adjust styling as per your design
                            />
                        </div> */}

                        <Button
                            onClick={() => handleLayerToggle('メッシュ', meshVisible, toggleMesh)}
                            className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer"
                        >
                            <Layers size={16} />
                            {meshVisible ? 'メッシュを非表示' : 'メッシュを表示'}
                        </Button>

                        <Button
                            onClick={toggleTerrain}
                            className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer"
                            aria-pressed={terrainEnabled}
                        >
                            <Mountain size={16} />
                            {terrainEnabled ? '3D地形を無効化' : '3D地形を有効化'}
                        </Button>

                        <Button onClick={() => handleLayerToggle('道路', roadsVisible, toggleRoads)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Ruler size={16} />
                            {roadsVisible ? '道路を非表示' : '道路を表示'}
                        </Button>
                        <Button onClick={() => handleLayerToggle('行政界', adminVisible, toggleAdmin)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer"><Layers />{adminVisible ? '行政界を非表示' : '行政界を表示'}</Button>
                        {/* <Button onClick={() => handleLayerToggle('地形', terrainEnabled, toggleTerrain)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer"><Mountain />{terrainEnabled ? '地形を非表示' : '地形を表示'}</Button> */}
                        <Button onClick={() => handleLayerToggle('農業レイヤー', agriLayerVisible, toggleAgri)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer"><Landmark />{agriLayerVisible ? '農業レイヤーを非表示' : '農業レイヤーを表示'}</Button>

                        {/* Transport Accordion */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <BusFront size={16} />交通レイヤーの操作
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: '交通レイヤー', checked: transportVisible, onChange: () => handleLayerToggle('交通レイヤー', transportVisible, toggleTransport), icon: <Bus size={16} /> },
                                        { label: 'バス停', checked: busStopsVisible, onChange: () => handleLayerToggle('バス停', busStopsVisible, toggleBusStops), icon: <MapPin size={16} /> },
                                        { label: 'カシワニクル乗降場', checked: busPickDropLayerVisible, onChange: () => handleLayerToggle('カシワニクル乗降場', busPickDropLayerVisible, toggleBusPickDropLayerVisible), icon: <Users size={16} /> },
                                        // { label: 'バス乗降データ', checked: busPassengerLayerVisible, onChange: () => handleLayerToggle('バス乗降データ', busPassengerLayerVisible, toggleBusPassengerLayerVisible), icon: <Users size={16} /> }
                                        // { label: '降車データ', checked: alightingVisible, onChange: toggleAlighting, icon: <Users size={16} /> },
                                    ].map(({ label, checked, onChange, icon }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <Label className="text-sm text-black flex items-center gap-2">{icon} {label}</Label>
                                            <Switch checked={checked} onCheckedChange={onChange} />
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* Other Layer Buttons */}
                        <Button onClick={() => handleLayerToggle('公共施設', pbFacilityVisible, togglePbFacility)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Building size={16} />
                            {pbFacilityVisible ? '公共施設を非表示' : '公共施設を表示'}
                        </Button>
                        <Button onClick={() => handleLayerToggle('学校', schoolLayerVisible, toggleSchoolLayer)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <School size={16} />
                            {schoolLayerVisible ? '学校を隠す' : '学校を表示'}
                        </Button>
                        <Button onClick={() => handleLayerToggle('医療機関', medicalLayerVisible, toggleMedicalLayer)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Hospital size={16} />
                            {medicalLayerVisible ? '医療機関を隠す' : '医療機関を表示'}
                        </Button>
                        <Button onClick={() => handleLayerToggle('観光地', touristLayerVisible, toggleTouristLayer)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <MapPin size={16} />
                            {touristLayerVisible ? '観光地を非表示' : '観光地を表示'}
                        </Button>
                        <Button onClick={() => handleLayerToggle('道の駅', roadsideStationLayerVisible, toggleRoadsideStationLayerVisible)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <MapPin size={16} />
                            {roadsideStationLayerVisible ? '道の駅を非表示' : '道の駅を表示'}
                        </Button>
                        <Button onClick={() => handleLayerToggle('集客施設レイヤー', attractionLayerVisible, toggleAttractionLayer)} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            {/* <Attraction size={16} /> */}
                            {attractionLayerVisible ? '集客施設レイヤーを非表示' : '集客施設レイヤーを表示'}
                        </Button>



                        {/* Transport Accordion */}
                        {/* <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <BusFront size={16} />ワニバースとカシワニクルのバス停毎の乗車数/降車数
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: 'バス停レイヤー', checked: busPassengerLayerVisible, onChange: () => handleLayerToggle('バス停レイヤー', busPassengerLayerVisible, toggleBusPassengerLayerVisible), icon: <Bus size={16} /> },
                                        { label: '逆井コース（ルート）', checked: sakaiRouteVisible, onChange: toggleSakaiRouteVisible },
                                        { label: '南増尾コース（ルート）', checked: masuoRouteVisible, onChange: toggleMasuoRouteVisible },
                                        { label: '沼南コース（ルート）', checked: shonanRouteVisible, onChange: toggleShonanRouteVisible },
                                        { label: '逆井 コース - 乗車', checked: sakaeCourseRideLayerVisible, onChange: () => handleLayerToggle('逆井 コース - 乗車', sakaeCourseRideLayerVisible, toggleSakaeCourseRideLayerVisible), icon: <MapPin size={16} /> },
                                        { label: '逆井 コース - 降車', checked: sakaeCourseDropLayerVisible, onChange: () => handleLayerToggle('逆井 コース - 降車', sakaeCourseDropLayerVisible, toggleSakaeCourseDropLayerVisible), icon: <MapPin size={16} /> },
                                        { label: '南増尾 コース - 乗車', checked: masuoCourseRideLayerVisible, onChange: () => handleLayerToggle('南増尾 コース - 乗車', masuoCourseRideLayerVisible, toggleMasuoCourseRideLayerVisible), icon: <MapPin size={16} /> },
                                        { label: '南増尾 コース - 降車', checked: masuoCourseDropLayerVisible, onChange: () => handleLayerToggle('南増尾 コース - 降車', masuoCourseDropLayerVisible, toggleMasuoCourseDropLayerVisible), icon: <MapPin size={16} /> },
                                        { label: '沼南コース - 乗車', checked: shonanCourseRideLayerVisible, onChange: () => handleLayerToggle('沼南コース - 乗車', shonanCourseRideLayerVisible, toggleShonanCourseRideLayerVisible), icon: <MapPin size={16} /> },
                                        { label: '沼南コース - 降車', checked: shonanCourseDropLayerVisible, onChange: () => handleLayerToggle('沼南コース - 降車', shonanCourseDropLayerVisible, toggleShonanCourseDropLayerVisible), icon: <MapPin size={16} /> },
                                        // { label: '降車データ', checked: alightingVisible, onChange: toggleAlighting, icon: <Users size={16} /> },
                                    ].map(({ label, checked, onChange, icon }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <Label className="text-sm text-black flex items-center gap-2">{icon} {label}</Label>
                                            <Switch checked={checked} onCheckedChange={onChange} />
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion> */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <BusFront size={16} />ワニバースとカシワニクルのバス停毎の乗車数/降車数
                                </AccordionTrigger>

                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        {
                                            label: 'バス停レイヤー',
                                            checked: busPassengerLayerVisible,
                                            onChange: () => handleLayerToggle('バス停レイヤー', busPassengerLayerVisible, toggleBusPassengerLayerVisible),
                                            icon: <Bus size={16} />,
                                        },

                                        // ✅ Routes now use handleLayerToggle (fix)
                                        {
                                            label: '逆井コース（ルート）',
                                            checked: sakaiRouteVisible,
                                            onChange: () => handleLayerToggle('逆井コース（ルート）', sakaiRouteVisible, toggleSakaiRouteVisible),
                                            icon: <Bus size={16} />,
                                        },
                                        {
                                            label: '南増尾コース（ルート）',
                                            checked: masuoRouteVisible,
                                            onChange: () => handleLayerToggle('南増尾コース（ルート）', masuoRouteVisible, toggleMasuoRouteVisible),
                                            icon: <Bus size={16} />,
                                        },
                                        {
                                            label: '沼南コース（ルート）',
                                            checked: shonanRouteVisible,
                                            onChange: () => handleLayerToggle('沼南コース（ルート）', shonanRouteVisible, toggleShonanRouteVisible),
                                            icon: <Bus size={16} />,
                                        },

                                        {
                                            label: '逆井 コース - 乗車',
                                            checked: sakaeCourseRideLayerVisible,
                                            onChange: () => handleLayerToggle('逆井 コース - 乗車', sakaeCourseRideLayerVisible, toggleSakaeCourseRideLayerVisible),
                                            icon: <MapPin size={16} />,
                                        },
                                        {
                                            label: '逆井 コース - 降車',
                                            checked: sakaeCourseDropLayerVisible,
                                            onChange: () => handleLayerToggle('逆井 コース - 降車', sakaeCourseDropLayerVisible, toggleSakaeCourseDropLayerVisible),
                                            icon: <MapPin size={16} />,
                                        },
                                        {
                                            label: '南増尾 コース - 乗車',
                                            checked: masuoCourseRideLayerVisible,
                                            onChange: () => handleLayerToggle('南増尾 コース - 乗車', masuoCourseRideLayerVisible, toggleMasuoCourseRideLayerVisible),
                                            icon: <MapPin size={16} />,
                                        },
                                        {
                                            label: '南増尾 コース - 降車',
                                            checked: masuoCourseDropLayerVisible,
                                            onChange: () => handleLayerToggle('南増尾 コース - 降車', masuoCourseDropLayerVisible, toggleMasuoCourseDropLayerVisible),
                                            icon: <MapPin size={16} />,
                                        },
                                        {
                                            label: '沼南コース - 乗車',
                                            checked: shonanCourseRideLayerVisible,
                                            onChange: () => handleLayerToggle('沼南コース - 乗車', shonanCourseRideLayerVisible, toggleShonanCourseRideLayerVisible),
                                            icon: <MapPin size={16} />,
                                        },
                                        {
                                            label: '沼南コース - 降車',
                                            checked: shonanCourseDropLayerVisible,
                                            onChange: () => handleLayerToggle('沼南コース - 降車', shonanCourseDropLayerVisible, toggleShonanCourseDropLayerVisible),
                                            icon: <MapPin size={16} />,
                                        },
                                    ].map(({ label, checked, onChange, icon }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <Label className="text-sm text-black flex items-center gap-2">
                                                {icon} {label}
                                            </Label>
                                            <Switch checked={checked} onCheckedChange={onChange} />
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <BusFront size={16} />カシワニクル乗降場
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: 'バス停レイヤー', checked: newbusLayerVisible, onChange: () => handleLayerToggle('バス停レイヤー', newbusLayerVisible, toggleNewBusLayerVisible), icon: <Bus size={16} /> },
                                        { label: 'カシワニクル乗車', checked: newKashiwakuruRideLayerVisible, onChange: () => handleLayerToggle('カシワニクル乗車', newKashiwakuruRideLayerVisible, toggleNewKashiwakuruRideLayerVisible), icon: <MapPin size={16} /> },
                                        { label: 'カシワニクル降車', checked: newKashiwakuruDropLayerVisible, onChange: () => handleLayerToggle('カシワニクル降車', newKashiwakuruDropLayerVisible, toggleNewKashiwakuruDropLayerVisible), icon: <MapPin size={16} /> },

                                    ].map(({ label, checked, onChange, icon }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <Label className="text-sm text-black flex items-center gap-2">{icon} {label}</Label>
                                            <Switch checked={checked} onCheckedChange={onChange} />
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <User2 size={16} />柏市の公共施設
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: '全て', category: '', color: '#808080' }, // All categories (subete)
                                        { label: '公立保育園', category: '公立保育園', color: '#FF5733' },
                                        { label: '私立認可保育園', category: '私立認可保育園', color: '#33FF57' },
                                        { label: '小規模保育施設', category: '小規模保育施設', color: '#DDD92A' },
                                        { label: '私立幼稚園', category: '私立幼稚園', color: '#313715' },
                                        { label: '認定こども園', category: '認定こども園', color: '#91E5F6' },
                                        { label: '児童センター', category: '児童センター', color: '#FF1053' },
                                        { label: '地域子育て支援拠点', category: '地域子育て支援拠点', color: '#725AC1' },
                                        { label: 'こどもルーム', category: 'こどもルーム', color: '#A1EF8B' },
                                        { label: 'こども図書館', category: 'こども図書館', color: '#5D737E' },
                                        { label: '市役所・支所・出張所', category: '市役所・支所・出張所', color: '#FF9000' },
                                        { label: '図書館', category: '図書館', color: '#13070C' },
                                        { label: '薬局', category: '薬局', color: '#7fc6a4' },
                                        { label: '市立小学校', category: '市立小学校', color: '#3357FF' },
                                        { label: '市内中学校', category: '市内中学校', color: '#B1740F' },
                                        { label: '高等学校', category: '高等学校', color: '#23022E' },
                                        { label: '大学・大学校', category: '大学・大学校', color: '#764134' },
                                        { label: '特別支援学校', category: '特別支援学校', color: '#BD2D87' },

                                    ].map(({ label, category, color }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <Label className="text-sm text-black flex items-center gap-2">
                                                <Circle fill={color} size={16} />
                                                {label}
                                            </Label>
                                            <Switch
                                                checked={selectedCategories.includes(category)}
                                                onCheckedChange={() => handleLayerToggle(category === '' ? '柏市の公共施設-全て' : category, selectedCategories.includes(category), () => toggleKashiwaPublicFacilityVisible(category))}
                                            />
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <ShoppingBasket size={16} />柏市のお店
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: '全て', category: '', icon: <Store size={16} /> }, // All categories (subete)
                                        { label: 'デパート・ショッピングモール', category: 'デパート・ショッピングモール', icon: <ShoppingBag size={16} /> }, // Shopping Mall
                                        { label: 'スーパーマーケット', category: 'スーパーマーケット', icon: <Store size={16} /> } // Supermarket
                                    ].map(({ label, category, icon }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <Label className="text-sm text-black flex items-center gap-2">
                                                {icon}
                                                {label}
                                            </Label>
                                            <Switch
                                                checked={selectedShopCategories.includes(category)}
                                                onCheckedChange={() => handleLayerToggle(category === '' ? "柏市のお店-全て" : category, selectedShopCategories.includes(category), () => toggleKashiwaShopsVisible(category))}
                                            />
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="kashiwa-od">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <BusFront size={16} /> カシワニクル OD × 時間帯
                                </AccordionTrigger>

                                <AccordionContent className="flex flex-col space-y-3 bg-white rounded-xl mt-2 px-4 py-3">
                                    {/* Toggle 1: show layer (all hours) */}
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-black flex items-center gap-2">OD フロー（全データ）</Label>
                                        <Switch checked={kashiwakuruOdVisible} onCheckedChange={toggleKashiwakuruOdVisible} />
                                    </div>

                                    {/* Toggle 2: enable hour filtering (slider becomes active) */}
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-black flex items-center gap-2">時間帯でフィルター</Label>
                                        <Switch
                                            checked={kashiwakuruOdFilterOn}
                                            onCheckedChange={onToggleKashiwakuruOdFilter}
                                            disabled={!kashiwakuruOdVisible}
                                        />
                                    </div>

                                    {/* Slider (disabled when filter is OFF) */}
                                    <div className="flex flex-col gap-2">
                                        {/* Label row with current hour display */}
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-black">時間帯（開始）</Label>
                                            <span className="text-xs text-muted-foreground">
                                                {kashiwakuruOdHour}:00 – {kashiwakuruOdHour + 1}:00
                                            </span>
                                        </div>

                                        {/* Slider */}
                                        <Slider
                                            min={8}
                                            max={19}
                                            step={1}
                                            value={[kashiwakuruOdHour]}
                                            onValueChange={(vals) => onKashiwakuruOdHourChange(vals[0])}
                                            className="w-full"
                                            disabled={!kashiwakuruOdFilterOn || !kashiwakuruOdVisible}
                                        />

                                        {/* Hour markers */}
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            {Array.from({ length: 12 }, (_, i) => 8 + i).map((h) => (
                                                <span key={h}>
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={onClearOdEndpointHighlight}
                                            className="px-3 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200"
                                            disabled={!kashiwakuruOdVisible}
                                        >
                                            ハイライト解除
                                        </button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="kashiwa-chome">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    町丁目人口
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: '町丁目：総数（G列）', checked: chomeTotalVisible, onChange: () => handleLayerToggle('町丁目：総数', chomeTotalVisible, toggleChomeTotalVisible) },
                                        { label: '町丁目：高齢化率（K列）', checked: chomeAgingVisible, onChange: () => handleLayerToggle('町丁目：高齢化率', chomeAgingVisible, toggleChomeAgingVisible) },
                                        { label: '町丁目：人口密度（L列）', checked: chomeDensityVisible, onChange: () => handleLayerToggle('町丁目：人口密度', chomeDensityVisible, toggleChomeDensityVisible) },
                                        { label: '町丁目：総数（2040 推計）', checked: chomeTotal2040Visible, onChange: () => handleLayerToggle('町丁目：総数（2040 推計）', chomeTotal2040Visible, toggleChomeTotal2040Visible) },
                                        { label: '町丁目：高齢化率（2040 推計）', checked: chomeAging2040Visible, onChange: () => handleLayerToggle('町丁目：高齢化率（2040 推計）', chomeAging2040Visible, toggleChomeAging2040Visible) },
                                    ].map(({ label, checked, onChange }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <Label className="text-sm text-black flex items-center gap-2">{label}</Label>
                                            <Switch checked={checked} onCheckedChange={onChange} />
                                        </div>
                                    ))}

                                    {/* --- 町丁目：Style & Filters --- */}



                                    <div className="space-y-4">
                                        {/* ヘッダー行：トグルだけ常時表示 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                                                スタイルとフィルター
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={chomeFiltersOpen}
                                                    disabled={!anyChomeLayerOn}
                                                    onCheckedChange={(next) => {
                                                        if (!next) resetChomeUIAndLayers(); // closing collapses + resets everything
                                                        setChomeFiltersOpen(next);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* 展開コンテンツ：閉じているときは非表示 */}
                                        <AnimatePresence initial={false}>
                                            {chomeFiltersOpen && (
                                                <motion.div
                                                    key="chome-filters"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-4">
                                                        {/* 対象 / パレット / 分類 */}
                                                        <div className="grid grid-cols-12 gap-3">
                                                            <Label className="col-span-4 text-xs text-muted-foreground whitespace-nowrap self-center">対象</Label>
                                                            <div className="col-span-8">
                                                                <Select value={chomeTarget} onValueChange={(v) => setChomeTarget(v as any)}>
                                                                    <SelectTrigger className="h-8 text-xs rounded-lg w-full">
                                                                        <SelectValue placeholder="対象を選択" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="total">総数（G）</SelectItem>
                                                                        <SelectItem value="aging">高齢化率（K）</SelectItem>
                                                                        <SelectItem value="density">人口密度（L）</SelectItem>
                                                                        <SelectItem value="total">総数（G）</SelectItem>
                                                                        <SelectItem value="aging">高齢化率（K）</SelectItem>
                                                                        <SelectItem value="density">人口密度（L）</SelectItem>
                                                                        <SelectItem value="total_2040">総数（2040 推計）</SelectItem>
                                                                        <SelectItem value="aging_2040">高齢化率（2040 推計）</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <Label className="col-span-4 text-xs text-muted-foreground whitespace-nowrap self-center">パレット</Label>
                                                            <div className="col-span-8">
                                                                <Select value={chomePalette} onValueChange={(v) => setChomePalette(v as any)}>
                                                                    <SelectTrigger className="h-8 text-xs rounded-lg w-full">
                                                                        <SelectValue placeholder="色を選択" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Purples">パープル</SelectItem>
                                                                        <SelectItem value="Greens">グリーン</SelectItem>
                                                                        <SelectItem value="Oranges">オレンジ</SelectItem>
                                                                        <SelectItem value="Blues">ブルー</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <Label className="col-span-4 text-xs text-muted-foreground whitespace-nowrap self-center">分類</Label>
                                                            <div className="col-span-8">
                                                                <Select value={chomeMethod} onValueChange={(v) => setChomeMethod(v as any)}>
                                                                    <SelectTrigger className="h-8 text-xs rounded-lg w-full">
                                                                        <SelectValue placeholder="分類を選択" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="quantile">分位法</SelectItem>
                                                                        <SelectItem value="equal">等間隔</SelectItem>
                                                                        <SelectItem value="jenks">ジェンクス</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* ビン数・不透明度 */}
                                                        <div className="space-y-4">
                                                            <div>
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <Label className="text-xs">ビン数</Label>
                                                                    <span className="text-xs text-muted-foreground">{chomeBins}</span>
                                                                </div>
                                                                <Slider
                                                                    min={3}
                                                                    max={7}
                                                                    step={1}
                                                                    value={[chomeBins]}
                                                                    onValueChange={(v) => setChomeBins(v[0])}
                                                                    className="px-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <Label className="text-xs">不透明度</Label>
                                                                    <span className="text-xs text-muted-foreground">{chomeOpacity}%</span>
                                                                </div>
                                                                <Slider
                                                                    min={30}
                                                                    max={100}
                                                                    step={1}
                                                                    value={[chomeOpacity]}
                                                                    onValueChange={(v) => setChomeOpacity(v[0])}
                                                                    className="px-1"
                                                                />
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* 範囲フィルター */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                                <Filter className="h-4 w-4 text-muted-foreground" />
                                                                範囲フィルター
                                                            </div>

                                                            <div className="grid grid-cols-12 gap-3">
                                                                <Label className="col-span-4 text-xs text-muted-foreground self-center">最小{isAgingMetric ? "（%）" : ""}</Label>
                                                                <Input
                                                                    inputMode="numeric"
                                                                    type="number"
                                                                    value={chomeMin}
                                                                    onChange={(e) => setChomeMin(e.target.value)}
                                                                    placeholder={isAgingMetric ? "例: 25" : "例: 1000"}
                                                                    className="col-span-8 h-8 text-xs rounded-lg"
                                                                />

                                                                <Label className="col-span-4 text-xs text-muted-foreground self-center">最大{isAgingMetric ? "（%）" : ""}</Label>
                                                                <Input
                                                                    inputMode="numeric"
                                                                    type="number"
                                                                    value={chomeMax}
                                                                    onChange={(e) => setChomeMax(e.target.value)}
                                                                    placeholder={isAgingMetric ? "例: 40" : "例: 10000"}
                                                                    className="col-span-8 h-8 text-xs rounded-lg"
                                                                />
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="h-8 rounded-lg flex-1 text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200"
                                                                    onClick={() => {
                                                                        setChomeMin(''); setChomeMax('');
                                                                        onChomeRangeChange(chomeTarget, null, null);
                                                                    }}
                                                                >
                                                                    解除
                                                                </button>
                                                                <button
                                                                    className="h-8 rounded-lg flex-1 text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200"
                                                                    onClick={() =>
                                                                        onChomeRangeChange(
                                                                            chomeTarget,
                                                                            chomeMin === '' ? null : Number(chomeMin),
                                                                            chomeMax === '' ? null : Number(chomeMax)
                                                                        )
                                                                    }
                                                                >
                                                                    範囲を適用
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* ラベル */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                                <Type className="h-4 w-4 text-muted-foreground" />
                                                                ラベル
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-xs">ラベル表示</Label>
                                                                <Switch
                                                                    checked={chomeLabelsOn}
                                                                    onCheckedChange={(next) => {
                                                                        setChomeLabelsOn(next);
                                                                        onChomeLabelsChange(next, chomeLabelsMode, chomeLabelsMetric);
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-12 gap-3">
                                                                <Label className="col-span-4 text-xs text-muted-foreground self-center">内容</Label>
                                                                <div className="col-span-8">
                                                                    <Select
                                                                        value={chomeLabelsMode}
                                                                        onValueChange={(v) => {
                                                                            const mode = v as 'name' | 'metric';
                                                                            setChomeLabelsMode(mode);
                                                                            onChomeLabelsChange(chomeLabelsOn, mode, chomeLabelsMetric);
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="h-8 text-xs rounded-lg w-full">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="name">町丁字名</SelectItem>
                                                                            <SelectItem value="metric">数値</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <Label className="col-span-4 text-xs text-muted-foreground self-center">指標</Label>
                                                                <div className="col-span-8">
                                                                    <Select
                                                                        value={chomeLabelsMetric}
                                                                        onValueChange={(v) => {
                                                                            const m = v as ChomeMetric;
                                                                            setChomeLabelsMetric(m);
                                                                            if (chomeLabelsMode === 'metric') {
                                                                                onChomeLabelsChange(chomeLabelsOn, 'metric', m);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="h-8 text-xs rounded-lg w-full">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="total">総数（G）</SelectItem>
                                                                            <SelectItem value="aging">高齢化率（K）</SelectItem>
                                                                            <SelectItem value="density">人口密度（L）</SelectItem>
                                                                            <SelectItem value="total_2040">総数（2040 推計）</SelectItem>
                                                                            <SelectItem value="aging_2040">高齢化率（2040 推計）</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>



                        {/* Metric Selector */}
                        <Select value={selectedMetric} onValueChange={(value) => {
                            const label = metricLabels[value];

                            setGlobalVisibleLayers([label]); // Replace all layers with the new one
                            onMetricChange(value);           // Call your metric change logic
                        }}>
                            <SelectTrigger className="w-full px-4 py-2 text-sm bg-white rounded-xl text-black shadow border border-gray-200">
                                <SelectValue placeholder="表示する人口指標" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PTN_2020">総人口（2020年）</SelectItem>
                                <SelectItem value="PTC_2020">65歳以上の人口（2020年）</SelectItem>
                                <SelectItem value="PTA_2020">0〜14歳の人口（2020年）</SelectItem>
                                <SelectItem value="ELDERLY_RATIO">高齢者比率（65歳以上／総人口）</SelectItem>
                            </SelectContent>
                        </Select>



                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
