// components/MapControls.tsx
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    styles
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
