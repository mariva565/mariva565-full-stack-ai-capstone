"use client";

import { useState } from "react";
import { useWeather } from "./use-weather";
import type { WeatherCurrent, WeatherDay, WeatherHour } from "./use-weather";

// WMO Weather Interpretation Code → emoji + label
function weatherLabel(code: number): { emoji: string; label: string } {
  if (code === 0)  return { emoji: "☀️",  label: "Clear sky" };
  if (code <= 2)   return { emoji: "🌤️", label: "Partly cloudy" };
  if (code === 3)  return { emoji: "☁️",  label: "Overcast" };
  if (code <= 48)  return { emoji: "🌫️", label: "Fog" };
  if (code <= 55)  return { emoji: "🌦️", label: "Drizzle" };
  if (code <= 65)  return { emoji: "🌧️", label: "Rain" };
  if (code <= 77)  return { emoji: "🌨️", label: "Snow" };
  if (code <= 82)  return { emoji: "🌦️", label: "Showers" };
  return { emoji: "⛈️", label: "Thunderstorm" };
}

function fmt24h(isoTime: string) {
  return new Date(isoTime).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

type Panel = "forecast" | "hourly" | null;

const ACCORDION_BTN =
  "mt-2 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-violet-500/40";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <span className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}>
      ▾
    </span>
  );
}

function CurrentWeatherCard({ current, cityName }: { current: WeatherCurrent; cityName: string }) {
  const { emoji, label } = weatherLabel(current.weatherCode);
  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl leading-none">{emoji}</span>
        <div>
          <p className="text-2xl font-bold tabular-nums text-slate-800 dark:text-white">
            {current.temperature}°C
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
      {cityName && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">📍 {cityName}</p>
      )}
      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
        Feels {current.apparentTemperature}° · {current.humidity}% hum · 💨 {current.windSpeed} km/h
      </p>
    </div>
  );
}

function ForecastPanel({ days }: { days: WeatherDay[] }) {
  return (
    <div className="mt-1 space-y-1">
      {days.map((day) => {
        const { emoji } = weatherLabel(day.weatherCode);
        return (
          <div
            key={day.date}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs dark:border-slate-700/60 dark:bg-slate-900/30"
          >
            <div className="flex items-center justify-between">
              <span className="w-20 shrink-0 text-slate-500 dark:text-slate-400">{fmtDay(day.date)}</span>
              <span className="text-base leading-none">{emoji}</span>
              <span className="tabular-nums text-slate-700 dark:text-slate-200">
                {day.maxTemp}°{" "}
                <span className="text-slate-400 dark:text-slate-500">{day.minTemp}°</span>
              </span>
              <span className="w-10 text-right text-cyan-600 dark:text-cyan-400">
                {day.precipProbability > 0 ? `💧${day.precipProbability}%` : ""}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              💨 {day.windSpeed} km/h
            </p>
          </div>
        );
      })}
    </div>
  );
}

function HourlyPanel({ hours }: { hours: WeatherHour[] }) {
  return (
    <div className="mt-1 overflow-x-auto">
      <div className="flex gap-2 pb-1">
        {hours.map((h) => {
          const { emoji } = weatherLabel(h.weatherCode);
          return (
            <div
              key={h.time}
              className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-[11px] dark:border-slate-700/60 dark:bg-slate-900/30"
            >
              <span className="text-slate-400 dark:text-slate-500">{fmt24h(h.time)}</span>
              <span className="text-base leading-none">{emoji}</span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                {h.temperature}°
              </span>
              <span className="tabular-nums text-slate-400 dark:text-slate-500">
                💨{h.windSpeed}
              </span>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400">
                {h.precipProbability > 0 ? `💧${h.precipProbability}%` : "\u00a0"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeatherWidget() {
  const { now, data, status, error, searchCity, retryLocation } = useWeather();
  const [open, setOpen] = useState<Panel>(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  function toggle(panel: Panel) {
    setOpen((prev) => (prev === panel ? null : panel));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await searchCity(search);
    setShowSearch(false);
  }

  const clock = now.toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const isSearchVisible = showSearch || status === "denied" || status === "error";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-[0_18px_45px_rgba(148,163,184,0.16)] dark:border-cyan-400/10 dark:bg-slate-950/45 dark:shadow-[0_20px_50px_rgba(8,15,30,0.38)] sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          Weather
        </p>
        <p className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-cyan-300/60">
          {clock}
        </p>
      </div>

      {/* Loading states */}
      {(status === "locating" || status === "loading") && (
        <p className="mt-3 animate-pulse text-xs text-slate-400">
          {status === "locating" ? "Detecting location…" : "Loading weather…"}
        </p>
      )}

      {/* Error */}
      {status === "error" && (
        <p className="mt-2 text-xs text-rose-500">{error || "Could not load weather."}</p>
      )}

      {/* Retry / Use location buttons */}
      {(status === "denied" || status === "error") && !data && (
        <button
          onClick={retryLocation}
          className="mt-2 flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-violet-500/40 dark:hover:text-violet-300"
        >
          📍 Use my location
        </button>
      )}

      {/* Geolocation denied — explain */}
      {(status === "denied" || status === "error") && !data && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Or enter your city manually:
        </p>
      )}

      {/* City search */}
      {isSearchVisible && (
        <form onSubmit={(e) => void handleSearch(e)} className="mt-2 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter city…"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-xl bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Go
          </button>
        </form>
      )}

      {/* Weather content */}
      {data && (
        <>
          <CurrentWeatherCard current={data.current} cityName={data.cityName} />

          {/* Accordion: 3-day forecast */}
          <button onClick={() => toggle("forecast")} className={ACCORDION_BTN}>
            <span>3-day forecast</span>
            <ChevronIcon open={open === "forecast"} />
          </button>
          {open === "forecast" && <ForecastPanel days={data.forecast} />}

          {/* Accordion: hourly */}
          <button onClick={() => toggle("hourly")} className={ACCORDION_BTN}>
            <span>Hourly forecast</span>
            <ChevronIcon open={open === "hourly"} />
          </button>
          {open === "hourly" && <HourlyPanel hours={data.hourly} />}

          {/* Change city */}
          {!showSearch && (
            <button
              onClick={() => { setSearch(""); setShowSearch(true); }}
              className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 hover:underline dark:text-slate-500 dark:hover:text-slate-300"
            >
              📍 Change city
            </button>
          )}
        </>
      )}
    </section>
  );
}
