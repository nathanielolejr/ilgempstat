// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-database.js";
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4myV7wAp5hNpjBWT2URSB3k5i-PV-cUc",
  authDomain: "ilgempstat.firebaseapp.com",
  databaseURL: "https://ilgempstat-default-rtdb.firebaseio.com",
  projectId: "ilgempstat",
  storageBucket: "ilgempstat.appspot.com",
  messagingSenderId: "239426682732",
  appId: "1:239426682732:web:21f0f7562aaa4495c47d49",
  measurementId: "G-41V3TF1ZXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database
const db = getDatabase();


function addData(barangay, lng, lat){
  set(ref(db, 'Barangays/'+ barangay), {
    Barangay: barangay, 
    lat: lat,
    lng : lng
  });
}

// get a reference of the table
const dbRef = ref(db, 'Barangays/');

// get all values
onValue(dbRef,  function(snapshot){
  const data =  snapshot.val();
  // rebuild the map
  buildMap();
});



function buildMap(locations = []){
  // check if the map is already initiated or not
  var container = L.DomUtil.get('map');
  if(container != null){
    container._leaflet_id = null;
  }
  
  document.getElementById('map').innerHTML = "<div id='map'></div>";
  var mymap = L.map('map').setView([8.229567, 124.245070], 12); 

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
  zoomOffset: -1
  }).addTo(mymap);

  // GeoJson
  
  /**
   *  if you want to test it locally
   * 
   *  set variable online to false.
   * 
   *  -------------------------------------------
   *  online = true
   *  read the json file in the firebase storage
   *  
   *  Note: Press F12, to view console, if mag error siya
   *  then nag state something about CORS
   * 
   *  see: https://firebase.google.com/docs/storage/web/download-files#cors_configuration
   *  
   */

  var online = true;

  var ilg = [
    835,
    648, 616,
    602, 605,
    594, 599,
    583, 604,
    600, 847,
    615, 611,
    853, 671,
    606, 1944,
    2010, 584,
    582, 580,
    608, 587,
    586, 862,
    581, 607,
    563, 603,
    588, 673,
    579, 597,
    595, 596,
    598, 593,
    585, 589,
    614, 825,
    601, 610,
  ];

  if(online){
    // Get a reference to the storage service, which is used to create references in your storage bucket
    const storage = getStorage();
    // console.log(storage);
    
    // Create a reference from a Google Cloud Storage URI
    const gsReference = storageRef(storage, "gs://ilgempstat.appspot.com/PH10.json");

    getDownloadURL(gsReference)
    .then((data) => {
      showGeoJson(mymap, ilg, data);
    })
    .catch((error) => {
      // Handle any errors
      console.log(error);
    });
  }else{
    showGeoJson(mymap, ilg);
  } 
}

function getColor(value) {
  return value > 1000 ? '#800026' :
         value > 500  ? '#BD0026' :
         value > 200  ? '#E31A1C' :
         value > 100  ? '#FC4E2A' :
         value > 50   ? '#FD8D3C' :
         value > 20   ? '#FEB24C' :
         value > 10   ? '#FED976' :
                    '#FFEDA0';
}

function style(feature) {
  return {
      fillColor: getColor(feature.properties.employment),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
  };
}


function showGeoJson(map, iligan, geoJsonFile = "PH10/PH10.json"){
  var getGeoJson = $.getJSON(geoJsonFile, function(json) {
    var geometries = json.geometries;

    // custom info window
    var info = L.control();

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    // method that we will use to update the control based on feature properties 
    // passed
    info.update = function (props) {
      this._div.innerHTML = '<h4>Employment Status Per Barangay in Iligan City</h4>' +  (props ?
          '<b>' + props.name + '</b><br />' + props.employment + ' employed / mi<sup>2</sup>'
          : 'Hover over a state');
    };

    info.addTo(map);

    // custom legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);

    for (let index = 0; index < iligan.length ; index++) {

      const i = iligan[index];

      const geo = geometries[i];

      // GeoJson Feature
      const geoJsonFeature = {
        "type": "Feature",
        "properties" :{
          "name": i,
          "employment": Math.floor(Math.random() * 1000),
          "description" : 
            "<h2>BARANGAY NAME</h2>" +
            "<table><thead><tr><th>Status</th><th>Counter</th></tr></thead>" +
            "<tbody>"+
            "<tr><td>Contractual</td><td>"+ Math.floor(Math.random() * 1000) +"</td></tr>"+
            "<tr><td>Regular</td><td>"+ Math.floor(Math.random() * 1000) +"</td></tr>"+
            "<tr><td>Freelancer</td><td>"+ Math.floor(Math.random() * 1000) +"</td></tr>"+
            "<tr><td>Part time</td><td>"+ Math.floor(Math.random() * 1000) +"</td></tr>" +
            "</tbody></table>"
        },
        "geometry" : geo,
      }

      const defaultStyle = {
        color: "#808080",
        fill: true,
      }

      

      var geoJson = L.geoJSON(geoJsonFeature, {
        style: style,
        onEachFeature: function(feature, layer){
          layer.on({
            mouseover: function(e){
              var layer = e.target;
              layer.setStyle({
                  weight: 5,
                  color: "#316B83",
                  dashArray: '',
                  fillOpacity: 0.7
              });

              info.update(layer.feature.properties);

              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  layer.bringToFront();
              }
            },
            mouseout: function(e){
              geoJson.resetStyle(e.target);
              info.update();
            },
            
          });
        },
        })
        .bindPopup(function (layer){
          return layer.feature.properties.description;
        })
        .addTo(map);




    }
  });
}









