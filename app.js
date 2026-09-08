window.Telegram?.WebApp?.ready();
// ─── Firebase ───────────────────────────────────────────────────────────────
firebase.initializeApp({
  apiKey:            "AIzaSyBaz-VYD15eVV6RxjeeLDNq2u3v8cCgx-I",
  authDomain:        "rent-smart-f2b58.firebaseapp.com",
  projectId:         "rent-smart-f2b58",
  storageBucket:     "rent-smart-f2b58.firebasestorage.app",
  messagingSenderId: "193151326331",
  appId:             "1:193151326331:web:45953e64235a487165eade"
});
const db   = firebase.firestore();

db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence: multiple tabs open, only one can have persistence');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence: not supported in this browser');
    }
  });

const auth = firebase.auth();

let currentUserId = null;
auth.signInAnonymously()
  .then(cred => { currentUserId = cred.user.uid; })
  .catch(err  => console.error("Auth error:", err));

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const PMTILES_FILE = "valencia.pmtiles";

const map = new maplibregl.Map({
  container: "map",
  center: [-0.3763, 39.4699],
  zoom: 14,
  minZoom: 12,
  maxZoom: 19,
  pitch: 0,
  bearing: 0,
  cooperativeGestures: false,
  style: {
    version: 8,
    glyphs: "https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf",
    sources: {
      valencia: {
        type: "vector",
        url: `pmtiles://${PMTILES_FILE}`,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxzoom: 14
      },
      addresses: {
        type: "geojson",
        data: "addresses_light.geojson"
      },
    },
    layers: [
      { id: "bg", type: "background",
        paint: { "background-color": "#f5f0e8" } },

      { id: "earth", type: "fill", source: "valencia", "source-layer": "earth",
        paint: { "fill-color": "#f5f0e8" } },

      { id: "landcover", type: "fill", source: "valencia", "source-layer": "landcover",
        paint: { "fill-color": "#eae4d4", "fill-opacity": 0.8 } },

      { id: "landuse", type: "fill", source: "valencia", "source-layer": "landuse",
        paint: {
          "fill-color": [
            "match", ["get", "kind"],
            "park",     "#2d6a4f",
            "garden",   "#2d6a4f",
            "grass",    "#40916c",
            "cemetery", "#52b788",
            "hospital", "#d4e6c3",
            "school",   "#e9f5db",
            "#eae4d4"
          ],
          "fill-opacity": 0.5
        } },

      { id: "water", type: "fill", source: "valencia", "source-layer": "water",
        filter: ["!", ["in", ["get", "kind"], ["literal", ["river", "canal"]]]],
        paint: { "fill-color": "#1b4332" } },

      { id: "canals", type: "line", source: "valencia", "source-layer": "water",
        filter: ["in", ["get", "kind"], ["literal", ["river", "canal"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#1b4332",
          "line-width": 1.5,
          "line-opacity": 0.7
        } },

      { id: "roads-minor-casing", type: "line", source: "valencia", "source-layer": "roads",
        minzoom: 13,
        filter: ["in", ["get", "kind"], ["literal", ["minor_road", "path", "track"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#d4cbb8",
          "line-width": ["interpolate", ["linear"], ["zoom"], 13, 2, 18, 6]
        } },

      { id: "roads-minor", type: "line", source: "valencia", "source-layer": "roads",
        minzoom: 13,
        filter: ["in", ["get", "kind"], ["literal", ["minor_road", "path", "track"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": ["interpolate", ["linear"], ["zoom"], 13, 1, 18, 4]
        } },

      { id: "roads-major-casing", type: "line", source: "valencia", "source-layer": "roads",
        minzoom: 9,
        filter: ["in", ["get", "kind"], ["literal", ["highway", "major_road", "medium_road"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#b5a98a",
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 3, 18, 14]
        } },

      { id: "roads-major", type: "line", source: "valencia", "source-layer": "roads",
        minzoom: 9,
        filter: ["in", ["get", "kind"], ["literal", ["highway", "major_road", "medium_road"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#fff8ee",
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1.5, 18, 10]
        } },

      { id: "buildings-shadow", type: "fill", source: "valencia", "source-layer": "buildings",
        minzoom: 14,
        paint: {
          "fill-color": "#c8bfa8",
          "fill-opacity": 0.4,
          "fill-translate": [2, 2]
        } },

      { id: "buildings", type: "fill", source: "valencia", "source-layer": "buildings",
        minzoom: 14,
        paint: {
          "fill-color": "#ede8de",
          "fill-outline-color": "#c8bfa8",
          "fill-opacity": 1
        } },

      { id: "road-labels", type: "symbol", source: "valencia", "source-layer": "roads",
        minzoom: 15,
        layout: {
          "text-field": ["coalesce", ["get", "name:es"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 15, 10, 18, 13],
          "text-max-width": 10,
          "symbol-placement": "line",
          "text-padding": 5
        },
        paint: {
          "text-color": "#2d4a3e",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5
        } },

      { id: "place-labels", type: "symbol", source: "valencia", "source-layer": "places",
        minzoom: 11,
        layout: {
          "text-field": ["coalesce", ["get", "name:es"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 11, 16, 15],
          "text-max-width": 8,
          "text-letter-spacing": 0.05
        },
        paint: {
          "text-color": "#1b3a2d",
          "text-halo-color": "#f5f0e8",
          "text-halo-width": 2
        } },

      { id: "house-numbers-dot", type: "circle", source: "addresses",
        minzoom: 17,
        paint: {
          "circle-radius": 2,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#2d4a3e",
          "circle-stroke-width": 1
        } },

      { id: "house-numbers", type: "symbol", source: "addresses",
        minzoom: 17,
        layout: {
          "text-field": ["get", "n"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 9,
          "text-offset": [0, 0.8],
          "text-anchor": "top"
        },
        paint: {
          "text-color": "#2d4a3e",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.2
        } },
    ]
  }
});

// ─── Constants and state ──────────────────────────────────────────────────

const PLACE_RADIUS_M = 100; // radius around the user within which any pin (marker or report) can be placed
let userLocation = null;

// ─── Marker registry (for vote popup) ────────────────────────────────────
// Key = markerId from Firestore (matches properties.markerId in the db-markers source)
const markerRegistry = {};
const pinLayerSet    = new Set(); // list of known markerIds (kept for compatibility with older code)
const shownMarkers   = new Set();

// ─── Single GeoJSON index for all point markers (replaces the layer bomb) ──
// Previously each marker created 6 source+layer pairs — with hundreds of
// markers this froze the map. Now all markers live in one source, one
// setData() per change.
let dbMarkerIndex = {}; // markerId -> GeoJSON Feature

function rebuildDbMarkersSource() {
  if (map.getSource("db-markers")) {
    map.getSource("db-markers").setData({
      type: "FeatureCollection",
      features: Object.values(dbMarkerIndex)
    });
  }
}

// ─── Reverse-geocode queue: Nominatim limits to 1 request/sec ────────────
const _geocodeQueue = [];
let _geocodeBusy = false;

function queueReverseGeocode(lng, lat, cb) {
  _geocodeQueue.push({ lng, lat, cb });
  _drainGeocodeQueue();
}

function _drainGeocodeQueue() {
  if (_geocodeBusy || !_geocodeQueue.length) return;
  _geocodeBusy = true;
  const { lng, lat, cb } = _geocodeQueue.shift();
  reverseGeocode(lng, lat)
    .then(addr => cb(addr))
    .finally(() => {
      setTimeout(() => { _geocodeBusy = false; _drainGeocodeQueue(); }, 1100);
    });
}

// ─── Report registry (for info popup) ────────────────────────────────────
const reportRegistry = {};
// { [pinLayerId]: { type, problems, other, address, floor } }
const reportPinSet   = new Set();

// Forward-reference: assigned inside initApp, called from highlightReportedBuilding
let _openReportInfoSheet = null;
let _openReportForm = null;

// ─── Helper functions ─────────────────────────────────────────────────────

function makeCircleGeoJSON(center, radiusMeters, steps = 64) {
  const coords = [];
  const dLat = (radiusMeters / 6371000) * (180 / Math.PI);
  const dLng = dLat / Math.cos(center.lat * Math.PI / 180);
  const step = (2 * Math.PI) / steps;
  for (let i = 0; i <= steps; i++) {
    const angle = i * step;
    coords.push([
      center.lng + dLng * Math.sin(angle),
      center.lat + dLat * Math.cos(angle)
    ]);
  }
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [coords] }
    }]
  };
}

function updateUserLocation(lngLat) {
  userLocation = lngLat;
  if (map.getSource("user-radius")) {
    map.getSource("user-radius").setData(makeCircleGeoJSON(lngLat, PLACE_RADIUS_M));
    if (map.getLayer("user-radius-fill")) {
      map.setLayoutProperty("user-radius-fill", "visibility", "none");
      map.setLayoutProperty("user-radius-border", "visibility", "none");
    }
  }
  if (map.getSource("user-dot")) {
    map.getSource("user-dot").setData({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [lngLat.lng, lngLat.lat] }
      }]
    });
  }
  if (map.getSource("user-pulse")) {
    map.getSource("user-pulse").setData({
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: { type: "Point", coordinates: [lngLat.lng, lngLat.lat] } }]
    });
    animateUserDot();
  }
}

let pulseAnimId = null;
function animateUserDot() {
  if (pulseAnimId) cancelAnimationFrame(pulseAnimId);
  const start = performance.now();
  const duration = 1400;
  const cycles = 1;
  function step(now) {
    const elapsed = now - start;
    const t = (elapsed % duration) / duration;
    const cycle = Math.floor(elapsed / duration);
    if (cycle >= cycles) {
      map.setPaintProperty("user-pulse-layer", "circle-stroke-opacity", 0);
      map.setPaintProperty("user-pulse-layer", "circle-radius", 8);
      return;
    }
    map.setPaintProperty("user-pulse-layer", "circle-radius", 8 + (1 - Math.pow(1 - t, 2)) * 22);
    map.setPaintProperty("user-pulse-layer", "circle-stroke-opacity", (1 - t) * 0.7);
    pulseAnimId = requestAnimationFrame(step);
  }
  pulseAnimId = requestAnimationFrame(step);
}

function requestLocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError && onError("not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      updateUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
      onSuccess && onSuccess(userLocation);
    },
    err => {
      console.warn("Geolocation error:", err);
      onError && onError(err);
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const sin2 = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180)
    * Math.cos(b.lat * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

async function reverseGeocode(lng, lat) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lon=${lng}&lat=${lat}&accept-language=en`;
    const data = await (await fetch(url)).json();
    return data.display_name || null;
  } catch (e) {
    return null;
  }
}

// ─── map.on("load") ─────────────────────────────────────────────────────────

map.on("load", () => {
  const bounds = map.getSource("valencia").bounds;
  if (bounds) {
    map.setMaxBounds(bounds);
  } else {
    map.setMaxBounds([[-0.55, 39.30], [-0.23, 39.58]]);
  }

  map.addSource("user-radius", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });
  map.addLayer({
    id: "user-radius-fill",
    type: "fill",
    source: "user-radius",
    paint: { "fill-color": "#52b788", "fill-opacity": 0.1 }
  });
  map.addLayer({
    id: "user-radius-border",
    type: "line",
    source: "user-radius",
    paint: {
      "line-color": "#52b788",
      "line-width": 2,
      "line-dasharray": [3, 2],
      "line-opacity": 0.6
    }
  });

  map.addSource("user-dot", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });
  map.addLayer({
    id: "user-dot-layer",
    type: "circle",
    source: "user-dot",
    paint: {
      "circle-radius": 8,
      "circle-color": "#2d4a3e",
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-opacity": 0.9
    }
  });

  map.addSource("user-pulse", {
  type: "geojson",
  data: { type: "FeatureCollection", features: [] }
});
  map.addLayer({
    id: "user-pulse-layer",
    type: "circle",
    source: "user-pulse",
    paint: {
      "circle-radius": 8,
      "circle-color": "transparent",
      "circle-stroke-color": "#2d4a3e",
      "circle-stroke-width": 2,
      "circle-opacity": 0,
      "circle-stroke-opacity": 0
    }
  });

  // ─── Single source+layer for ALL point markers ──────────────────────────
  // Instead of 6 source/layer pairs per marker — one source, one layer,
  // color determined by a data-driven expression on the "type" field.
  map.addSource("db-markers", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });
  map.addLayer({
    id: "db-markers-layer",
    type: "circle",
    source: "db-markers",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 3, 15, 5, 19, 8],
      "circle-color": [
        "match", ["get", "type"],
        "smell",           "#7a6a45",
        "noise-permanent", "#e63946",
        "noise-temporary", "#c9a800",
        "#2d4a3e"
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1.5,
      "circle-opacity": 1,
      "circle-stroke-opacity": 1
    }
  });

  // ─── Load markers from Firestore + listen for new ones ──────────────────
  // Batched: per onSnapshot we do at most one setData(), not N addLayer() calls.
  db.collection('markers').orderBy('createdAt', 'desc').limit(1000).onSnapshot(snapshot => {
    let changed = false;

    snapshot.docChanges().forEach(change => {
      const id = change.doc.id;

      if (change.type === 'removed') {
        if (dbMarkerIndex[id]) {
          delete dbMarkerIndex[id];
          delete markerRegistry[id];
          pinLayerSet.delete(id);
          changed = true;
        }
        shownMarkers.delete(id);
        return;
      }

      // added / modified
      const d = change.doc.data();
      if (typeof d.lng !== 'number' || typeof d.lat !== 'number') return;

      dbMarkerIndex[id] = {
        type: "Feature",
        id,
        geometry: { type: "Point", coordinates: [d.lng, d.lat] },
        properties: { type: d.type, markerId: id }
      };

      markerRegistry[id] = {
        markerId: id,
        type: d.type,
        address: d.address || null,
        lng: d.lng,
        lat: d.lat,
        userId: d.userId || null
      };
      pinLayerSet.add(id);
      shownMarkers.add(id);
      changed = true;

      // Fetch the address in the background via the queue — avoid hammering Nominatim in parallel
      if (!d.address) {
        queueReverseGeocode(d.lng, d.lat, addr => {
          if (markerRegistry[id]) markerRegistry[id].address = addr;
          if (addr) db.collection('markers').doc(id).update({ address: addr }).catch(() => {});
        });
      }
    });

    if (changed) rebuildDbMarkersSource();
  });

  // ─── Load reports from Firestore ─────────────────────────────────────────
  db.collection('reports').get().then(snapshot => {
    snapshot.forEach(doc => {
      const d = doc.data();
      highlightReportedBuilding({ lng: d.lng, lat: d.lat }, d.type, false, { ...d, docId: doc.id });
    });
  });
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

// ─── Drag-to-place ──────────────────────────────────────────────────────────

let dragState = null;
const ghost = document.getElementById("drag-ghost");

function getClientPos(e) {
  if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

// Shared geolocation gate: both regular markers and reports only start a
// drag once the user's position is known — from there both modes use the
// same radius (PLACE_RADIUS_M) in moveGhost/endDrag.
function beginLocationGatedDrag(newDragState, ghostHTML, pos, onDenied) {
  if (userLocation) {
    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 17.5, duration: 400 });
    if (map.getLayer("user-radius-fill")) {
      map.setLayoutProperty("user-radius-fill", "visibility", "visible");
      map.setLayoutProperty("user-radius-border", "visibility", "visible");
    }
    dragState = newDragState;
    ghost.innerHTML = ghostHTML;
    ghost.className = "active";
    moveGhost(pos.x, pos.y);
  } else {
    requestLocation(
      () => {
        map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 17.5, duration: 400 });
        if (map.getLayer("user-radius-fill")) {
          map.setLayoutProperty("user-radius-fill", "visibility", "visible");
          map.setLayoutProperty("user-radius-border", "visibility", "visible");
        }
        setTimeout(() => {
          dragState = newDragState;
          ghost.innerHTML = ghostHTML;
          ghost.className = "active";
          moveGhost(pos.x, pos.y);
        }, 500);
      },
      () => {
        if (onDenied) onDenied();
        alert("Please allow location access");
      }
    );
  }
}

function startDrag(e, iconEl) {
  e.preventDefault();
  const type = iconEl.dataset.type;
  const pos = getClientPos(e);
  if (!userLocation) iconEl.style.opacity = "0.5";
  beginLocationGatedDrag(
    { mode: "marker", type },
    iconEl.querySelector("svg").outerHTML,
    pos,
    () => { iconEl.style.opacity = ""; }
  );
  if (userLocation) iconEl.style.opacity = "";
}

const REPORT_GHOST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

function startReportDrag(reportType, e) {
  e.preventDefault();
  const pos = getClientPos(e);
  beginLocationGatedDrag(
    { mode: "report", reportType },
    REPORT_GHOST_SVG,
    pos
  );
}

function moveGhost(x, y) {
  ghost.style.left = x + "px";
  ghost.style.top  = y + "px";
  if (!dragState) return;
  const mapCoord = map.unproject([x, y]);
  const inRange = userLocation
    ? haversineMeters(userLocation, { lng: mapCoord.lng, lat: mapCoord.lat }) <= PLACE_RADIUS_M
    : true;
  ghost.classList.toggle("out-of-range", !inRange);
}

function endDrag(x, y) {
  if (!dragState) return;

  const mapCoord = map.unproject([x, y]);
  const inRange = userLocation
    ? haversineMeters(userLocation, { lng: mapCoord.lng, lat: mapCoord.lat }) <= PLACE_RADIUS_M
    : true;

  if (dragState.mode === "report") {
    const reportType = dragState.reportType;
    if (inRange) {
      dragState = null;
      ghost.className = "";
      ghost.innerHTML = "";
      _openReportForm(reportType, { lng: mapCoord.lng, lat: mapCoord.lat });
    } else {
      flashGhostRejected();
      dragState = null;
      ghost.className = "";
      ghost.innerHTML = "";
    }
    if (map.getLayer("user-radius-fill")) {
      map.setLayoutProperty("user-radius-fill", "visibility", "none");
      map.setLayoutProperty("user-radius-border", "visibility", "none");
    }
    return;
  }

  if (inRange) {
    placeMarker(dragState.type, mapCoord);
  } else {
    flashGhostRejected();
  }

  ghost.className = "";
  ghost.innerHTML = "";
  dragState = null;
  if (map.getLayer("user-radius-fill")) {
    map.setLayoutProperty("user-radius-fill", "visibility", "none");
    map.setLayoutProperty("user-radius-border", "visibility", "none");
  }
}

function flashGhostRejected() {
  ghost.classList.add("out-of-range");
  setTimeout(() => { ghost.className = ""; }, 400);
}

function highlightReportedBuilding(lngLat, reportType, fly = true, reportData = {}) {
  const id    = `reported-${reportData.docId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
  const pinId = `${id}-pin`;
  const isApt = reportType === 'apartment';

  // ── Compact house icon marker ─────────────────────────────────────────────
  const el = document.createElement('div');
  el.className = 'report-house-marker ' + reportType;

  // Simple solid house silhouette, no inner cutout — stays readable small
  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="12" height="12" fill="white">
    <polygon points="10,2 18,9 16,9 16,17 12,17 12,12 8,12 8,17 4,17 4,9 2,9"/>
  </svg>`;

  el.addEventListener('click', e => {
    e.stopPropagation();
    if (_openReportInfoSheet) _openReportInfoSheet(pinId);
  });

  const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
    .setLngLat([lngLat.lng, lngLat.lat])
    .addTo(map);

  // Animate in
  el.style.opacity   = '0';
  el.style.transform = 'scale(0.4)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.2s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)';
    el.style.opacity    = '1';
    el.style.transform  = 'scale(1)';
  });

  setTimeout(() => updateHouseMarkerScale(), 250);

  reportRegistry[pinId] = {
    type:        reportType,
    problems:    reportData.problems || [],
    other:       reportData.other    || null,
    address:     reportData.address  || reportData.addressResolved || null,
    floor:       reportData.floor    || null,
    userId:      reportData.userId   || null,
    docId:       reportData.docId    || null,
    layerPrefix: id,
    _marker:     marker,
    _el:         el,
    _coord:      { lng: lngLat.lng, lat: lngLat.lat }
  };
  reportPinSet.add(pinId);

  if (fly) map.flyTo({ center:[lngLat.lng, lngLat.lat], zoom:17.5, duration:900 });
  return pinId;
}

// placeMarker is now called ONLY when the user places a new marker locally.
// Markers from Firestore render directly via onSnapshot → db-markers source (see above),
// without animation and without creating separate layers.
function placeMarker(type, lngLat) {
  if (!currentUserId) return;

  const tooClose = Object.values(markerRegistry).some(m =>
    m.type === type && haversineMeters({ lng: m.lng, lat: m.lat }, lngLat) < 10
  );
  if (tooClose) return;

  const colors = {
    'smell':           '#7a6a45',
    'noise-permanent': '#e63946',
    'noise-temporary': '#c9a800'
  };
  const color = colors[type] || '#2d4a3e';

  const radiiByType = {
    'smell':           [5, 15, 40],
    'noise-permanent': [8, 20, 50],
    'noise-temporary': [5, 12, 25]
  };
  const radii = radiiByType[type] || [5, 15, 40];

  // ── Brief "ripple" animation — temporary layers, remove themselves ───────
  const ringId = `ring-anim-${Date.now()}`;
  const ringIds = radii.map((r, i) => {
    const sourceId = `${ringId}-${i}`;
    map.addSource(sourceId, { type: 'geojson', data: makeCircleGeoJSON(lngLat, r) });
    map.addLayer({
      id: sourceId,
      type: 'fill',
      source: sourceId,
      paint: { 'fill-color': color, 'fill-opacity': 0 }
    });
    return sourceId;
  });
  const targetOpacities = [0.35, 0.18, 0.08];
  const duration = 800;
  const start = performance.now();

  function animate(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    ringIds.forEach((id, i) => {
      if (map.getLayer(id)) map.setPaintProperty(id, 'fill-opacity', eased * targetOpacities[i]);
    });
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation finished — remove the temporary layers/sources right away
      ringIds.forEach(id => {
        try { if (map.getLayer(id))  map.removeLayer(id);  } catch (e) {}
        try { if (map.getSource(id)) map.removeSource(id); } catch (e) {}
      });
    }
  }
  requestAnimationFrame(animate);

  // ── Save to Firestore; persistent display goes through the shared db-markers source ──
  const tempRef = db.collection('markers').doc();
  shownMarkers.add(tempRef.id);

  // Optimistic render immediately, without waiting for the Firestore round-trip
  dbMarkerIndex[tempRef.id] = {
    type: "Feature",
    id: tempRef.id,
    geometry: { type: "Point", coordinates: [lngLat.lng, lngLat.lat] },
    properties: { type, markerId: tempRef.id }
  };
  markerRegistry[tempRef.id] = {
    markerId: tempRef.id, type, address: null,
    lng: lngLat.lng, lat: lngLat.lat, userId: currentUserId
  };
  pinLayerSet.add(tempRef.id);
  rebuildDbMarkersSource();

  tempRef.set({
    type, lng: lngLat.lng, lat: lngLat.lat,
    address: null, userId: currentUserId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    queueReverseGeocode(lngLat.lng, lngLat.lat, address => {
      if (markerRegistry[tempRef.id]) markerRegistry[tempRef.id].address = address;
      if (address) tempRef.update({ address }).catch(() => {});
    });
  }).catch(err => {
    console.error("Save marker error:", err);
    // Roll back the optimistic render if saving failed
    delete dbMarkerIndex[tempRef.id];
    delete markerRegistry[tempRef.id];
    pinLayerSet.delete(tempRef.id);
    rebuildDbMarkersSource();
  });
}

// ─── Listeners (DOM ready) ──────────────────────────────────────────────────

function initApp() {

  // Wire the forward reference so highlightReportedBuilding can call it
  _openReportInfoSheet = openReportInfoSheet;

  document.getElementById("locate-btn").addEventListener("click", () => {
    const btn = document.getElementById("locate-btn");
    btn.classList.add("loading");
    requestLocation(
      loc => {
        map.jumpTo({ center: [loc.lng, loc.lat], zoom: 16 });
        btn.classList.remove("loading");
      },
      () => {
        alert("Could not determine location");
        btn.classList.remove("loading");
      }
    );
  });

  document.querySelectorAll(".marker-icon").forEach(icon => {
    icon.addEventListener("mousedown", e => startDrag(e, icon));
    icon.addEventListener("touchstart", e => startDrag(e, icon), { passive: false });
  });

document.addEventListener("mousemove", e => {
  if (!dragState) return;
  moveGhost(e.clientX, e.clientY);
});

document.addEventListener("mouseup", e => {
  if (!dragState) return;
  endDrag(e.clientX, e.clientY);
});

document.addEventListener("touchmove", e => {
  if (!dragState) return;
  e.preventDefault();
  moveGhost(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

document.addEventListener("touchend", e => {
  if (!dragState) return;
  const t = e.changedTouches[0];
  endDrag(t.clientX, t.clientY);
});

// ─── Report Property ──────────────────────────────────────────────────────

const reportBtn      = document.getElementById("report-btn");
const reportSheet    = document.getElementById("report-sheet");
const reportBackdrop = document.getElementById("report-backdrop");

function openReportSheet() {
  reportSheet.classList.add("active");
  reportBackdrop.classList.add("active");
}

function closeReportSheet() {
  reportSheet.classList.remove("active");
  reportBackdrop.classList.remove("active");
}

reportBtn.addEventListener("click", openReportSheet);
reportBackdrop.addEventListener("click", closeReportSheet);

function submitReport() {
  const loc  = rfmState.location;
  const type = rfmState.type;
  if (!loc) { closeReportForm(); return; }

  const reportData = {
    problems: [...rfmState.selected],
    other:    rfmOtherInput.value.trim() || null,
    address:  rfmState.resolvedAddress || null,
    floor:    type === 'apartment' ? (rfmFloorInput.value || null) : null,
    userId:   currentUserId
  };

  closeReportForm();

  // Show it right away for good UX; docId and the precise address get filled in after saving
  const pinLayerId = highlightReportedBuilding(loc, type, true, reportData);

  if (currentUserId) {
    reverseGeocode(loc.lng, loc.lat).then(resolvedAddress => {
      db.collection('reports').add({
        type, ...reportData,
        address: reportData.address || resolvedAddress,
        addressResolved: resolvedAddress,
        lng: loc.lng, lat: loc.lat,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(docRef => {
        if (reportRegistry[pinLayerId]) reportRegistry[pinLayerId].docId = docRef.id;
        if (reportRegistry[pinLayerId] && !reportData.address) reportRegistry[pinLayerId].address = resolvedAddress;
      }).catch(err => console.error("Save report error:", err));
    });
  }
}

document.getElementById("report-apartment").addEventListener("mousedown", e => {
  closeReportSheet();
  startReportDrag('apartment', e);
});
document.getElementById("report-apartment").addEventListener("touchstart", e => {
  closeReportSheet();
  startReportDrag('apartment', e);
}, { passive: false });

document.getElementById("report-community").addEventListener("mousedown", e => {
  closeReportSheet();
  startReportDrag('community', e);
});
document.getElementById("report-community").addEventListener("touchstart", e => {
  closeReportSheet();
  startReportDrag('community', e);
}, { passive: false });

// ─── Report Form ────────────────────────────────────────────────────────────
const REPORT_PROBLEMS = {
  apartment: [
    'Mold & dampness', 'Noisy neighbors', 'Cockroaches / pests',
    'No hot water', 'Broken AC / heating', 'Water leaks',
    'Poor ventilation', 'Illegal Airbnb noise', 'Electrical issues',
    'Sewage smell', 'Structural cracks', 'Broken windows / doors'
  ],
  community: [
    'Dampness in hallway', 'Bad smell in common areas', 'Broken elevator',
    'Poor / no lighting', 'Dirty common spaces', 'Graffiti & vandalism',
    'Rats / pest infestation', 'Broken mailboxes', 'Illegal dumping',
    'Unsecured entrance', 'No wheelchair access', 'Water damage on walls'
  ]
};

let rfmState = { type: null, step: 1, selected: new Set(), location: null, resolvedAddress: null, floor: null };

const rfmOverlay    = document.getElementById('rfm-overlay');
const rfmTitle      = document.getElementById('rfm-title');
const rfmBackBtn    = document.getElementById('rfm-back-btn');
const rfmCloseBtn   = document.getElementById('rfm-close-btn');
const rfmStepProbs  = document.getElementById('rfm-step-problems');
const rfmChipsList  = document.getElementById('rfm-chips-list');
const rfmOtherInput = document.getElementById('rfm-other-input');
const rfmAddrHint   = document.getElementById('rfm-addr-hint');
const rfmNextBtn    = document.getElementById('rfm-next-btn');
const rfmProgressFill = document.getElementById('rfm-progress-fill');
const rfmStepFloor  = document.getElementById('rfm-step-floor');
const rfmFloorInput = document.getElementById('rfm-floor-input');

// coord comes from the drop point on the map — the address step is no longer
// needed, the building is already selected by the physical tap/drag onto the map.
function openReportForm(type, coord) {
  rfmState = { type, step: 1, selected: new Set(), location: coord, resolvedAddress: null, floor: null };

  rfmTitle.textContent = type === 'apartment' ? 'Apartment Issues' : 'Community Issues';
  rfmBackBtn.style.visibility = 'hidden';
  rfmProgressFill.style.width = type === 'apartment' ? '50%' : '100%';
  rfmNextBtn.textContent = type === 'apartment' ? 'Continue →' : 'Submit Report';

  rfmChipsList.innerHTML = '';
  REPORT_PROBLEMS[type].forEach(problem => {
    const chip = document.createElement('div');
    chip.className = 'rfm-chip';
    chip.textContent = problem;
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      rfmState.selected[chip.classList.contains('selected') ? 'add' : 'delete'](problem);
    });
    rfmChipsList.appendChild(chip);
  });

  rfmOtherInput.value = '';

  rfmStepFloor.classList.add('rfm-hidden');
  rfmFloorInput.value = '';

  rfmStepProbs.classList.remove('rfm-hidden');
  rfmOverlay.classList.add('active');

  // Resolve a human-readable address in the background — for display only, not for search
  if (rfmAddrHint) {
    rfmAddrHint.textContent = 'Resolving address…';
    reverseGeocode(coord.lng, coord.lat).then(addr => {
      rfmState.resolvedAddress = addr;
      if (rfmAddrHint) rfmAddrHint.textContent = addr ? `📍 ${addr.split(',').slice(0, 3).join(',').trim()}` : '';
    });
  }
}

function closeReportForm() {
  rfmOverlay.classList.remove('active');
}
_openReportForm = openReportForm;

rfmCloseBtn.addEventListener('click', closeReportForm);
rfmOverlay.addEventListener('click', e => { if (e.target === rfmOverlay) closeReportForm(); });

rfmBackBtn.addEventListener('click', () => {
  // The only back step now: floor → problems
  rfmState.step = 1;
  rfmStepProbs.classList.remove('rfm-hidden');
  rfmStepFloor.classList.add('rfm-hidden');
  rfmBackBtn.style.visibility = 'hidden';
  rfmProgressFill.style.width = '50%';
  rfmNextBtn.textContent = 'Continue →';
  rfmTitle.textContent = rfmState.type === 'apartment' ? 'Apartment Issues' : 'Community Issues';
});

rfmNextBtn.addEventListener('click', () => {
  if (rfmState.step === 1) {
    if (rfmState.type === 'apartment') {
      rfmState.step = 3;
      rfmStepProbs.classList.add('rfm-hidden');
      rfmStepFloor.classList.remove('rfm-hidden');
      rfmBackBtn.style.visibility = 'visible';
      rfmProgressFill.style.width = '100%';
      rfmNextBtn.textContent = 'Submit Report';
      rfmTitle.textContent = 'Select Floor';
    } else {
      submitReport();
    }
  } else {
    submitReport();
  }
});

// ─── Vote Popup ─────────────────────────────────────────────────────────────

const votePopup       = document.getElementById('vote-popup');
const voteTypeLabel   = document.getElementById('vote-type-label');
const voteAddress     = document.getElementById('vote-address');
const voteLikeBtn     = document.getElementById('vote-like');
const voteDislikeBtn  = document.getElementById('vote-dislike');
const voteLikeCount   = document.getElementById('vote-like-count');
const voteDislikeCount= document.getElementById('vote-dislike-count');

let activeVoteMarkerId = null;
let voteUnsubscribe    = null;

const TYPE_LABELS = {
  'smell':           'Smell',
  'noise-permanent': 'Permanent Noise',
  'noise-temporary': 'Temporary Noise'
};

function openVotePopup(markerId, screenX, screenY) {
  const info = markerRegistry[markerId];

  if (!info) return;

  activeVoteMarkerId = info.markerId;

  // Position the popup
  votePopup.style.left = screenX + 'px';
  votePopup.style.top  = screenY + 'px';

  // Fill it in
  voteTypeLabel.textContent = TYPE_LABELS[info.type] || info.type;
  voteTypeLabel.className   = info.type;
  voteAddress.textContent   = info.address
    ? info.address.split(',').slice(0, 2).join(',').trim()
    : `${info.lat.toFixed(4)}, ${info.lng.toFixed(4)}`;

  voteLikeBtn.classList.remove('voted');
  voteDislikeBtn.classList.remove('voted');
  voteLikeCount.textContent    = '0';
  voteDislikeCount.textContent = '0';


  const isOwner = info.userId && info.userId === currentUserId;
  document.getElementById('vote-delete-btn').style.display = isOwner ? 'block' : 'none';

  const noteInput = document.getElementById('vote-note');
  const noteSaveBtn = document.getElementById('vote-note-save');
  noteInput.value = '';
  noteSaveBtn.style.display = 'none';
  db.collection('markers').doc(info.markerId).get().then(d => {
    if (d.exists && d.data().note) noteInput.value = d.data().note;
  });
  noteInput.oninput = () => {
    noteSaveBtn.style.display = (isOwner && noteInput.value.trim()) ? 'block' : 'none';
  };
  noteSaveBtn.onclick = () => {
    db.collection('markers').doc(info.markerId)
      .update({ note: noteInput.value.trim() })
      .then(() => { noteSaveBtn.style.display = 'none'; });
  };

  votePopup.classList.add('active');

  // Listen for votes in real time
  if (voteUnsubscribe) voteUnsubscribe();
  voteUnsubscribe = db.collection('markers').doc(info.markerId)
    .collection('votes').onSnapshot(snap => {
      let likes = 0, dislikes = 0, myVote = null;
      snap.forEach(d => {
        if (d.data().vote === 'like')    likes++;
        if (d.data().vote === 'dislike') dislikes++;
        if (d.id === currentUserId) myVote = d.data().vote;
      });
      voteLikeCount.textContent    = likes;
      voteDislikeCount.textContent = dislikes;
      voteLikeBtn.classList.toggle('voted',    myVote === 'like');
      voteDislikeBtn.classList.toggle('voted', myVote === 'dislike');
    });
}

function closeVotePopup() {
  votePopup.classList.remove('active');
  if (voteUnsubscribe) { voteUnsubscribe(); voteUnsubscribe = null; }
  activeVoteMarkerId = null;
}

async function deleteMyMarker() {
  if (!activeVoteMarkerId || !currentUserId) return;
  const info = markerRegistry[activeVoteMarkerId];
  if (!info || info.userId !== currentUserId) return;

  const votesSnap = await db.collection('markers').doc(activeVoteMarkerId).collection('votes').get();
  votesSnap.forEach(d => d.ref.delete());
  await db.collection('markers').doc(activeVoteMarkerId).delete();

  // Delete from the shared source — just remove the feature and update the data once
  delete dbMarkerIndex[activeVoteMarkerId];
  delete markerRegistry[activeVoteMarkerId];
  pinLayerSet.delete(activeVoteMarkerId);
  rebuildDbMarkersSource();

  closeVotePopup();
}
  

document.getElementById('vote-delete-btn').addEventListener('click', deleteMyMarker);

async function castVote(vote) {
  if (!activeVoteMarkerId || !currentUserId) return;
  const ref = db.collection('markers').doc(activeVoteMarkerId)
                .collection('votes').doc(currentUserId);
  const snap = await ref.get();
  if (snap.exists && snap.data().vote === vote) {
    await ref.delete(); // clicking again removes the vote
  } else {
    await ref.set({ vote, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  }
}

voteLikeBtn.addEventListener('click',    () => castVote('like'));
voteDislikeBtn.addEventListener('click', () => castVote('dislike'));

document.addEventListener('click', e => {
  if (!votePopup.classList.contains('active')) return;
  if (votePopup.contains(e.target)) return;
  
  // don't close if the click was on the map
  if (e.target.closest('#map')) return;
  
  closeVotePopup();
});

// Click on a pin on the map
// ─── Report Info Sheet ──────────────────────────────────────────────────────
const rinfoOverlay  = document.getElementById('rinfo-overlay');
const rinfoBadge    = document.getElementById('rinfo-badge');
const rinfoAddress  = document.getElementById('rinfo-address');
const rinfoFloor    = document.getElementById('rinfo-floor');
const rinfoProblems = document.getElementById('rinfo-problems');
const rinfoOther    = document.getElementById('rinfo-other');

let activeReportPinLayerId = null;

// Find all report pins within ~15m of a given pin (same building cluster)
function getColocatedReportPinIds(pinLayerId) {
  const origin = reportRegistry[pinLayerId];
  if (!origin) return [pinLayerId];

  // We need lng/lat stored in the registry — add them during highlight
  const originCoord = origin._coord;
  if (!originCoord) return [pinLayerId];

  return [...reportPinSet].filter(id => {
    const r = reportRegistry[id];
    if (!r || !r._coord) return id === pinLayerId;
    const dist = haversineMeters(originCoord, r._coord);
    return dist < 15;
  });
}

function renderReportDetail(pinLayerId) {
  const info = reportRegistry[pinLayerId];
  if (!info) return;

  activeReportPinLayerId = pinLayerId;

  const rinfoList   = document.getElementById('rinfo-list');
  const rinfoDetail = document.getElementById('rinfo-detail');
  rinfoList.style.display   = 'none';
  rinfoDetail.style.display = 'block';

  const isApartment = info.type === 'apartment';
  rinfoBadge.textContent = isApartment ? '🏠 Apartment' : '🏘️ Community Area';
  rinfoBadge.className   = 'rinfo-badge ' + info.type;

  rinfoAddress.style.display = '';

  rinfoAddress.textContent = info.address
    ? info.address.split(',').slice(0, 3).join(',').trim()
    : '—';

  if (isApartment && info.floor) {
    rinfoFloor.textContent   = `Floor: ${info.floor}`;
    rinfoFloor.style.display = 'block';
  } else {
    rinfoFloor.style.display = 'none';
  }

  rinfoProblems.innerHTML = '';
  (info.problems || []).forEach(p => {
    const chip = document.createElement('span');
    chip.className   = 'rinfo-chip';
    chip.textContent = p;
    rinfoProblems.appendChild(chip);
  });

  if (info.other) {
    rinfoOther.textContent   = `"${info.other}"`;
    rinfoOther.style.display = 'block';
  } else {
    rinfoOther.style.display = 'none';
  }

  const isOwner = info.userId && info.userId === currentUserId;
  document.getElementById('rinfo-delete-btn').style.display = isOwner ? 'block' : 'none';

  // Show back button only when navigated from list
  document.getElementById('rinfo-back-btn').style.display =
    document.getElementById('rinfo-list').__multiMode ? 'flex' : 'none';
}

function openReportInfoSheet(pinLayerId) {
  const siblings = getColocatedReportPinIds(pinLayerId);

  if (siblings.length > 1) {
    // ── List mode ─────────────────────────────────────────────────────────
    const rinfoList   = document.getElementById('rinfo-list');
    const rinfoDetail = document.getElementById('rinfo-detail');
    rinfoList.style.display   = 'block';
    rinfoDetail.style.display = 'none';
    rinfoList.__multiMode     = true;

    const address = (() => {
      for (const id of siblings) {
        const a = reportRegistry[id]?.address;
        if (a) return a.split(',').slice(0, 3).join(',').trim();
      }
      return '—';
    })();

    document.getElementById('rinfo-list-address').textContent = address;

    const ul = document.getElementById('rinfo-list-items');
    ul.innerHTML = '';
    siblings.forEach(id => {
      const r = reportRegistry[id];
      if (!r) return;
      const isApt = r.type === 'apartment';

      const li = document.createElement('div');
      li.className = 'rinfo-list-item';

      const top = document.createElement('div');
      top.className = 'rinfo-list-item-top';

      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'rinfo-list-badge ' + (isApt ? 'apartment' : 'community');
      badgeSpan.textContent = (isApt ? '🏠 Apartment' : '🏘️ Community')
        + ((isApt && r.floor) ? ` · Floor ${r.floor}` : '');

      const chevronWrap = document.createElement('span');
      chevronWrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

      top.appendChild(badgeSpan);
      top.appendChild(chevronWrap);
      li.appendChild(top);

      const tags = (r.problems || []).slice(0, 2).join(', ') + ((r.problems || []).length > 2 ? '…' : '');
      if (tags) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'rinfo-list-item-tags';
        tagsDiv.textContent = tags;
        li.appendChild(tagsDiv);
      }

      li.addEventListener('click', () => {
        rinfoList.__multiMode = true;
        renderReportDetail(id);
      });
      ul.appendChild(li);
    });

    document.getElementById('rinfo-back-btn').style.display = 'none';
    document.getElementById('rinfo-close-btn').style.display = 'flex';
    document.getElementById('rinfo-delete-btn').style.display = 'none';

    // Header for list mode
    rinfoBadge.textContent = `${siblings.length} Reports`;
    rinfoBadge.className   = 'rinfo-badge multi';
    rinfoAddress.style.display = 'none';
    rinfoFloor.style.display   = 'none';
    rinfoProblems.innerHTML    = '';
    rinfoOther.style.display   = 'none';

  } else {
    // ── Single mode ───────────────────────────────────────────────────────
    document.getElementById('rinfo-list').__multiMode = false;
    document.getElementById('rinfo-list').style.display   = 'none';
    document.getElementById('rinfo-detail').style.display = 'block';
    document.getElementById('rinfo-back-btn').style.display = 'none';
    rinfoAddress.style.display = '';
    renderReportDetail(pinLayerId);
  }

  rinfoOverlay.classList.add('active');
}

function closeReportInfoSheet() {
  rinfoOverlay.classList.remove('active');
  activeReportPinLayerId = null;
}

document.getElementById('rinfo-close-btn').addEventListener('click', closeReportInfoSheet);
rinfoOverlay.addEventListener('click', e => {
  if (e.target === rinfoOverlay) closeReportInfoSheet();
});

document.getElementById('rinfo-back-btn').addEventListener('click', () => {
  const rinfoList   = document.getElementById('rinfo-list');
  const rinfoDetail = document.getElementById('rinfo-detail');
  rinfoDetail.style.display = 'none';
  rinfoList.style.display   = 'block';
  document.getElementById('rinfo-back-btn').style.display  = 'none';
  document.getElementById('rinfo-delete-btn').style.display = 'none';
  rinfoBadge.className = 'rinfo-badge multi';
  rinfoAddress.style.display = 'none';
});

async function deleteMyReport() {
  if (!activeReportPinLayerId || !currentUserId) return;
  const info = reportRegistry[activeReportPinLayerId];
  if (!info || info.userId !== currentUserId) return;

  if (info.docId) {
    await db.collection('reports').doc(info.docId).delete().catch(console.error);
  }

  if (info._marker) info._marker.remove();

  delete reportRegistry[activeReportPinLayerId];
  reportPinSet.delete(activeReportPinLayerId);
  closeReportInfoSheet();
}

document.getElementById('rinfo-delete-btn').addEventListener('click', deleteMyReport);

// Click on a pin on the map — now one shared layer instead of iterating over hundreds of ids
map.on('click', e => {
  if (dragState) return;

  // Report pins use HTML markers — clicks handled on element directly.
  closeReportInfoSheet();

  if (!map.getLayer('db-markers-layer')) { closeVotePopup(); return; }

  const features = map.queryRenderedFeatures(e.point, { layers: ['db-markers-layer'] });
  if (!features.length) { closeVotePopup(); return; }

  const markerId = features[0].properties.markerId;
  const point = map.project([
    features[0].geometry.coordinates[0],
    features[0].geometry.coordinates[1]
  ]);
  openVotePopup(markerId, point.x, point.y);
});

let _mmRaf = null;
map.on('mousemove', e => {
  if (_mmRaf) return;
  _mmRaf = requestAnimationFrame(() => {
    _mmRaf = null;
    if (!map.getLayer('db-markers-layer')) return;
    const f = map.queryRenderedFeatures(e.point, { layers: ['db-markers-layer'] });
    map.getCanvas().style.cursor = f.length ? 'pointer' : '';
  });
});

}   // ← this brace closes initApp

// Run initApp on DOMContentLoaded — but if it has already fired
// (readyState !== "loading"), call it immediately instead of waiting
// for an event that will never fire again in that case.
// ─── Scale house markers with zoom ─────────────────────────────────────────
function updateHouseMarkerScale() {
  const zoom = map.getZoom();
  const size = Math.max(10, Math.min(22, (zoom - 12) * (22 - 10) / (17 - 12) + 10));
  const opacity = Math.max(0.25, Math.min(1, (zoom - 11) / (15 - 11)));
  document.querySelectorAll('.report-house-marker').forEach(el => {
    el.style.width   = size + 'px';
    el.style.height  = size + 'px';
    const svg = el.querySelector('svg');
    if (svg) {
      const iconSize = Math.max(7, Math.round(size * 0.55));
      svg.setAttribute('width',  iconSize);
      svg.setAttribute('height', iconSize);
    }
    el.style.opacity = opacity;
  });
}

map.on('zoom', updateHouseMarkerScale);
map.on('load', updateHouseMarkerScale);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}