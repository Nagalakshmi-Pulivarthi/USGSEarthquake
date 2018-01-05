

L.TimeDimension.Layer.GeoJson.GeometryCollection = L.TimeDimension.Layer.GeoJson.extend({
  // Do not modify features. Just return the feature if it intersects
  // the time interval    
  _getFeatureBetweenDates: function(feature, minTime, maxTime) {
    var time = new Date(feature.properties.time);
      if (time > maxTime || time < minTime) {
          return null;
      }
      return feature;
  }
});
L.timeDimension.layer.geoJson.geometryCollection = function(layer, options) {
  return new L.TimeDimension.Layer.GeoJson.GeometryCollection(layer, options);
};

var queryurl="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

  var myMap = null;
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");


    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Outdoors": streetmap,
        "Grayscale": darkmap,
        "Satellite" : satmap
      };
   
      function getColor(mag)
      { 
          switch(parseInt( mag)){
              case 0: return '#b7f34d';
              case 1: return '#e1f34d';
              case 2: return '#f3db4d';
              case 3: return '#f3ba4d';
              case 4: return '#f0a76b';
              default: return '#f06b6b';
          }
      }
      var a1 = L.geoJSON([],{
                            pointToLayer: function(feature,latlng){
                               return L.circle(latlng,{
                                stroke:true,
                                fillOpacity: 0.75,
                                color: "gray",
                                weight :.5,
                                fillColor: getColor(feature.properties.mag),   
                                "radius":feature.properties.mag*10000});
                            }
                        })
                        .bindPopup(function(layer){
                            return("<h3>" + layer.feature.properties.place +
                              "</h3><hr><p>" + layer.feature.properties.mag + "</p><hr>" +
                              "</h3><hr><p>" + new Date(layer.feature.properties.time) + "</p>"
                              );
                          });
      var a2 = L.geoJSON([],{
                            style: function (feature) {
                                return {color: 'orange',fill:false,weight :2};
                            }
                        }).bindPopup(function (layer) {
                            return layer.feature.properties.description;
                        });

      // Create our map, giving it the streetmap and earthquakes layers to display on load
    myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap,a2],
        timeDimension: true,
        timeDimensionOptions: {
            timeInterval: "P1W/today",
            period: "P1D",
            autoPlay:true
        },
        timeDimensionControl: true,
        timeDimensionControlOptions:{
          loopButton:true,
          autoPlay:true
        }
    });

    var overlayMaps = {
      //  "Earthquakes": a1,
        "Fault Lines":a2
      };
    // Create a layer control
      // Pass in our baseMaps and overlayMaps
      // Add the layer control to the map
    L.control.layers(baseMaps,overlayMaps, {
        collapsed: false
      }).addTo(myMap);


    d3.json(queryurl, function(data) {
        // Once we get a response, send the data.features object to the createFeatures function
        //console.log(data)
        a1.addData(data.features);

        var geoJsonTimeLayer = L.timeDimension.layer.geoJson.geometryCollection(a1, {
          //waitForReady	:true
        }).addTo(myMap);

    });
    d3.json("PB2002_plates.json",function(data){
          //console.log(data.features);
          //createPolygons(data.features, a2);
          a2.addData(data.features);
    });
    CreateLegend();
    

    function CreateLegend()
    {
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var labels = ["0-1","1-2","2-3","3-4","4-5","5+"];  
      var legends = [];
      //div.innerHTML = legendInfo;
  
      for(var i=0;i<labels.length;i++) {
        legends.push("<li style=\"list-style-type:none;\"><div style=\"background-color: " + getColor(i) + "\">&nbsp;</div> "+
                                                         "<div>"+ labels[i]+"</div></li>");
      }
  
      div.innerHTML += "<ul class='legend'>" + legends.join("") + "</ul>";
      return div;
    };
  
    // Adding legend to the map
    legend.addTo(myMap);
    }
    

      