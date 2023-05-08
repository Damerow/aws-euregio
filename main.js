/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup()
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations.addTo(map)
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

async function showStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();

    // Wetterstationen mit Icons implementieren
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/icons.png',
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let properties = feature.properties;
            c
            let popupContent = `
                <h3>${properties.name}</h3>
                <ul>
                    <li>Seehöhe: ${properties.SEEHOEHE} m</li>
                    <li>Lufttemperatur (LT): ${properties.lt} °C</li>
                    <li>Relative Luftfeuchte (RH): ${properties.rh} %</li>
                    <li>Windgeschwindigkeit (WG): ${properties.wg} km/h</li>
                    <li>Schneehöhe (HS): ${properties.hs} cm</li>
                </ul>`;
    
            layer.bindPopup(popupContent);
        }
    }).addTo(themaLayer.stations);
}

showStations("https://static.avalanche.report/weather_stations/stations.geojson");
