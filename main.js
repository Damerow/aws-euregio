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
    wind: L.featureGroup(),
    schneehoehe: L.featureGroup(),
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
    "Wetterstationen": themaLayer.stations,
    "Temperatur": themaLayer.temperature,
    "Wind": themaLayer.wind,
    "Schneehöhe": themaLayer.schneehoehe.addTo(map),
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Control ist immer offen
layerControl.expand();

function getColor(value, ramp) {
    for (let rule of ramp) {
        if (value >= rule.min && value < rule.max) {
            return rule.color;
        }
    }
}
console.log(getColor(-40, COLORS.temperature));

function writeStationLayer(jsondata) {
    // Wetterstationen mit Icons und Popups implementieren
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
            let WG = (properties.WG) ? (properties.WG).toFixed(1) : "-";
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

function writeTemperatureLayer(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.LT, COLORS.temperature);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${feature.properties.LT.toFixed(1)}</span>`
                })
            });
        },
    }).addTo(themaLayer.temperature);
}

function writeWindLayer(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.WG > 0 && feature.properties.WG < 200) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.WG, COLORS.wind);
            let windKmh = feature.properties.WG   //Umrechnung von m pro s in kmh mit * 3,6
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${windKmh.toFixed(1)}</span>`
                })
            });
        },
    }).addTo(themaLayer.wind);
}

function writeSchneehoeheLayer(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.HS > 1 && feature.properties.HS < 999) {
                return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.HS, COLORS.Schneehoehe);
            let snowHS = feature.properties.HS
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${snowHS.toFixed(1)}</span>`
                })
            });
        },
    }).addTo(themaLayer.schneehoehe);
}

async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    writeStationLayer(jsondata);
    writeTemperatureLayer(jsondata);
    writeWindLayer(jsondata);
    writeSchneehoeheLayer(jsondata);
    //call function for Layer
}
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");

    // Change default options
    L.control.rainviewer({ 
        position: 'bottomleft',
        nextButtonText: '>',
        playStopButtonText: 'Play/Stop',
        prevButtonText: '<',
        positionSliderLabelText: "Hour:",
        opacitySliderLabelText: "Opacity:",
        animationInterval: 500,
        opacity: 0.5
    }).addTo(map);

