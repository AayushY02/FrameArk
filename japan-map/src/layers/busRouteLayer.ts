// src/layers/busRouteLayer.ts
import mapboxgl from "mapbox-gl";

type RouteArgs = {
  id: "shonan" | "masuo" | "sakai";
  url: string;
  color: string;
  lineWidth?: number;
  beforeId?: string; // optional: place under labels if you want
};

const MESH_LAYER_IDS = [
  "mesh-1km-fill", "mesh-1km-outline",
  "mesh-500m-fill", "mesh-500m-outline",
  "mesh-250m-fill", "mesh-250m-outline",
];

// keep previous mesh visibility so we can restore exactly
const meshPrevVisibility = new Map<string, "visible" | "none">();

function hideMeshes(map: mapboxgl.Map) {
  MESH_LAYER_IDS.forEach((id) => {
    if (!map.getLayer(id)) return;
    const prev =
      (map.getLayoutProperty(id, "visibility") as "visible" | "none") ??
      "visible";
    if (!meshPrevVisibility.has(id)) meshPrevVisibility.set(id, prev);
    map.setLayoutProperty(id, "visibility", "none");
  });
}

function restoreMeshes(map: mapboxgl.Map) {
  MESH_LAYER_IDS.forEach((id) => {
    if (!map.getLayer(id)) return;
    const prev = meshPrevVisibility.get(id) ?? "visible";
    map.setLayoutProperty(id, "visibility", prev);
    meshPrevVisibility.delete(id);
  });
}

function ensureRouteScaffolding(map: mapboxgl.Map, args: RouteArgs) {
  const srcId = `route-${args.id}-src`;
  const lineId = `route-${args.id}-line`;
  const casingId = `route-${args.id}-casing`;

  if (!map.getSource(srcId)) {
    map.addSource(srcId, { type: "geojson", data: args.url });

    // subtle white casing for contrast
    if (!map.getLayer(casingId)) {
      map.addLayer(
        {
          id: casingId,
          type: "line",
          source: srcId,
          paint: {
            "line-color": "#ffffff",
            "line-width": (args.lineWidth ?? 3) + 3,
            "line-opacity": 0.6,
          },
          layout: { visibility: "none" },
        },
        args.beforeId
      );
    }

    if (!map.getLayer(lineId)) {
      map.addLayer(
        {
          id: lineId,
          type: "line",
          source: srcId,
          paint: {
            "line-color": args.color,
            "line-width": args.lineWidth ?? 3,
          },
          layout: { visibility: "none" },
        },
        args.beforeId
      );
    }
  }

  return { srcId, lineId, casingId };
}

function setRouteVisibility(
  map: mapboxgl.Map,
  ids: { lineId: string; casingId: string },
  vis: "visible" | "none"
) {
  if (map.getLayer(ids.casingId)) {
    map.setLayoutProperty(ids.casingId, "visibility", vis);
  }
  if (map.getLayer(ids.lineId)) {
    map.setLayoutProperty(ids.lineId, "visibility", vis);
  }
}

const addRouteLayer = (
  map: mapboxgl.Map,
  routeVisible: boolean,
  setRouteVisible: (v: boolean) => void,
  args: RouteArgs
) => {
  // 1) make sure source + layers exist
  const ids = ensureRouteScaffolding(map, args);

  // 2) toggle -> follow the same style as shops: perform visibility ops, then flip the state, then rely on idle to end loading
  const nextVisible = !routeVisible;

  if (nextVisible) {
    // Hide mesh like your shops layer does before adding
    hideMeshes(map);
    setRouteVisibility(map, ids, "visible");
    setRouteVisible(true);
  } else {
    setRouteVisibility(map, ids, "none");
    // Bring meshes back when route is hidden
    restoreMeshes(map);
    setRouteVisible(false);
  }
};

async function toggleRoute(
  map: mapboxgl.Map,
  routeVisible: boolean,
  setIsLoading: (v: boolean) => void,
  setRouteVisible: (v: boolean) => void,
  args: RouteArgs
) {
  setIsLoading(true);

  const run = () => {
    addRouteLayer(map, routeVisible, setRouteVisible, args);
    // match your pattern: finish loading on idle
    map.once("idle", () => setIsLoading(false));
  };

  if (map.isStyleLoaded()) {
    run();
  } else {
    map.once("style.load", run);
  }
}

// --- Public helpers (wired exactly like MapView/MapControls import) -------

export const toggleShonanRoute = (
  map: mapboxgl.Map,
  shonanRouteVisible: boolean,
  setIsLoading: (v: boolean) => void,
  setShonanRouteVisible: (v: boolean) => void
) =>
  toggleRoute(map, shonanRouteVisible, setIsLoading, setShonanRouteVisible, {
    id: "shonan",
    url: "/data/Bus_Route_Shonan.geojson",
    color: "#1f78b4", // blue
  });

export const toggleMasuoRoute = (
  map: mapboxgl.Map,
  masuoRouteVisible: boolean,
  setIsLoading: (v: boolean) => void,
  setMasuoRouteVisible: (v: boolean) => void
) =>
  toggleRoute(map, masuoRouteVisible, setIsLoading, setMasuoRouteVisible, {
    id: "masuo",
    url: "/data/Bus_Route_Masuo.geojson",
    color: "#33a02c", // green
  });

export const toggleSakaiRoute = (
  map: mapboxgl.Map,
  sakaiRouteVisible: boolean,
  setIsLoading: (v: boolean) => void,
  setSakaiRouteVisible: (v: boolean) => void
) =>
  toggleRoute(map, sakaiRouteVisible, setIsLoading, setSakaiRouteVisible, {
    id: "sakai",
    url: "/data/Bus_Route_Sakai.geojson",
    color: "#e31a1c", // red
  });
