/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true,
    maxZoom: 12,
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`,
        maxZoom: 12,
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations.addTo(map),
    "Temperatur": themaLayer.temperature.addTo(map),
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function writeStationLayer() {
// Wetterstationen
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
                let pointInTime = new Date(properties.date);
                let WG = (properties.WG) ? (properties.WG * 3.6).toFixed(1) : "-";
                let popupContent = `   
                           <h3>${properties.name} (${feature.geometry.coordinates[2]} m ü. Adria) </h3> 
                    <ul>
                        <li>Lufttemperatur (LT): ${properties.LT || "keine Daten"} °C</li>
                        <li>Relative Luftfeuchte (RH): ${properties.RH || "keine Daten"} %</li>
                        <li>Windgeschwindigkeit (WG): ${WG} km/h</li>
                        <li>Schneehöhe (HS): ${properties.HS || "keine Daten"} cm</li>           
                    </ul>
                    <span>${pointInTime.toLocaleString()}</span>
                    `;
                //feature.geometry.coordinates[2] ruft den dritten Wert aus dem "coordinates"-Array des "geometry"-Objekts ab -> Seehöhe
                layer.bindPopup(popupContent);
            }
        }).addTo(themaLayer.stations);
    }


async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();

    // Wetterstationen mit Icons implementieren
    console.log(jsondata);
}

loadStations("https://static.avalanche.report/weather_stations/stations.geojson");

//if(prop.WG){
// return (prop.WG *3.6).toFixed(1);
// } else {
//   return "-";
//     }