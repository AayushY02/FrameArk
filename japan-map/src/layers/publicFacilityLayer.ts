const PB_FACILITY_LAYER_IDS = ['facilities-circle'];

export const togglePublicFacilityLayer = (
    map: maplibregl.Map,
    pbFacilityVisible: boolean,
    setIsLoading: (v: boolean) => void,
    setPbFacilityVisibleVisible: (v: boolean) => void
) => {
    setIsLoading(true);

    const sourceId = 'public-facilities';
    // const tilesetUrl = 'mapbox://frame-ark.public-facilities';
    // const sourceLayer = 'public-facilities';

    const labelLayerId = map.getStyle().layers?.find(
        l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
    )?.id;

    if (!pbFacilityVisible) {
        // Add vector source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'geojson', data: "/data/KS_PublicFacility_enriched.geojson" });
        }

        // Add circle layer
        if (!map.getLayer('facilities-circle')) {
            map.addLayer({
                id: 'facilities-circle',
                type: 'circle',
                source: sourceId,
                // 'source-layer': sourceLayer,
                minzoom: 5,
                layout: { visibility: 'visible' },
                paint: {
                    'circle-radius': 6,
                    'circle-color': ['get', 'MarkerColor'],
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 1
                }
            }, labelLayerId);
        } else {
            map.setLayoutProperty('facilities-circle', 'visibility', 'visible');
        }

        // Hide all other relevant layers
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
        // Hide facility layer
        PB_FACILITY_LAYER_IDS.forEach(id => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

    }

    setPbFacilityVisibleVisible(!pbFacilityVisible);

    map.once('idle', () => setIsLoading(false));
};


// const PB_FACILITY_LAYER_IDS = ['facilities-symbols'];

// export const togglePublicFacilityLayer = (
//     map: mapboxgl.Map,
//     pbFacilityVisible: boolean,
//     setIsLoading: (v: boolean) => void,
//     setPbFacilityVisibleVisible: (v: boolean) => void
// ) => {
//     setIsLoading(true);

//     const sourceId = 'public-facilities';
//     const tilesetUrl = 'mapbox://frame-ark.public-facilities';
//     const sourceLayer = 'public-facilities';

//     const labelLayerId = map.getStyle().layers?.find(
//         l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
//     )?.id;

//     if (!pbFacilityVisible) {
//         if (!map.getSource(sourceId)) {
//             map.addSource(sourceId, { type: 'vector', url: tilesetUrl });
//         }

//         if (!map.getLayer('facilities-symbols')) {
//             map.addLayer({
//                 id: 'facilities-symbols',
//                 type: 'symbol',
//                 source: sourceId,
//                 'source-layer': sourceLayer,
//                 minzoom: 5,
//                 layout: {
//                     'icon-image': [
//                         'match',
//                         ['get', 'CategoryCode'],
//                         '03001', 'museum-15',
//                         '09001', 'school-15',
//                         '11121', 'hospital-15',
//                         'town-hall-15' // fallback
//                     ],
//                     'icon-size': 1,
//                     'icon-allow-overlap': true,
//                     'text-field': ['get', 'P02_004'],
//                     'text-size': 11,
//                     'text-offset': [0, 1.2],
//                     'text-anchor': 'top'
//                 },
//                 paint: {
//                     'text-color': '#333333',
//                     'text-halo-color': '#ffffff',
//                     'text-halo-width': 1
//                 }
//             }, labelLayerId);
//         } else {
//             map.setLayoutProperty('facilities-symbols', 'visibility', 'visible');
//         }

//         [
//             'mesh-1km-fill', 'mesh-1km-outline',
//             'mesh-500m-fill', 'mesh-500m-outline',
//             'mesh-250m-fill', 'mesh-250m-outline',
//             'agri-fill', 'agri-outline', 'agri-labels',
//             'transportation-line-hover', 'transportation-line',
//             'admin-fill', 'admin-line'
//         ].forEach(id => {
//             if (map.getLayer(id)) {
//                 map.setLayoutProperty(id, 'visibility', 'none');
//             }
//         });

//     } else {
//         PB_FACILITY_LAYER_IDS.forEach(id => {
//             if (map.getLayer(id)) {
//                 map.setLayoutProperty(id, 'visibility', 'none');
//             }
//         });

//         [
//             'mesh-1km-fill', 'mesh-1km-outline',
//             'mesh-500m-fill', 'mesh-500m-outline',
//             'mesh-250m-fill', 'mesh-250m-outline'
//         ].forEach(id => {
//             if (map.getLayer(id)) {
//                 map.setLayoutProperty(id, 'visibility', 'visible');
//             }
//         });
//     }

//     setPbFacilityVisibleVisible(!pbFacilityVisible);

//     map.once('idle', () => setIsLoading(false));
// };


// const PB_FACILITY_LAYER_IDS = ['facilities-symbols'];

// export const togglePublicFacilityLayer = (
//   map: mapboxgl.Map,
//   pbFacilityVisible: boolean,
//   setIsLoading: (v: boolean) => void,
//   setPbFacilityVisibleVisible: (v: boolean) => void
// ) => {
//   setIsLoading(true);

//   const sourceId = 'public-facilities';
//   const tilesetUrl = 'mapbox://frame-ark.public-facilities';
//   const sourceLayer = 'public-facilities';

//   const labelLayerId = map.getStyle().layers?.find(
//     l => l.type === 'symbol' && l.layout?.['text-field'] && l.id.includes('place')
//   )?.id;

//   if (!pbFacilityVisible) {
//     if (!map.getSource(sourceId)) {
//       map.addSource(sourceId, { type: 'vector', url: tilesetUrl });
//     }

//     if (!map.getLayer('facilities-symbols')) {
//       map.addLayer({
//         id: 'facilities-symbols',
//         type: 'symbol',
//         source: sourceId,
//         'source-layer': sourceLayer,
//         minzoom: 5,
//         layout: {
//           'icon-image': [
//             'match',
//             ['get', 'CategoryCode'],
//             '03001', 'museum-15',
//             '09001', 'school-15',
//             '11121', 'hospital-15',
//             '02001', 'park-15',
//             '05001', 'restaurant-15',
//             '08001', 'library-15',
//             'marker-15' // default fallback
//           ],
//           'icon-size': 1,
//           'icon-allow-overlap': true,
//           'text-field': ['get', 'P02_004'],
//           'text-size': 11,
//           'text-offset': [0, 1.2],
//           'text-anchor': 'top'
//         },
//         paint: {
//           'text-color': '#333',
//           'text-halo-color': '#fff',
//           'text-halo-width': 1
//         }
//       }, labelLayerId);
//     } else {
//       map.setLayoutProperty('facilities-symbols', 'visibility', 'visible');
//     }

//     // Hide everything else
//     [
//       'mesh-1km-fill', 'mesh-1km-outline',
//       'mesh-500m-fill', 'mesh-500m-outline',
//       'mesh-250m-fill', 'mesh-250m-outline',
//       'agri-fill', 'agri-outline', 'agri-labels',
//       'transportation-line-hover', 'transportation-line',
//       'admin-fill', 'admin-line'
//     ].forEach(id => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', 'none'));

//   } else {
//     PB_FACILITY_LAYER_IDS.forEach(id => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', 'none'));
//     ['mesh-1km-fill', 'mesh-1km-outline', 'mesh-500m-fill', 'mesh-500m-outline', 'mesh-250m-fill', 'mesh-250m-outline']
//       .forEach(id => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', 'visible'));
//   }

//   setPbFacilityVisibleVisible(!pbFacilityVisible);
//   map.once('idle', () => setIsLoading(false));
// };

