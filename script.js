// Initialize the map
let map;
let marker;

// Initialize the map
function initMap() {
  map = L.map('map-container').setView([37.7749, -122.4194], 10); // Default: San Francisco

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);
}

// Function to search for a location and show it on the map
function searchLocation() {
  const location = document.getElementById('location-input').value;

  if (location) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const lat = data[0].lat;
          const lon = data[0].lon;

          map.setView([lat, lon], 13);

          if (marker) {
            map.removeLayer(marker);
          }

          marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${data[0].display_name}</b>`).openPopup();

          // Fetch air quality data from the local JSON
          fetchAirQuality(location);
        } else {
          alert('Location not found!');
        }
      })
      .catch(error => {
        console.error('Error fetching location:', error);
        alert('An error occurred while searching for the location.');
      });
  } else {
    alert('Please enter a location!');
  }
}

// Function to fetch air quality data from the JSON file
function fetchAirQuality(location) {
  fetch('air_quality_data.json')
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
      if (data[location]) {
        const aqi = data[location];
        displayAirQuality(aqi); // Call function to display AQI
      } else {
        document.getElementById('air-quality').innerHTML = 'No air quality data available for this location.';
      }
    })
    .catch(error => {
      console.error('Error fetching air quality data:', error);
      document.getElementById('air-quality').innerHTML = 'Unable to fetch air quality data.';
    });
}

// Function to display air quality data
function displayAirQuality(aqi) {
  const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  const aqiDescriptions = [
    'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    'Air quality is acceptable; however, there may be some health concerns for a very small number of people.',
    'Air quality is acceptable, but there may be health effects for a large number of people.',
    'Air quality is poor, with health effects likely for the general population.',
    'Air quality is very poor, with health effects likely for everyone.'
  ];

  const level = aqiLevels[Math.min(aqi - 1, 4)] || 'Unknown';
  const description = aqiDescriptions[Math.min(aqi - 1, 4)] || 'No description available.';

  document.getElementById('air-quality').innerHTML = `
    <h2>Air Quality Index</h2>
    <p><strong>Level:</strong> ${level}</p>
    <p><strong>Description:</strong> ${description}</p>
  `;
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', initMap);
