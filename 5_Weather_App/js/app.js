// Configuration
const config = {
    apiKey: '2b59073ec277d4fc62ad67dcdd9ad65b',
    baseUrl: 'https://api.openweathermap.org/data/2.5/',
    iconBaseUrl: 'https://openweathermap.org/img/wn/',
    units: 'imperial' // Default to Fahrenheit
};

// DOM Elements
const elements = {
    locationInput: document.getElementById('location-input'),
    searchBtn: document.getElementById('search-btn'),
    currentLocationBtn: document.getElementById('current-location-btn'),
    currentCity: document.getElementById('current-city'),
    currentDate: document.getElementById('current-date'),
    currentDescription: document.getElementById('current-description'),
    currentIcon: document.getElementById('current-icon'),
    currentTemp: document.getElementById('current-temp'),
    windSpeed: document.getElementById('wind-speed'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    hourlyContainer: document.getElementById('hourly-container'),
    dailyContainer: document.getElementById('daily-container'),
    uvIndex: document.getElementById('uv-index'),
    visibility: document.getElementById('visibility'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    loadingOverlay: document.getElementById('loading-overlay'),
    unitF: document.getElementById('unit-f'),
    unitC: document.getElementById('unit-c')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    elements.searchBtn.addEventListener('click', searchLocation);
    elements.currentLocationBtn.addEventListener('click', getCurrentLocationWeather);
    elements.locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchLocation();
    });
    elements.unitF.addEventListener('click', () => switchUnits('imperial'));
    elements.unitC.addEventListener('click', () => switchUnits('metric'));
    
    // Load weather for default location
    fetchWeatherByLocation('New York');
}

// Main weather fetching function
async function fetchWeatherByLocation(location) {
    showLoading(true);
    try {
        // First get coordinates for the location
        const geoResponse = await fetch(
            `${config.baseUrl}weather?q=${encodeURIComponent(location)}&appid=${config.apiKey}`
        );
        
        if (!geoResponse.ok) {
            throw new Error(await geoResponse.text());
        }
        
        const geoData = await geoResponse.json();
        
        // Then get full forecast data
        const forecastResponse = await fetch(
            `${config.baseUrl}onecall?lat=${geoData.coord.lat}&lon=${geoData.coord.lon}` +
            `&exclude=minutely,alerts&units=${config.units}&appid=${config.apiKey}`
        );
        
        if (!forecastResponse.ok) {
            throw new Error(await forecastResponse.text());
        }
        
        const forecastData = await forecastResponse.json();
        
        // Update UI with both sets of data
        updateCurrentWeather(geoData, forecastData.current);
        updateForecast(forecastData);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please check the location and try again.');
    } finally {
        showLoading(false);
    }
}

// Update current weather display
function updateCurrentWeather(geoData, currentData) {
    elements.currentCity.textContent = `${geoData.name}, ${geoData.sys.country}`;
    elements.currentDescription.textContent = currentData.weather[0].description;
    elements.currentTemp.textContent = Math.round(currentData.temp);
    elements.windSpeed.textContent = Math.round(currentData.wind_speed);
    elements.humidity.textContent = currentData.humidity;
    elements.pressure.textContent = currentData.pressure;
    
    // Update weather icon
    elements.currentIcon.src = `${config.iconBaseUrl}${currentData.weather[0].icon}@2x.png`;
    elements.currentIcon.alt = currentData.weather[0].description;
    
    // Update date
    const now = new Date();
    elements.currentDate.textContent = formatDate(now);
}

// Update forecast sections
function updateForecast(data) {
    updateHourlyForecast(data.hourly);
    updateDailyForecast(data.daily);
    updateAdditionalData(data.current);
}

function updateHourlyForecast(hourlyData) {
    elements.hourlyContainer.innerHTML = '';
    
    // Show next 12 hours
    for (let i = 0; i < 12; i++) {
        const hourData = hourlyData[i];
        const hourTime = new Date(hourData.dt * 1000);
        
        const hourItem = document.createElement('div');
        hourItem.className = 'hourly-item';
        hourItem.innerHTML = `
            <div>${formatHour(hourTime.getHours())}</div>
            <img src="${config.iconBaseUrl}${hourData.weather[0].icon}.png" alt="${hourData.weather[0].description}">
            <div>${Math.round(hourData.temp)}°</div>
        `;
        elements.hourlyContainer.appendChild(hourItem);
    }
}

function updateDailyForecast(dailyData) {
    elements.dailyContainer.innerHTML = '';
    
    // Skip today (index 0) since we show that in current weather
    for (let i = 1; i < Math.min(dailyData.length, 6); i++) {
        const dayData = dailyData[i];
        const dayDate = new Date(dayData.dt * 1000);
        
        const dayItem = document.createElement('div');
        dayItem.className = 'daily-item';
        dayItem.innerHTML = `
            <div>${formatDay(dayDate)}</div>
            <img src="${config.iconBaseUrl}${dayData.weather[0].icon}.png" alt="${dayData.weather[0].description}">
            <div class="daily-temp">
                <span>${Math.round(dayData.temp.max)}°</span>
                <span class="text-light">${Math.round(dayData.temp.min)}°</span>
            </div>
        `;
        elements.dailyContainer.appendChild(dayItem);
    }
}

function updateAdditionalData(currentData) {
    // UV Index
    elements.uvIndex.textContent = Math.round(currentData.uvi);
    setUvIndexRisk(currentData.uvi);
    
    // Visibility (convert meters to miles)
    const visibilityMiles = (currentData.visibility / 1609.34).toFixed(1);
    elements.visibility.textContent = visibilityMiles;
    
    // Sunrise/Sunset
    const sunriseTime = new Date(currentData.sunrise * 1000);
    const sunsetTime = new Date(currentData.sunset * 1000);
    elements.sunrise.textContent = formatTime(sunriseTime);
    elements.sunset.textContent = formatTime(sunsetTime);
}

function setUvIndexRisk(uvi) {
    const uvRiskElement = elements.uvIndex.nextElementSibling;
    let riskLevel = '';
    let bgColor = '';
    
    if (uvi < 3) {
        riskLevel = 'Low';
        bgColor = '#2ecc71';
    } else if (uvi < 6) {
        riskLevel = 'Moderate';
        bgColor = '#f39c12';
    } else if (uvi < 8) {
        riskLevel = 'High';
        bgColor = '#e74c3c';
    } else if (uvi < 11) {
        riskLevel = 'Very High';
        bgColor = '#9b59b6';
    } else {
        riskLevel = 'Extreme';
        bgColor = '#e91e63';
    }
    
    uvRiskElement.textContent = riskLevel;
    uvRiskElement.style.backgroundColor = bgColor;
}

// Location functions
function searchLocation() {
    const location = elements.locationInput.value.trim();
    if (location) {
        fetchWeatherByLocation(location);
    } else {
        alert('Please enter a location');
    }
}

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `${config.baseUrl}weather?lat=${latitude}&lon=${longitude}&units=${config.units}&appid=${config.apiKey}`
                    );
                    
                    if (!response.ok) {
                        throw new Error(await response.text());
                    }
                    
                    const data = await response.json();
                    elements.locationInput.value = `${data.name}, ${data.sys.country}`;
                    fetchWeatherByLocation(`${data.name},${data.sys.country}`);
                } catch (error) {
                    console.error('Error fetching location weather:', error);
                    alert('Failed to get weather for your location');
                } finally {
                    showLoading(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Location access denied. Please enable location services.');
                showLoading(false);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Unit conversion
function switchUnits(unitSystem) {
    config.units = unitSystem;
    
    if (unitSystem === 'imperial') {
        elements.unitF.classList.add('active');
        elements.unitC.classList.remove('active');
    } else {
        elements.unitF.classList.remove('active');
        elements.unitC.classList.add('active');
    }
    
    const currentLocation = elements.currentCity.textContent;
    if (currentLocation) {
        fetchWeatherByLocation(currentLocation.split(',')[0].trim());
    }
}

// UI Helpers
function showLoading(show) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Formatting functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
    });
}

function formatHour(hour) {
    return new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { 
        hour: 'numeric' 
    });
}

function formatDay(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'short' 
    });
}