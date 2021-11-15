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

saveData.addEventListener('click',(e) => {
  var barangay = document.getElementById('Barangay').value;
  var longitude = document.getElementById('longitude').value;
  var latitude = document.getElementById('latitude').value;
  // 8.234175, 124.235162

  addData(barangay, longitude, latitude);
  
  alert('saved');
  
});

// get a reference of the table
const dbRef = ref(db, 'Barangays/');

// get all values
onValue(dbRef,  function(snapshot){
  const data =  snapshot.val();
  var locations = [];
  // do something here
  // for(const property in data){
  //   // console.log(data[property]);
  //   let lat = data[property]['lat'];
  //   let lng = data[property]['lng'];
  //   locations.push([lat, lng]);
  // }
  // rebuild the map
  buildMap(locations);
});

function buildMap(locations = []){
  // check if the map is already initiated or not
  var container = L.DomUtil.get('map');
  if(container != null){
    container._leaflet_id = null;
  }
  
  document.getElementById('map').innerHTML = "<div id='map'></div>";
  var mymap = L.map('map').setView([8.229567, 124.245070], 14); 

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    zoom: 9,
    maxZoom: 15,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
  zoomOffset: -1
  }).addTo(mymap);

  // update marker
  for(const property in locations){
    var latlng = locations[property];
    console.log(latlng);
    L.marker(latlng).addTo(mymap);
  }

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
    const gsReference = storageRef(storage, 'gs://ilgempstat.appspot.com/PH10.json');

    getDownloadURL(gsReference)
    .then((data) => {
      var geoJsonFilePath = data;
  
      var getGeoJson = $.getJSON(geoJsonFilePath, function(json) {
        var geometries = json.geometries;
        // console.log(geometries);
    
        // const geoDataLen = geometries.length;
        // console.log(geoDataLen);
  
        for (let index = 0; index < ilg.length ; index++) {
  
          const i = ilg[index];
  
          const geo = geometries[i];
          // console.log(geo);
  
          // GeoJson Feature
          const geoJsonFeature = {
            "type": "Feature",
            "properties" :{
              "name": index,
              "popupContent": ""+index
            },
            "geometry" : geo,
          }
    
          const defaultStyle = {
            color: "#808080",
            fill: true,
          }
    
          L.geoJSON(geoJsonFeature, {
            style: defaultStyle
            })
            .bindPopup(function (layer){
              return layer.feature.properties.popupContent;
            })
            .addTo(mymap);
        }
      });
    })
    .catch((error) => {
      // Handle any errors
      console.log(error);
    });
  
  }else{
    var geoJsonFilePath = "PH10/PH10.json";
  
      var getGeoJson = $.getJSON(geoJsonFilePath, function(json) {
        var geometries = json.geometries;
        // console.log(geometries);
    
       
        // const geoDataLen = geometries.length;
        // console.log(geoDataLen);
  
        for (let index = 0; index < ilg.length ; index++) {
  
          const i = ilg[index];
  
          const geo = geometries[i];
          // console.log(geo);
  
          // GeoJson Feature
          const geoJsonFeature = {
            "type": "Feature",
            "properties" :{
              "name": index,
              "popupContent": ""+index
            },
            "geometry" : geo,
          }
    
          const defaultStyle = {
            color: "#808080",
            fill: true,
          }
    
          L.geoJSON(geoJsonFeature, {
            style: defaultStyle
            })
            .bindPopup(function (layer){
              return layer.feature.properties.popupContent;
            })
            .addTo(mymap);
        }
      });
  }

  
 
  
  

  

 
}



/**
 * 581
 * 607
 * 563
 * 603
 * 588
 * 673
 * 579
 * 597
 * 595
 * 596
 * 598
 * 593
 * 585
 * 614
 */





