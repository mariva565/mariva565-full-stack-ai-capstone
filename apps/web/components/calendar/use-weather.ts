"use client";

import { useEffect, useRef, useState } from "react";
import { buildWeatherData } from "./weather-data";
import type { WeatherData } from "./weather-types";

export type {
  WeatherCurrent,
  WeatherDay,
  WeatherHour,
  WeatherData,
} from "./weather-types";

export type WeatherStatus = "idle" | "locating" | "loading" | "ready" | "denied" | "error";

const CLOCK_TICK_MS = 60_000;
const STORAGE_KEY = "studyhub-weather-city";

function saveCity(lat: number, lon: number, label?: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, label }));
  } catch { /* quota exceeded or SSR — ignore */ }
}

function loadSavedCity(): { lat: number; lon: number; label?: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lat?: number; lon?: number; label?: string };
    if (typeof parsed.lat === "number" && typeof parsed.lon === "number") {
      return { lat: parsed.lat, lon: parsed.lon, label: parsed.label };
    }
    return null;
  } catch { return null; }
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 20_000,
  maximumAge: 300_000,
};

function hasGeolocationSupport() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

function requestCurrentPosition(options: PositionOptions = GEOLOCATION_OPTIONS) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!hasGeolocationSupport()) {
      reject(new Error("Geolocation is not available."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function getGeolocationPermissionStatus() {
  if (typeof navigator === "undefined" || !("permissions" in navigator)) {
    return null;
  }

  try {
    return await navigator.permissions.query({ name: "geolocation" as PermissionName });
  } catch {
    return null;
  }
}

function getGeolocationErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const { code } = error as { code?: unknown };
  return typeof code === "number" ? code : null;
}

export function useWeather() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [error, setError] = useState("");
  const lastCoordsRef = useRef<{ lat: number; lon: number; label?: string } | null>(null);
  const locationRequestInFlightRef = useRef(false);

  useEffect(() => {
    const syncNow = () => setNow(new Date());
    const delayToNextMinute = CLOCK_TICK_MS - (Date.now() % CLOCK_TICK_MS);
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = window.setTimeout(() => {
      syncNow();
      intervalId = window.setInterval(syncNow, CLOCK_TICK_MS);
    }, delayToNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  async function loadWeather(lat: number, lon: number, label?: string, persist = false) {
    lastCoordsRef.current = { lat, lon, label };
    if (persist) saveCity(lat, lon, label);
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature` +
          `&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max` +
          `&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto&forecast_days=4`,
      );

      if (!response.ok) {
        throw new Error("Weather API error");
      }

      const weather = await response.json();
      setData(buildWeatherData(weather, label));
      setStatus("ready");
    } catch {
      setError("Could not load weather data.");
      setStatus("error");
    }
  }

  async function locateUser() {
    if (locationRequestInFlightRef.current) {
      return;
    }

    if (!hasGeolocationSupport()) {
      setError("");
      setStatus("denied");
      return;
    }

    locationRequestInFlightRef.current = true;
    setError("");
    setStatus("locating");

    try {
      const { coords } = await requestCurrentPosition();
      await loadWeather(coords.latitude, coords.longitude);
    } catch (locationError) {
      if (getGeolocationErrorCode(locationError) === 1) {
        setError("");
        setStatus("denied");
      } else {
        setError("Could not get your location. Try again or enter a city.");
        setStatus("error");
      }
    } finally {
      locationRequestInFlightRef.current = false;
    }
  }

  useEffect(() => {
    let active = true;
    let permissionStatus: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (!active || permissionStatus?.state !== "granted") {
        return;
      }

      void locateUser();
    };

    async function initGeolocation() {
      const saved = loadSavedCity();
      if (saved) {
        void loadWeather(saved.lat, saved.lon, saved.label);
        return;
      }

      if (!hasGeolocationSupport()) {
        setError("");
        setStatus("denied");
        return;
      }

      permissionStatus = await getGeolocationPermissionStatus();
      if (!active) {
        return;
      }

      if (permissionStatus?.state === "denied") {
        setError("");
        setStatus("denied");
        return;
      }

      permissionStatus?.addEventListener("change", handlePermissionChange);
      void locateUser();
    }

    void initGeolocation();

    return () => {
      active = false;
      permissionStatus?.removeEventListener("change", handlePermissionChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchCity(name: string) {
    if (!name.trim()) {
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`,
      );
      const geocoding = (await response.json()) as {
        results?: Array<{
          latitude: number;
          longitude: number;
          name: string;
          country: string;
        }>;
      };

      if (!geocoding.results?.length) {
        setError("City not found.");
        setStatus("denied");
        return;
      }

      const { latitude, longitude, name: found, country } = geocoding.results[0];
      await loadWeather(latitude, longitude, `${found}, ${country}`, true);
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

    void locateUser();
  }

  return { now, data, status, error, searchCity, retryLocation };
}
