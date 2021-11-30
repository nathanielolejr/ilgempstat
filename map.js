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
  // console.log(data);
  buildMap(data);
});



function buildMap(realTimeData){
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

  var online = false;

  var ilg = {
    590:{"name":"Rogongon", "density":39.08}, 
    612:{"name":"Panoroganan", "density":37.21},
    609:{"name":"Kalilangan", "density":56.59}, 
    601:{"name":"Dulag", "density":83.93},
    610:{"name":"Lanipao", "density":352.1}, 
    587:{"name":"Mandulog", "density":371.5},
    589:{"name":"Puga-an", "density":286.2}, 
    595:{"name":"Tipanoy", "density":1354},
    579:{"name":"Abuno", "density":797.6}, 
    597:{"name":"Tominobo Upper", "density":530.9},
    607:{"name":"Ditucalan", "density":791.7}, 
    581:{"name":"Buru-un", "density":2790},
    586:{"name":"Mainit", "density":111.1}, 
    608:{"name":"Hindang", "density":92.78},
    580:{"name":"Bunawan", "density":153.9}, 
    582:{"name":"Dalipuga", "density":1356},
    1944:{"name":"Kiwalan", "density":1010},
    584:{"name":"Kabacsanan", "density":200.3},
    606:{"name":"Acmac", "density":6580}, 
    2010:{"name":"Bonbonon", "density":330.9},
    862:{"name":"Digkilaan", "density":168.7}, 
    588:{"name":"Maria Cristina", "density":2396},
    673:{"name":"Suarez", "density":3260}, 
    596:{"name":"Tominobo Proper", "density":4404},
    603:{"name":"Santa Elena", "density":3013}, 
    598:{"name":"Tubod", "density":9536},
    614:{"name":"Ubaldo Laya", "density":4555},
    593:{"name":"Tambacan", "density":35122},
    585:{"name":"Mahayhay", "density":16203}, 
    847:{"name":"Palao", "density":5579},
    616:{"name":"Villa Verde", "density":15840},
    648:{"name":"Saray-Tibanga", "density":17097},
    835:{"name":"Poblacion", "density":10135}, 
    602:{"name":"San Miguel", "density":7555},
    605:{"name":"Tibanga", "density":15326}, 
    599:{"name":"Bagong Silang", "density":14740},
    600:{"name":"Del Carmen", "density":5230}, 
    611:{"name":"Luinab", "density":4117},
    853:{"name":"Santa Filomena", "density":3585}, 
    671:{"name":"San Roque", "density":2907},
    615:{"name":"Upper Hinaplanon", "density":4401}, 
    583:{"name":"Hinaplanon", "density":5315},
    604:{"name":"Santiago", "density":9366}, 
    594:{"name":"Santo Rosario", "density":5899},
  };

  if(online){
    // Get a reference to the storage service, which is used to create references in your storage bucket
    const storage = getStorage();
    // console.log(storage);
    
    // Create a reference from a Google Cloud Storage URI
    const gsReference = storageRef(storage, "gs://ilgempstat.appspot.com/PH10.json");

    getDownloadURL(gsReference)
    .then((geoJsonData) => {
      showGeoJson(mymap, ilg, realTimeData, geoJsonData);
    })
    .catch((error) => {
      // Handle any errors
      console.log(error);
    });
  }else{
    showGeoJson(mymap, ilg, realTimeData);
  } 
}

// choropleth color scheme
function getColor(value) {
  // 1000+      : #800026
  // 500 - 1000 : #BD0026
  // 200 - 500  : #E31A1C
  // 100 - 200  : #FC4E2A
  // 50 - 100   : #FD8D3C
  // 20 - 50    : #FEB24C
  // 10 - 20    : #FED976
  // 0 - 10     : #FFEDA0

  return value > 1000 ? '#800026' : 
         value > 500  ? '#BD0026' : 
         value > 200  ? '#E31A1C' : 
         value > 100  ? '#FC4E2A' : 
         value > 50   ? '#FD8D3C' : 
         value > 20   ? '#FEB24C' : 
         value > 10   ? '#FED976' : 
                    '#ffffff00'; 
}

function style(feature) {
  return {
      fillColor: getColor(feature.properties.employement),
      weight: 2,
      opacity: 1,
      color: 'black', // border color
      dashArray: '3',
      fillOpacity: 0.7
  };
}


function showGeoJson(map, iligan, realTimeData, geoJsonFile = "PH10/PH10.json"){
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
      console.log(props);
      this._div.innerHTML = '<h4>Employment Status Per Barangay in Iligan City</h4>' +  (props ?
          '<b>' + props.name + '</b><br />Density: ' + props.density + '/ km<sup>2</sup>'
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
    
    for (var i in iligan) {

      const barangay = iligan[i];
      
      const geo = geometries[i];

      var fbBarangayData = {
        "Contractual" : 0,
        "Regular" : 0,
        "Freelancer" : 0,
        "PartTimer" : 0,
      };
      
      for(var b in realTimeData){
        let data = realTimeData[b];
        if(data.Barangay.toLowerCase() == barangay.name.toLowerCase()){
          fbBarangayData = realTimeData[b];
          break
        }
      }

      const totalEmployement = parseInt(fbBarangayData.Contractual) + parseInt(fbBarangayData.Regular) + parseInt(fbBarangayData.Freelancer) + parseInt(fbBarangayData.PartTimer);
      // GeoJson Feature
      const geoJsonFeature = {
        "type": "Feature",
        "properties" :{
          "name": barangay.name,
          "density": barangay.density,
          "employement": totalEmployement,
          "description" : 
            "<h2>"+ barangay.name +"</h2>" +
            "<table><thead><tr><th>Status</th><th>Counter</th></tr></thead>" +
            "<tbody>"+
            "<tr><td>Contractual</td><td>"+ fbBarangayData.Contractual +"</td></tr>"+
            "<tr><td>Regular</td><td>"+ fbBarangayData.Regular +"</td></tr>"+
            "<tr><td>Freelancer</td><td>"+ fbBarangayData.Freelancer +"</td></tr>"+
            "<tr><td>Part time</td><td>"+ fbBarangayData.PartTimer +"</td></tr>" +
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
                  color: "#fff",
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









