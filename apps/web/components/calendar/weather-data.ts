import type { WeatherData } from "./weather-types";

type WeatherApiResponse = {
  timezone?: string;
  current?: Record<string, string | number>;
  current_weather_time?: string;
  hourly?: Record<string, Array<string | number>>;
  daily?: Record<string, Array<string | number>>;
};

function getCityName(weather: WeatherApiResponse, label?: string) {
  if (label) {
    return label;
  }

  const timezone = String(weather.timezone ?? "");
  return timezone.split("/").pop()?.replace(/_/g, " ") ?? "";
}

function buildHourlyForecast(
  hourlyData: Record<string, Array<string | number>>,
  currentTime: Date,
) {
  const times = (hourlyData.time ?? []) as string[];
  const temperatures = (hourlyData.temperature_2m ?? []) as number[];
  const weatherCodes = (hourlyData.weather_code ?? []) as number[];
  const precipitationProbabilities = (hourlyData.precipitation_probability ?? []) as number[];
  const windSpeeds = (hourlyData.wind_speed_10m ?? []) as number[];

  const startIndex = Math.max(
    0,
    times.findIndex((time) => new Date(time) >= currentTime),
  );

  return times.slice(startIndex, startIndex + 24).map((time, index) => ({
    time,
    temperature: Math.round(temperatures[startIndex + index] ?? 0),
    weatherCode: weatherCodes[startIndex + index] ?? 0,
    precipProbability: precipitationProbabilities[startIndex + index] ?? 0,
    windSpeed: Math.round(windSpeeds[startIndex + index] ?? 0),
  }));
}

function buildDailyForecast(dailyData: Record<string, Array<string | number>>) {
  const times = (dailyData.time ?? []) as string[];
  const maxTemperatures = (dailyData.temperature_2m_max ?? []) as number[];
  const minTemperatures = (dailyData.temperature_2m_min ?? []) as number[];
  const weatherCodes = (dailyData.weather_code ?? []) as number[];
  const precipitationProbabilities =
    (dailyData.precipitation_probability_max ?? []) as number[];
  const windSpeeds = (dailyData.wind_speed_10m_max ?? []) as number[];

  return times.slice(1, 4).map((date, index) => ({
    date,
    maxTemp: Math.round(maxTemperatures[index + 1] ?? 0),
    minTemp: Math.round(minTemperatures[index + 1] ?? 0),
    weatherCode: weatherCodes[index + 1] ?? 0,
    precipProbability: Math.round(precipitationProbabilities[index + 1] ?? 0),
    windSpeed: Math.round(windSpeeds[index + 1] ?? 0),
  }));
}

export function buildWeatherData(weatherResponse: unknown, label?: string): WeatherData {
  const weather = weatherResponse as WeatherApiResponse;
  const currentData = weather.current ?? {};
  const currentTime = new Date(
    String(weather.current_weather_time ?? currentData.time ?? ""),
  );

  return {
    current: {
      temperature: Math.round(Number(currentData.temperature_2m ?? 0)),
      apparentTemperature: Math.round(Number(currentData.apparent_temperature ?? 0)),
      humidity: Number(currentData.relative_humidity_2m ?? 0),
      windSpeed: Math.round(Number(currentData.wind_speed_10m ?? 0)),
      weatherCode: Number(currentData.weather_code ?? 0),
    },
    forecast: buildDailyForecast(weather.daily ?? {}),
    hourly: buildHourlyForecast(weather.hourly ?? {}, currentTime),
    cityName: getCityName(weather, label),
  };
}
