// layers/terrain.ts
export const toggleTerrain = (
    map: mapboxgl.Map,
    terrainEnabled: boolean,
    setTerrainEnabled: (v: boolean) => void
) => {
    if (!terrainEnabled) {
        map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
            tileSize: 512,
            maxzoom: 14
        });

        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        map.addLayer({
            id: 'hillshading',
            type: 'hillshade',
            source: 'mapbox-dem',
            layout: { visibility: 'visible' },
            paint: {}
        });
    } else {
        map.setTerrain(null);

        if (map.getLayer('hillshading')) {
            map.removeLayer('hillshading');
        }

        if (map.getSource('mapbox-dem')) {
            map.removeSource('mapbox-dem');
        }
    }

    setTerrainEnabled(!terrainEnabled);
};
