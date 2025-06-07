// Declare variables for the map and an info window
let map;
let infowindow;

// Initializes the Google Map
function initMap() {
  const defaultLocation = { lat: 34.0522, lng: -118.2437 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 13,
  });

  infowindow = new google.maps.InfoWindow();
}

// Called when the user clicks the "Search" button
function searchLocation() {
  const input = document.getElementById("location-input").value;
  const geocoder = new google.maps.Geocoder();

  if (!input) {
    alert("Please enter a location.");
    return;
  }

  geocoder.geocode({ address: input }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;
      map.setCenter(location);
      findNearbyRestaurants(location);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

// Finds nearby restaurants using Places API REST endpoint
async function findNearbyRestaurants(location) {
  const locationStr = `${location.lat()},${location.lng()}`;
  const radius = 1500;
  const type = 'restaurant';

  try {
    const response = await fetch(`https://us-central1-eminent-augury-462006-t9.cloudfunctions.net/placesProxy?location=${locationStr}&radius=${radius}&type=${type}`);
    const data = await response.json();
    

    if (data.status === "OK") {
      displayResults(data.results, google.maps.places.PlacesServiceStatus.OK);
    } else {
      displayResults([], google.maps.places.PlacesServiceStatus.ZERO_RESULTS);
    }
  } catch (error) {
    console.error("Error calling proxy:", error);
  }
}


// Displays the search results on the map and in the list
function displayResults(results, status) {
  const resultsList = document.getElementById("results");
  resultsList.innerHTML = "";

  if (status === "OK") {
    results.forEach(place => {
      const placeForMarker = {
        geometry: {
          location: new google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng)
        },
        name: place.name,
        vicinity: place.vicinity || "",
      };

      createMarker(placeForMarker);

      const li = document.createElement("li");
      li.classList.add("result-item");
      li.textContent = place.name + (place.vicinity ? ` – ${place.vicinity}` : "");
      resultsList.appendChild(li);
    });
  } else {
    resultsList.innerHTML = "<li>No restaurants found.</li>";
  }
}

// Creates a marker on the map for a given place
function createMarker(place) {
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
  });

  google.maps.event.addListener(marker, "click", () => {
    infowindow.setContent(place.name);
    infowindow.open(map, marker);
  });
}

// Expose initMap globally so Google Maps API can find it
window.initMap = initMap;
