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
import { Label } from './ui/label';
import { Switch } from './ui/switch';

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
    toggleRoadsideStationLayerVisible: () => void;
    busStopsVisible: boolean;
    toggleBusStops: () => void;

    boardingVisible: boolean;
    toggleBoarding: () => void;

    alightingVisible: boolean;
    toggleAlighting: () => void;
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
    boardingVisible,
    toggleBoarding,
    alightingVisible,
    toggleAlighting,
}: MapControlsProps) {
    return (
        <div className="absolute right-3 top-3 z-10  flex flex-col items-center justify-center space-y-2 w-fit">
            <Select value={currentStyle} onValueChange={onStyleChange}>
                <SelectTrigger className="w-full px-4 py-2 text-sm bg-white rounded-2xl text-black shadow-2xl border border-gray-200">
                    <SelectValue placeholder="Select map style" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(styles).map(([label, url]) => (
                        <SelectItem key={url} value={url}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  " onClick={toggleRoads}>{roadsVisible ? '道路を非表示' : '道路を表示'}</Button>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  " onClick={toggleAdmin}>{adminVisible ? '行政界を非表示' : '行政界を表示'}</Button>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  " onClick={toggleTerrain}>{terrainEnabled ? '地形を非表示' : '地形を表示'}</Button>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  " onClick={fitToBounds}>柏市にフォーカス</Button>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  " onClick={toggleAgri}>{agriLayerVisible ? '農業レイヤーを非表示' : '農業レイヤーを表示'}</Button>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="transportation">
                    <AccordionTrigger className="text-black bg-white  text-sm hover:bg-gray-50 rounded-2xl px-4 py-2">
                        交通レイヤーの操作
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col space-y-2 bg-white rounded-2xl mt-2  px-4 py-2 ">
                        {[
                            { label: '交通レイヤー', checked: transportVisible, onChange: toggleTransport },
                            { label: 'バス停', checked: busStopsVisible, onChange: toggleBusStops },
                            { label: '乗車データ', checked: boardingVisible, onChange: toggleBoarding },
                            { label: '降車データ', checked: alightingVisible, onChange: toggleAlighting },
                        ].map(({ label, checked, onChange }) => (
                            <div key={label} className="flex items-center justify-between">
                                <Label className="text-sm text-black">{label}</Label>
                                <Switch checked={checked} onCheckedChange={onChange} />
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  " onClick={togglePbFacility}>{pbFacilityVisible ? '公共施設を非表示' : '公共施設を表示'}</Button>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  " onClick={toggleSchoolLayer}>{schoolLayerVisible ? '学校を隠す' : '学校を表示'}</Button>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl  " onClick={toggleMedicalLayer}>{medicalLayerVisible ? '医療機関を隠す' : '医療機関を表示'}</Button>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl" onClick={toggleTouristLayer}>{touristLayerVisible ? '観光地を非表示' : '観光地を表示'}</Button>
            <Button className="w-full px-4 py-2 text-black bg-white shadow-xl hover:text-black cursor-pointer text-sm hover:bg-gray-50 rounded-2xl" onClick={toggleRoadsideStationLayerVisible}>{roadsideStationLayerVisible ? '道の駅を非表示' : '道の駅を表示'}</Button>


            <Select value={selectedMetric} onValueChange={onMetricChange}>
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
    );
}
