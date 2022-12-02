import React, { useState, useEffect, useCallback } from "react";
import { formatWeatherDataDaily } from "./utils/formatWeatherDataDaily";
import TodayCard from "./components/TodayCard";
import WeekDayCard from "./components/WeekDayCard";
import styled from "styled-components";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [weatherUnits, setWeatherUnits] = useState({});
  const [geoLoc, setGeoLoc] = useState({ latitude: 0, longitude: 0 });

  const fetchWeather = useCallback(async (fetchUrl) => {
    setError(false);
    try {
      const res = await fetch(fetchUrl);
      const data = await res.json();

      if (Object.keys(data).length === 0) {
        setError(true);
      } else {
        const formattedDailyData = formatWeatherDataDaily(data.daily);
        setWeatherData(formattedDailyData);

        setWeatherUnits({
          rain: data.daily_units.precipitation_sum,
          temperature: data.daily_units.temperature_2m_max,
          wind: data.daily_units.windspeed_10m_max,
        });
      }
    } catch (error) {
      setError(true);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (!navigator.geolocation) {
      window.alert(
        "Votre navigateur ne permet pas la géolocalisation pour utiliser cette application !"
      );
    }

    getGeolocalisation();

    fetchWeather(
      `https://api.open-meteo.com/v1/forecast?latitude=${geoLoc.latitude}&longitude=${geoLoc.longitude}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,windspeed_10m_max&timezone=Europe%2FLondon`
    ).then(() => setIsLoading(false));
  }, [fetchWeather, geoLoc.latitude, geoLoc.longitude]);

  const getGeolocalisation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoc({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setError(true);
      }
    );
  };

  if (isLoading) {
    return (
      <Container>
        <Message>
          Loading...
        </Message>
      </Container>
    );
  }

  if (!isLoading && weatherData.length === 0) {
    return (
      <Container>
        <Message>
          No result, please try again...
        </Message>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Message>
          Error append when trying to fetch weather info...
        </Message>
      </Container>
    );
  }

  return (
    <Container>
      <WeatherInfo>
        <TodayCard data={weatherData[0]} weatherUnits={weatherUnits} />
        <div className=" grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-6">
          {weatherData &&
            weatherData
              .slice(1, weatherData.length)
              .map((data, index) => (
                <WeekDayCard
                  key={index}
                  data={data}
                  weatherUnits={weatherUnits}
                />
              ))}
        </div>
      </WeatherInfo>
    </Container>
  );
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Message = styled.p`
  font-size: 20px;
  color: white;
  font-family: Poppins;
  letter-spacing: 2px;
  text-transform: uppercase;
`

const WeatherInfo = styled.div`
  width: 30%;
  height: 50%;
  background-color: #333333D9;
  backdrop-filter: blur(8px);
  border-radius: 8px;
`

export default App;
