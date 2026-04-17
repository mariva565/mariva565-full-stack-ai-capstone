export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

export interface WeatherDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipProbability: number;
  windSpeed: number;
}

export interface WeatherHour {
  time: string;
  temperature: number;
  weatherCode: number;
  precipProbability: number;
  windSpeed: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast: WeatherDay[];
  hourly: WeatherHour[];
  cityName: string;
}
