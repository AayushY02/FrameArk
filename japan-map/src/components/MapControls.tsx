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
    Mountain,
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
    MapPinCheckIcon
} from 'lucide-react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// import { useRecoilState } from 'recoil';
// import { masuoCourseDropLayerVisibleState } from '@/state/layers';
// import { toggleMasuoCourseRideLayer } from '@/layers/busPassengerLayer';

// const allCourses = ['逆井 コース', '南増尾 コース', '沼南コース'];

interface MapControlsProps {
    currentStyle: string;
    onStyleChange: (value: string) => void;
    roadsVisible: boolean;
    toggleRoads: () => void;
    adminVisible: boolean;
    toggleAdmin: () => void;
    terrainEnabled: boolean;
    toggleTerrain: () => void;
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

}

export default function MapControls({
    currentStyle,
    onStyleChange,
    roadsVisible,
    toggleRoads,
    adminVisible,
    toggleAdmin,
    terrainEnabled,
    toggleTerrain,
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
    captureMapScreenshot,


    newbusLayerVisible,
    toggleNewBusLayerVisible,

    newKashiwakuruRideLayerVisible,
    toggleNewKashiwakuruRideLayerVisible,

    newKashiwakuruDropLayerVisible,
    toggleNewKashiwakuruDropLayerVisible,


}: MapControlsProps) {

    const [isOpen, setIsOpen] = useState(false);

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
                            画像をエクスポート</Button>
                        <Button className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer" onClick={fitToBounds}>
                            <MapPinCheckIcon />
                            柏市にフォーカス</Button>
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

                        <Button onClick={toggleRoads} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Ruler size={16} />
                            {roadsVisible ? '道路を非表示' : '道路を表示'}
                        </Button>
                        <Button onClick={toggleAdmin} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Layers size={16} />
                            {adminVisible ? '行政界を非表示' : '行政界を表示'}
                        </Button>
                        <Button onClick={toggleTerrain} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Mountain size={16} />
                            {terrainEnabled ? '地形を非表示' : '地形を表示'}
                        </Button>

                        <Button onClick={toggleAgri} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Landmark size={16} />
                            {agriLayerVisible ? '農業レイヤーを非表示' : '農業レイヤーを表示'}
                        </Button>

                        {/* Transport Accordion */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <BusFront size={16} />交通レイヤーの操作
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: '交通レイヤー', checked: transportVisible, onChange: toggleTransport, icon: <Bus size={16} /> },
                                        { label: 'バス停', checked: busStopsVisible, onChange: toggleBusStops, icon: <MapPin size={16} /> },
                                        { label: 'カシワニクル乗降場', checked: busPickDropLayerVisible, onChange: toggleBusPickDropLayerVisible, icon: <Users size={16} /> },
                                        { label: 'バス乗降データ', checked: busPassengerLayerVisible, onChange: toggleBusPassengerLayerVisible, icon: <Users size={16} /> }
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
                        <Button onClick={togglePbFacility} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Building size={16} />
                            {pbFacilityVisible ? '公共施設を非表示' : '公共施設を表示'}
                        </Button>
                        <Button onClick={toggleSchoolLayer} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <School size={16} />
                            {schoolLayerVisible ? '学校を隠す' : '学校を表示'}
                        </Button>
                        <Button onClick={toggleMedicalLayer} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <Hospital size={16} />
                            {medicalLayerVisible ? '医療機関を隠す' : '医療機関を表示'}
                        </Button>
                        <Button onClick={toggleTouristLayer} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <MapPin size={16} />
                            {touristLayerVisible ? '観光地を非表示' : '観光地を表示'}
                        </Button>
                        <Button onClick={toggleRoadsideStationLayerVisible} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            <MapPin size={16} />
                            {roadsideStationLayerVisible ? '道の駅を非表示' : '道の駅を表示'}
                        </Button>
                        <Button onClick={toggleAttractionLayer} className="flex items-center gap-2 bg-white rounded-2xl text-black hover:bg-[#f2f2f2] cursor-pointer">
                            {/* <Attraction size={16} /> */}
                            {attractionLayerVisible ? '集客施設レイヤーを非表示' : '集客施設レイヤーを表示'}
                        </Button>



                        {/* Transport Accordion */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <BusFront size={16} />ワニバースとカシワニクルのバス停毎の乗車数/降車数
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: 'バス停レイヤー', checked: busPassengerLayerVisible, onChange: toggleBusPassengerLayerVisible, icon: <Bus size={16} /> },
                                        { label: '逆井 コース - 乗車', checked: sakaeCourseRideLayerVisible, onChange: toggleSakaeCourseRideLayerVisible, icon: <MapPin size={16} /> },
                                        { label: '逆井 コース - 降車', checked: sakaeCourseDropLayerVisible, onChange: toggleSakaeCourseDropLayerVisible, icon: <MapPin size={16} /> },
                                        { label: '南増尾 コース - 乗車', checked: masuoCourseRideLayerVisible, onChange: toggleMasuoCourseRideLayerVisible, icon: <MapPin size={16} /> },
                                        { label: '南増尾 コース - 降車', checked: masuoCourseDropLayerVisible, onChange: toggleMasuoCourseDropLayerVisible, icon: <MapPin size={16} /> },
                                        { label: '沼南コース - 乗車', checked: shonanCourseRideLayerVisible, onChange: toggleShonanCourseRideLayerVisible, icon: <MapPin size={16} /> },
                                        { label: '沼南コース - 降車', checked: shonanCourseDropLayerVisible, onChange: toggleShonanCourseDropLayerVisible, icon: <MapPin size={16} /> },
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
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="transportation">
                                <AccordionTrigger className="text-black bg-gray-50 text-sm hover:bg-gray-100 rounded-xl px-4 py-2 hover:no-underline cursor-pointer flex items-center ">
                                    <BusFront size={16} />カシワニクル乗降場
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2 bg-white rounded-xl mt-2 px-4 py-2">
                                    {[
                                        { label: 'バス停レイヤー', checked: newbusLayerVisible, onChange: toggleNewBusLayerVisible, icon: <Bus size={16} /> },
                                        { label: 'カシワニクル乗車', checked: newKashiwakuruRideLayerVisible, onChange: toggleNewKashiwakuruRideLayerVisible, icon: <MapPin size={16} /> },
                                        { label: 'カシワニクル降車', checked: newKashiwakuruDropLayerVisible, onChange: toggleNewKashiwakuruDropLayerVisible, icon: <MapPin size={16} /> },

                                    ].map(({ label, checked, onChange, icon }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <Label className="text-sm text-black flex items-center gap-2">{icon} {label}</Label>
                                            <Switch checked={checked} onCheckedChange={onChange} />
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* Metric Selector */}
                        <Select value={selectedMetric} onValueChange={onMetricChange}>
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
