var geocoder;
var map;
var startlocation;


function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(37.870758, -122.250421);
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  GetLatLng();
    console.log("initialize")
}

// centers the map but prints out lat/long to console
function getLatLong() {
  var address = document.getElementById('address').value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      

      // Display Lay/Lon
      console.log(results[0].geometry.location.lat())
      console.log(results[0].geometry.location.lng())

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function GetLatLng(){

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }


    function showPosition(position) {
        console.log("Latitude: " + position.coords.latitude +
            "<br>Longitude: " + position.coords.longitude);

        startlocation = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude, false);
    }

}

// Show direction from start to end
function GetGoogleData(type, callback) {

  var endlocation = document.getElementById('geocomplete').value

  var map = new google.maps.Map(document.getElementById('map-canvas'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();

  directionsDisplay.setMap(map);

  // Decide type of transportation
  //var googleTransType = null

  /*
  switch(type)
  {
    case "walking":
      googleTransType = google.maps.TravelMode.WALKING
      break
    case "driving":
      googleTransType = google.maps.TravelMode.DRIVING
      break;
    case "biking":
      googleTransType = google.maps.TravelMode.BICYCLING
      break;
    case "transit":
      googleTransType = google.maps.TravelMode.TRANSIT
      break;
    default:
      break;
  }
  */

  var request = {
  origin: startlocation, 
  destination: endlocation,
  travelMode: type, 
  transitOptions: {departureTime: new Date()}
  };


  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      
      // calc total time by finding time from each leg
      var route = directionsDisplay.getDirections()

      // be sure there is at least one route
      if(route.routes[0] != null)
      {
        // array of all the legs on this route
        var legs = route.routes[0].legs

        // Traffic time or no?
        var traffic = false

        // Total time in seconds
        var totalTime = 0

        // Total distance in meters
        var totalDistance = 0

        // go through all legs and total up the time
        for(var i = 0; i < legs.length; i++)
        {
          if(traffic)
            totalTime = legs[i].duration_in_traffic.value
          else
            totalTime = legs[i].duration.value

          // Add distance of leg to total distance
          totalDistance += legs[i].distance.value
        }

        var hrs = Math.floor(totalTime / 3600)
        totalTime = totalTime % 3600
        var mins = Math.floor(totalTime / 60)
        totalTime = totalTime % 60
        var secs = totalTime

        // Call the callback function when query is done
        callback({
          'Type' : type,
          'Hours' : hrs, 
          'Minutes' : mins,
          'Seconds' : secs,
          // convert meters -> miles and round 2 decimal values
          // to fixed returns a string and not a number
          'Distance' : ((totalDistance * 0.000621371).toFixed(2)/1)
        })
      }
    }
    else
    {
      callback({
          'Type' : type,
          'Hours' : null, 
          'Minutes' : null,
          'Seconds' : null,
          'Distance' : null
      })
    }
  });
}

function GetDuration()
{
  var durationData = []
  /*
  var inputElements = document.getElementsByClassName('transportation')
  for(var i=0; inputElements[i]; ++i){
        if(inputElements[i].checked){

          var data = null
          GetGoogleData(inputElements[i].value, 
            function(data) {
              durationData.push(data); 
              if(durationData.length == inputElements.length)
              {
                // When all data is done, print it
                alertUser(durationData)
                var jsonFile = make_json(durationData)
                console.log(jsonFile)
              }
          })
        }
        else
        {
          durationData.push({
          'Type' : inputElements[i].value,
          'Hours' : null, 
          'Minutes' : null,
          'Seconds' : null,
          'Distance' : null
          })
        }
  }
  */

  // Array to store all google transportation types
  var transportationType = [google.maps.TravelMode.WALKING, 
    google.maps.TravelMode.DRIVING, google.maps.TravelMode.BICYCLING, 
    google.maps.TravelMode.TRANSIT]

  for(var i = 0; i < transportationType.length; i++)
    GetGoogleData(transportationType[i], function(data) {
              durationData.push(data); 
              if(durationData.length == transportationType.length)
              {
                // When all data is done, print it
                alertUser(durationData)
                var jsonFile = make_json(durationData)
                console.log(jsonFile)
              }
          })

}

// print out all the data
function alertUser(durationData)
{

  var durations = ""

  // String builder
  for(var i = 0; i < durationData.length; i++)
  {
    durations += "Type: " + durationData[i].Type + " Hours: " + durationData[i].Hours +
      " Minutes: " + durationData[i].Minutes + " Seconds: " + durationData[i].Seconds + "\n"
  }

  alert(durations);
}

// Convert transportation data array into JSON
function make_json(data) {

  var final = {};
  for (var i = 0; i < data.length; i++) {
          final[data[i].Type] = data[i];
  }
  return final;
}

// Caculat driving cost ; time_drive is minutes
function driving_cost(distance, time_drive) {
  var cost = (distance / 25) * 3.80;
  if (time_drive > 25) {
    cost += time_drive * 0.05
  }
  else {
    cost += time_drive * 0.1
  }
  return cost
}

google.maps.event.addDomListener(window, 'load', initialize);
