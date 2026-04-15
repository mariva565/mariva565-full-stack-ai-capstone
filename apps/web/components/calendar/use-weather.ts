"use client";

import { useEffect, useRef, useState } from "react";

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

export type WeatherStatus = "idle" | "locating" | "loading" | "ready" | "denied" | "error";

export function useWeather() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [error, setError] = useState("");
  const lastCoordsRef = useRef<{ lat: number; lon: number; label?: string } | null>(null);
  const initialised = useRef(false);

  // Live clock — 1 s tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-geolocation on mount
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void loadWeather(coords.latitude, coords.longitude),
      (err) => {
        // PERMISSION_DENIED (1) → truly denied; other codes → retriable error
        if (err.code === 1) {
          setStatus("denied");
        } else {
          setError("Could not get your location. Try again or enter a city.");
          setStatus("error");
        }
      },
      { timeout: 12000, maximumAge: 60000 },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWeather(lat: number, lon: number, label?: string) {
    lastCoordsRef.current = { lat, lon, label };
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature` +
          `&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max` +
          `&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto&forecast_days=4`,
      );
      if (!res.ok) throw new Error("API error");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = (await res.json()) as Record<string, any>;

      const cityName =
        label ??
        (() => {
          const tz = String(w.timezone ?? "");
          return tz.split("/").pop()?.replace(/_/g, " ") ?? "";
        })();

      const cur = w.current as Record<string, number>;
      const hrly = w.hourly as Record<string, number[]>;
      const daily = w.daily as Record<string, (string | number)[]>;

      const curTime = new Date(String(w.current_weather_time ?? cur.time ?? ""));
      const hrlyTimes = hrly.time as unknown as string[];
      const si = Math.max(
        0,
        hrlyTimes.findIndex((t) => new Date(t) >= curTime),
      );

      const hourly: WeatherHour[] = hrlyTimes.slice(si, si + 24).map((time, i) => ({
        time,
        temperature: Math.round(hrly.temperature_2m[si + i] ?? 0),
        weatherCode: hrly.weather_code[si + i] ?? 0,
        precipProbability: hrly.precipitation_probability[si + i] ?? 0,
        windSpeed: Math.round(hrly.wind_speed_10m[si + i] ?? 0),
      }));

      const dailyTimes = daily.time as string[];
      const forecast: WeatherDay[] = dailyTimes.slice(1, 4).map((date, i) => ({
        date,
        maxTemp: Math.round((daily.temperature_2m_max[i + 1] as number) ?? 0),
        minTemp: Math.round((daily.temperature_2m_min[i + 1] as number) ?? 0),
        weatherCode: (daily.weather_code[i + 1] as number) ?? 0,
        precipProbability: Math.round((daily.precipitation_probability_max[i + 1] as number) ?? 0),
        windSpeed: Math.round((daily.wind_speed_10m_max[i + 1] as number) ?? 0),
      }));

      setData({
        current: {
          temperature: Math.round(cur.temperature_2m ?? 0),
          apparentTemperature: Math.round(cur.apparent_temperature ?? 0),
          humidity: cur.relative_humidity_2m ?? 0,
          windSpeed: Math.round(cur.wind_speed_10m ?? 0),
          weatherCode: cur.weather_code ?? 0,
        },
        forecast,
        hourly,
        cityName,
      });
      setStatus("ready");
    } catch {
      setError("Could not load weather data.");
      setStatus("error");
    }
  }

  async function searchCity(name: string) {
    if (!name.trim()) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const geo = (await res.json()) as { results?: Array<{ latitude: number; longitude: number; name: string; country: string }> };
      if (!geo.results?.length) {
        setError("City not found.");
        setStatus("denied");
        return;
      }
      const { latitude, longitude, name: found, country } = geo.results[0];
      await loadWeather(latitude, longitude, `${found}, ${country}`);
    } catch {
      setError("Search failed.");
      setStatus("error");
    }
  }

  function retryLocation() {
    const last = lastCoordsRef.current;
    if (last) {
      void loadWeather(last.lat, last.lon, last.label);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void loadWeather(coords.latitude, coords.longitude),
      (err) => {
        if (err.code === 1) {
          setStatus("denied");
        } else {
          setError("Could not get your location. Try again or enter a city.");
          setStatus("error");
        }
      },
      { timeout: 12000, maximumAge: 60000 },
    );
  }

  return { now, data, status, error, searchCity, retryLocation };
}
