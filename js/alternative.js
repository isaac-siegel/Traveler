var geocoder;
var map;
var startlocation;
var endlocation;


function initialize(callback) {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(37.870758, -122.250421);
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  
  callback
}

// Returns a wrapper with lat/long for address
function ConvertToLatLgn(address, callback) {
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var temp = {
          'Lat' : results[0].geometry.location.lat(),
          'Long' : results[0].geometry.location.lng()
      }
      callback(temp)
      //callback(console.log(results[0].geometry.location.lat()))
      
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

        // copy of total time to preserver total time's value
        var time = totalTime

        var hrs = Math.floor(time / 3600)
        time = time % 3600
        var mins = Math.floor(time / 60)
        time = time % 60
        var secs = time

        // Convert meters to miles
        var miles = ((totalDistance * 0.000621371).toFixed(2)/1)

        // Call the callback function when query is done
        callback({
          'Type' : type,
          'Hours' : hrs, 
          'Minutes' : mins,
          'Seconds' : secs,
          // convert meters -> miles and round 2 decimal values
          // to fixed returns a string and not a number
          'Distance' : miles,
          'Price' : ReturnPrice(type, totalTime, miles)
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
          'Distance' : null,
          'Price' : null
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

                //Populate table
                  PopulateTable(durationData);
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
    ConvertToLatLgn(document.getElementById('geocomplete').value, function(LatLong){
      endlocation = new google.maps.LatLng(LatLong.Lat, LatLong.Long) 
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
    })


}

function durationToString(data)
{
    var str = "";
    if(data.Hours > 0 && data != null)
    {
        str += data.Hours + "hrs";
    }
    if(data.Minutes > 0 && data !=null)
    {
        str += " " + data.Minutes + "mins";
    }
    return str;

}


function PopulateTable(durationData){

    document.getElementById("uberTime").innerHTML = -1;
    document.getElementById("drivingTime").innerHTML = durationToString(durationData[0]);
    document.getElementById("walkingTime").innerHTML = durationToString(durationData[2]);
    document.getElementById("busTime").innerHTML = durationToString(durationData[1]);
    document.getElementById("bikingTime").innerHTML = durationToString(durationData[3]);



    document.getElementById("uberCost").innerHTML = -1;
    document.getElementById("drivingCost").innerHTML = -1;
    document.getElementById("walkingCost").innerHTML = -1;
    document.getElementById("busCost").innerHTML = -1;


}

function PrioritySpeed(){
    GetDuration();
    if (obj.walk.eta < 600) highlight(2);
    else if (obj.bike.eta < obj.car.eta + 200 && obj.bike.eta < obj.uber.time) 
      highlight(4)
    else if (obj.bike.eta > obj.car.eta + 200 && obj.car.eta + 180< obj.uber.time)
      highlight(3)
    else if (obj.bus.eta < obj.uber.time) highlight(1);
    else highlight(0);
}

function PriorityMoney(){
    GetDuration();
    if (obj.walk.eta < 300) highlight(2);
    if (obj.bike.eta < 700) highlight(4);
    highlight(3)


}

function highlight(rowNumber) {
    //TODO: highlight the specific part
    // of the ending results table

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
  //Populate table
  PopulateTable(durationData);
}

// Convert transportation data array into JSON
function make_json(data) {

  obj = {};
  for (var i = 0; i < data.length; i++) {
          obj[data[i].Type] = data[i];
  }
  return obj;
}

// Price calculator based on type of trans
function ReturnPrice(type, time, distance)
{
  switch (type)
  {
    case google.maps.TravelMode.WALKING :
      return calc_calories_walking(time)
    case google.maps.TravelMode.DRIVING :
      return driving_cost(time, distance)
    case google.maps.TravelMode.BICYCLING :
      return calc_calories_biking(distance)
    case google.maps.TravelMode.TRANSIT :
      return bus_cost()
    default :
      return "N/A" 
      break;
  }
}

// Calculate bus fare in the bay - 
// if you cross this longitude
function bus_cost()
{
  var fare = 2

  if ((startlocation.lng() < -122.335783 && endlocation.lng() > -122.335783)
    || (startlocation.lng() > -122.335783 && endlocation.lng() < -122.335783)) 
  {
    fare = Math.random() * 3 + 4
  }
  return fare.toFixed(2)
}

// Caculate driving cost ; time_drive is minutes
function driving_cost(time, distance) {
  var cost = (distance / 25) * 3.80;
  if (time > 25*60) {
    cost += (time/60) * 0.05
  }
  else {
    cost += (time/60) * 0.1
  }

  return cost.toFixed(2)
}

// Calculate calories burned from biking
function calc_calories_biking(distance) {
  return (distance * 42);
}

// Calculate calories burn from walking
function calc_calories_walking(time) {
  return (10 * (time/(4.184*60))).toFixed(2);
}

google.maps.event.addDomListener(window, 'load', initialize(GetLatLng()));
