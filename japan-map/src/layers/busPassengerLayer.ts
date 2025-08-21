const BUS_LAYER_IDS = ['bus-layer'];

export const toggleBusPassengerLayer = (
    map: maplibregl.Map,
    busLayerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setBusLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'bus-stops';
    const layerId = 'bus-layer';
    const geojsonUrl = '/data/final.geojson'; // 🧠 Ensure this path is served in your Vite public folder

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!busLayerVisible) {
        // Add GeoJSON source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: geojsonUrl
            });
        }

        // Add circle layer for bus stops
        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'circle',
                source: sourceId,
                paint: {
                    'circle-radius': 6,
                    'circle-stroke-color': '#e11d48',
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 1,
                    "circle-color": "#fff"
                }
            }, labelLayerId);
        } else {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }

        // Hide conflicting layers
        [
            'mesh-1km-fill', 'mesh-1km-outline',
            'mesh-500m-fill', 'mesh-500m-outline',
            'mesh-250m-fill', 'mesh-250m-outline',
        ].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

    } else {
        // Hide bus layer
        BUS_LAYER_IDS.forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });
       
    }

    setBusLayerVisible(!busLayerVisible);

    map.once('idle', () => setIsLoading(false));
};




// const SAKAE_LAYER_IDS = ['sakae-course-ride'];

export const toggleSakaeCourseRideLayer = (
    map: maplibregl.Map,
    layerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'sakae-course-ride';
    const layerId = 'sakae-course-ride';
    const geojsonUrl = '/data/final.geojson';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!layerVisible) {
        // Load GeoJSON and filter for 逆井 コース
        fetch(geojsonUrl)
            .then(res => res.json())
            .then(rawGeoJson => {
                const filteredGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                    type: 'FeatureCollection',
                    features: rawGeoJson.features
                        .filter((feature: any) =>
                            feature.properties.Courses?.some((c: any) => c.name === '逆井 コース')
                        )
                        .map((feature: any) => {
                            const course = feature.properties.Courses.find((c: any) => c.name === '逆井 コース');
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    sakae_ride: course ? Number(course.ride) : 0
                                }
                            };
                        })
                };

                // Add source
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: filteredGeoJson
                    });
                } else {
                    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(filteredGeoJson);
                }

                // Add circle layer for 逆井 コース
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: 'circle',
                        source: sourceId,
                        paint: {
                            'circle-radius': [
                                'interpolate',
                                ['linear'],
                                ['get', 'sakae_ride'],
                                0, 6,
                                1000, 10,
                                2000, 18,
                                3000, 25
                            ],
                            'circle-color': '#16a34a',
                            'circle-opacity': 0.8,
                            'circle-stroke-color': '#fff',
                            'circle-stroke-width': 1
                        }
                    }, labelLayerId);
                } else {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                }

                // Hide conflicting layers
                [
                    'mesh-1km-fill', 'mesh-1km-outline',
                    'mesh-500m-fill', 'mesh-500m-outline',
                    'mesh-250m-fill', 'mesh-250m-outline',
                ].forEach(id => {
                    if (map.getLayer(id)) {
                        map.setLayoutProperty(id, 'visibility', 'none');
                    }
                });

                setLayerVisible(true);
                map.once('idle', () => setIsLoading(false));
            });
    } else {
        // Hide sakae layer
        ['sakae-course-ride'].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

        setLayerVisible(false);
        map.once('idle', () => setIsLoading(false));
    }
};

export const toggleSakaeCourseDropLayer = (
    map: maplibregl.Map,
    layerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'sakae-course-drop';
    const layerId = 'sakae-course-drop';
    const geojsonUrl = '/data/final.geojson';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!layerVisible) {
        // Load GeoJSON and filter for 逆井 コース
        fetch(geojsonUrl)
            .then(res => res.json())
            .then(rawGeoJson => {
                const filteredGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                    type: 'FeatureCollection',
                    features: rawGeoJson.features
                        .filter((feature: any) =>
                            feature.properties.Courses?.some((c: any) => c.name === '逆井 コース')
                        )
                        .map((feature: any) => {
                            const course = feature.properties.Courses.find((c: any) => c.name === '逆井 コース');
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    sakae_drop: course ? Number(course.drop) : 0
                                }
                            };
                        })
                };

                // Add source
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: filteredGeoJson
                    });
                } else {
                    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(filteredGeoJson);
                }

                // Add circle layer for 逆井 コース
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: 'circle',
                        source: sourceId,
                        paint: {
                            'circle-radius': [
                                'interpolate',
                                ['linear'],
                                ['get', 'sakae_drop'],
                                0, 6,
                                1000, 10,
                                2000, 18,
                                3000, 25
                            ],
                            'circle-color': '#f2f',
                            'circle-opacity': 0.8,
                            'circle-stroke-color': '#fff',
                            'circle-stroke-width': 1
                        }
                    }, labelLayerId);
                } else {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                }

                // Hide conflicting layers
                [
                    'mesh-1km-fill', 'mesh-1km-outline',
                    'mesh-500m-fill', 'mesh-500m-outline',
                    'mesh-250m-fill', 'mesh-250m-outline',
                ].forEach(id => {
                    if (map.getLayer(id)) {
                        map.setLayoutProperty(id, 'visibility', 'none');
                    }
                });

                setLayerVisible(true);
                map.once('idle', () => setIsLoading(false));
            });
    } else {
        // Hide sakae layer
        ['sakae-course-drop'].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

        setLayerVisible(false);
        map.once('idle', () => setIsLoading(false));
    }
};

export const toggleMasuoCourseRideLayer = (
    map: maplibregl.Map,
    layerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'masuo-course-ride';
    const layerId = 'masuo-course-ride';
    const geojsonUrl = '/data/final.geojson';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!layerVisible) {
        // Load GeoJSON and filter for 逆井 コース
        fetch(geojsonUrl)
            .then(res => res.json())
            .then(rawGeoJson => {
                const filteredGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                    type: 'FeatureCollection',
                    features: rawGeoJson.features
                        .filter((feature: any) =>
                            feature.properties.Courses?.some((c: any) => c.name === '南増尾 コース')
                        )
                        .map((feature: any) => {
                            const course = feature.properties.Courses.find((c: any) => c.name === '南増尾 コース');
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    masuo_ride: course ? Number(course.ride) : 0
                                }
                            };
                        })
                };

                // Add source
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: filteredGeoJson
                    });
                } else {
                    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(filteredGeoJson);
                }

                // Add circle layer for 逆井 コース
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: 'circle',
                        source: sourceId,
                        paint: {
                            'circle-radius': [
                                'interpolate',
                                ['linear'],
                                ['get', 'masuo_ride'],
                                0, 6,
                                1000, 10,
                                2000, 18,
                                3000, 25
                            ],
                            'circle-color': '#543553',
                            'circle-opacity': 0.8,
                            'circle-stroke-color': '#fff',
                            'circle-stroke-width': 1
                        }
                    }, labelLayerId);
                } else {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                }

                // Hide conflicting layers
                [
                    'mesh-1km-fill', 'mesh-1km-outline',
                    'mesh-500m-fill', 'mesh-500m-outline',
                    'mesh-250m-fill', 'mesh-250m-outline',
                ].forEach(id => {
                    if (map.getLayer(id)) {
                        map.setLayoutProperty(id, 'visibility', 'none');
                    }
                });

                setLayerVisible(true);
                map.once('idle', () => setIsLoading(false));
            });
    } else {
        // Hide sakae layer
        ['masuo-course-ride'].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

        setLayerVisible(false);
        map.once('idle', () => setIsLoading(false));
    }
};

export const toggleMasuoCourseDropLayer = (
    map: maplibregl.Map,
    layerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'masuo-course-drop';
    const layerId = 'masuo-course-drop';
    const geojsonUrl = '/data/final.geojson';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!layerVisible) {
        // Load GeoJSON and filter for 逆井 コース
        fetch(geojsonUrl)
            .then(res => res.json())
            .then(rawGeoJson => {
                const filteredGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                    type: 'FeatureCollection',
                    features: rawGeoJson.features
                        .filter((feature: any) =>
                            feature.properties.Courses?.some((c: any) => c.name === '南増尾 コース')
                        )
                        .map((feature: any) => {
                            const course = feature.properties.Courses.find((c: any) => c.name === '南増尾 コース');
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    masuo_drop: course ? Number(course.drop) : 0
                                }
                            };
                        })
                };

                // Add source
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: filteredGeoJson
                    });
                } else {
                    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(filteredGeoJson);
                }

                // Add circle layer for 逆井 コース
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: 'circle',
                        source: sourceId,
                        paint: {
                            'circle-radius': [
                                'interpolate',
                                ['linear'],
                                ['get', 'masuo_drop'],
                                0, 6,
                                1000, 10,
                                2000, 18,
                                3000, 25
                            ],
                            'circle-color': '#d42',
                            'circle-opacity': 0.8,
                            'circle-stroke-color': '#fff',
                            'circle-stroke-width': 1
                        }
                    }, labelLayerId);
                } else {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                }

                // Hide conflicting layers
                [
                    'mesh-1km-fill', 'mesh-1km-outline',
                    'mesh-500m-fill', 'mesh-500m-outline',
                    'mesh-250m-fill', 'mesh-250m-outline',
                ].forEach(id => {
                    if (map.getLayer(id)) {
                        map.setLayoutProperty(id, 'visibility', 'none');
                    }
                });

                setLayerVisible(true);
                map.once('idle', () => setIsLoading(false));
            });
    } else {
        // Hide sakae layer
        ['masuo-course-drop'].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });
        setLayerVisible(false);
        map.once('idle', () => setIsLoading(false));
    }
};


export const toggleShonanCourseRideLayer = (
    map: maplibregl.Map,
    layerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'shonan-course-ride';
    const layerId = 'shonan-course-ride';
    const geojsonUrl = '/data/final.geojson';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!layerVisible) {
        // Load GeoJSON and filter for 逆井 コース
        fetch(geojsonUrl)
            .then(res => res.json())
            .then(rawGeoJson => {
                const filteredGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                    type: 'FeatureCollection',
                    features: rawGeoJson.features
                        .filter((feature: any) =>
                            feature.properties.Courses?.some((c: any) => c.name === '沼南コース')
                        )
                        .map((feature: any) => {
                            const course = feature.properties.Courses.find((c: any) => c.name === '沼南コース');
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    shonan_ride: course ? Number(course.ride) : 0
                                }
                            };
                        })
                };

                // Add source
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: filteredGeoJson
                    });
                } else {
                    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(filteredGeoJson);
                }

                // Add circle layer for 逆井 コース
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: 'circle',
                        source: sourceId,
                        paint: {
                            'circle-radius': [
                                'interpolate',
                                ['linear'],
                                ['get', 'shonan_ride'],
                                0, 6,
                                1000, 10,
                                2000, 18,
                                3000, 25
                            ],
                            'circle-color': '#10b981',
                            'circle-opacity': 0.8,
                            'circle-stroke-color': '#fff',
                            'circle-stroke-width': 1
                        }
                    }, labelLayerId);
                } else {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                }

                // Hide conflicting layers
                [
                    'mesh-1km-fill', 'mesh-1km-outline',
                    'mesh-500m-fill', 'mesh-500m-outline',
                    'mesh-250m-fill', 'mesh-250m-outline',
                ].forEach(id => {
                    if (map.getLayer(id)) {
                        map.setLayoutProperty(id, 'visibility', 'none');
                    }
                });

                setLayerVisible(true);
                map.once('idle', () => setIsLoading(false));
            });
    } else {
        // Hide sakae layer
        ['shonan-course-ride'].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

        setLayerVisible(false);
        map.once('idle', () => setIsLoading(false));
    }
};

export const toggleShonanCourseDropLayer = (
    map: maplibregl.Map,
    layerVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setLayerVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'shonan-course-drop';
    const layerId = 'shonan-course-drop';
    const geojsonUrl = '/data/final.geojson';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!layerVisible) {
        // Load GeoJSON and filter for 逆井 コース
        fetch(geojsonUrl)
            .then(res => res.json())
            .then(rawGeoJson => {
                const filteredGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
                    type: 'FeatureCollection',
                    features: rawGeoJson.features
                        .filter((feature: any) =>
                            feature.properties.Courses?.some((c: any) => c.name === '沼南コース')
                        )
                        .map((feature: any) => {
                            const course = feature.properties.Courses.find((c: any) => c.name === '沼南コース');
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    shonan_drop: course ? Number(course.drop) : 0
                                }
                            };
                        })
                };

                // Add source
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: filteredGeoJson
                    });
                } else {
                    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(filteredGeoJson);
                }

                // Add circle layer for 逆井 コース
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: 'circle',
                        source: sourceId,
                        paint: {
                            'circle-radius': [
                                'interpolate',
                                ['linear'],
                                ['get', 'shonan_drop'],
                                0, 6,
                                1000, 10,
                                2000, 18,
                                3000, 25
                            ],
                            'circle-color': '#f97316',
                            'circle-opacity': 0.8,
                            'circle-stroke-color': '#fff',
                            'circle-stroke-width': 1
                        }
                    }, labelLayerId);
                } else {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                }

                // Hide conflicting layers
                [
                    'mesh-1km-fill', 'mesh-1km-outline',
                    'mesh-500m-fill', 'mesh-500m-outline',
                    'mesh-250m-fill', 'mesh-250m-outline',
                ].forEach(id => {
                    if (map.getLayer(id)) {
                        map.setLayoutProperty(id, 'visibility', 'none');
                    }
                });

                setLayerVisible(true);
                map.once('idle', () => setIsLoading(false));
            });
    } else {
        // Hide sakae layer
        ['shonan-course-drop'].forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

        setLayerVisible(false);
        map.once('idle', () => setIsLoading(false));
    }
};
