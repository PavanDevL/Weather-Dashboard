import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

//import 'dotenv/config'
//require('dotenv').config();

const apiKey = "1205d384b934cc2fcd3bc40f4b287798";


function WeatherDashboard() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit
  const [selectedCity, setSelectedCity] = useState(null); // Store the selected city for the line chart
  const [temperatureData, setTemperatureData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 3;
  const startIndex = (currentPage - 1) * cardsPerPage;
const endIndex = startIndex + cardsPerPage;
const visibleCities = cities.slice(startIndex, endIndex);


useEffect(() => {
    // Fetch weather data for the initial cities (if any)
    if (cities.length > 0) {
      fetchWeather(cities[0].name); // You can fetch weather data for all initial cities here
    }
  }, [cities]);

  useEffect(() => {
    // Fetch historical temperature data when a city is selected
    if (selectedCity) {
      fetchHistoricalData(selectedCity);
    }
  }, [fetchHistoricalData, selectedCity]);



  async function fetchWeather(city) {
    //Adding the try and catch to handel the errors using the api.
    try{
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
      const data = await response.json();
      setCities((prevCities) => [...prevCities, data]);
      return data;
    } catch(error){
      console.error('Error fetching weather data:',error);
    }
  }

  const addCity = () => {
    const weather = fetchWeather(search);
    setCities([...cities, weather]);
  };
  //To fetch historical data for the line graph to display.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function fetchHistoricalData(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${city.coord.lat}&lon=${city.coord.lon}&dt=${Math.floor(
          Date.now() / 1000 - 86400
        )}&appid=${apiKey}&units=${unit}`
      );
      const data = await response.json();
      const hourlyTemperatures = data.hourly.map((hour) => hour.temp);

      setTemperatureData(hourlyTemperatures);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  }

  const deleteCity = (cityName) => {
    setCities((prevCities) => prevCities.filter((city) => city.name !== cityName));
  };

  return (
    <div>
      <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
      <button onClick={() => setCurrentPage(currentPage + 1)} disabled={endIndex >= cities.length}>Next</button>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} />
      <button onClick={addCity}>Add City</button>
      <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}>
        Toggle Temperature Unit
      </button>
      <div>
        {visibleCities.map(city => (
          <div key={city.name}>
            <h2>{city.name}</h2>
            {city.main && city.main.temp !== undefined ? (
              <p>Temperature: {city.main.temp}°{unit === 'metric' ? 'C' : 'F'}</p>
            ) : (
              <p>Temperature: N/A</p>
            )}
            <button onClick={() => deleteCity(city)}>Delete</button>
             <button onClick={() => setSelectedCity(city)}>Show Temperature Trend</button>
          </div>
        ))}
      </div>
    {selectedCity && (
        <div>
          <h3>Temperature Trend for {selectedCity.name}</h3>
          <Line
            data={{
              labels: [...Array(24).keys()].map((hour) => `${hour}:00`),
              datasets: [
                {
                  label: 'Temperature (°C)',
                  data: temperatureData,
                  fill: false,
                  borderColor: 'rgba(75,192,192,1)',
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
export default WeatherDashboard;