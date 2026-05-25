"use client";

import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from "react-simple-maps";
import { ZoomIn, ZoomOut, RotateCcw, HelpCircle, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Local TopoJSON file path (saved in public/)
const geoUrl = "/world-countries.json";

// Major global university cities
export interface CityHotspot {
  name: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  universities: string[];
}

export const CITY_HOTSPOTS: CityHotspot[] = [
  {
    name: "Boston / Cambridge",
    country: "United States",
    coordinates: [-71.0589, 42.3601],
    universities: ["Harvard University", "Massachusetts Institute of Technology (MIT)", "Boston University"]
  },
  {
    name: "London",
    country: "United Kingdom",
    coordinates: [-0.1276, 51.5074],
    universities: ["Imperial College London", "University College London (UCL)", "King's College London"]
  },
  {
    name: "Oxford / Cambridge",
    country: "United Kingdom",
    coordinates: [-1.2577, 51.7520],
    universities: ["University of Oxford", "University of Cambridge"]
  },
  {
    name: "Stanford / Bay Area",
    country: "United States",
    coordinates: [-122.1697, 37.4275],
    universities: ["Stanford University", "University of California, Berkeley", "UC San Francisco"]
  },
  {
    name: "Tokyo",
    country: "Japan",
    coordinates: [139.6503, 35.6762],
    universities: ["University of Tokyo", "Tokyo Institute of Technology", "Waseda University"]
  },
  {
    name: "Munich",
    country: "Germany",
    coordinates: [11.5820, 48.1351],
    universities: ["Technical University of Munich (TUM)", "LMU Munich"]
  },
  {
    name: "Zurich",
    country: "Switzerland",
    coordinates: [8.5417, 47.3769],
    universities: ["ETH Zurich", "University of Zurich"]
  },
  {
    name: "Singapore",
    country: "Singapore",
    coordinates: [103.8198, 1.3521],
    universities: ["National University of Singapore (NUS)", "Nanyang Technological University (NTU)"]
  },
  {
    name: "Toronto",
    country: "Canada",
    coordinates: [-79.3832, 43.6532],
    universities: ["University of Toronto", "York University", "Ryerson University"]
  },
  {
    name: "Sydney",
    country: "Australia",
    coordinates: [151.2093, -33.8688],
    universities: ["University of Sydney", "University of New South Wales (UNSW)", "UTS"]
  },
  {
    name: "Bengaluru",
    country: "India",
    coordinates: [77.5946, 12.9716],
    universities: ["Indian Institute of Science (IISc)", "Bangalore University"]
  }
];

interface GeoProperties {
  name: string;
}

interface GeoStructure {
  rsmKey: string;
  properties: GeoProperties;
}

interface WorldMapProps {
  onSelectCountry: (countryName: string) => void;
  selectedCountry: string | null;
}

export default function WorldMap({ onSelectCountry, selectedCountry }: WorldMapProps) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [tooltipContent, setTooltipContent] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);

  const handleZoomIn = () => {
    if (zoom < 8) setZoom((z) => z * 1.5);
  };

  const handleZoomOut = () => {
    if (zoom > 1) setZoom((z) => z / 1.5);
  };

  const handleReset = () => {
    setZoom(1);
    setCenter([0, 20]);
    onSelectCountry("");
  };

  // Safe callback when clicking on map geographies
  const handleCountryClick = (geo: GeoStructure) => {
    const name = geo.properties.name;
    // Map names to normal form if needed
    const normalizedName = name === "United States of America" ? "United States" : name;
    onSelectCountry(normalizedName);
  };

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-[var(--border-default)] bg-[#030307] select-none bg-grid">
      {/* Zoom / Pan Control Panel */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2 bg-[rgba(15,15,26,0.7)] backdrop-blur-md border border-[rgba(240,240,255,0.06)] p-2 rounded-xl shadow-glow-sm">
        <button
          onClick={handleZoomIn}
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[rgba(240,240,255,0.06)] text-[var(--color-text)] transition duration-200"
          title="Zoom In"
        >
          <ZoomIn className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[rgba(240,240,255,0.06)] text-[var(--color-text)] transition duration-200"
          title="Zoom Out"
        >
          <ZoomOut className="h-4.5 w-4.5" />
        </button>
        <div className="h-px bg-[rgba(240,240,255,0.06)] my-1" />
        <button
          onClick={handleReset}
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[rgba(240,240,255,0.06)] text-[var(--color-text)] transition duration-200"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute top-6 left-6 z-10 bg-[rgba(15,15,26,0.65)] backdrop-blur-md border border-[rgba(240,240,255,0.06)] px-4 py-3 rounded-xl shadow-glow-sm max-w-xs text-xs space-y-2 pointer-events-none">
        <div className="font-display font-medium text-[var(--color-text)] flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-[#00D4AA]" />
          <span>Interactive Navigation Guide</span>
        </div>
        <div className="text-[var(--color-muted)] leading-relaxed space-y-1.5">
          <p>🖱️ Drag map to pan / Scroll to zoom</p>
          <p>🗺️ Click a country to fetch local universities</p>
          <p>📍 Click on glowing city dots for hotspots</p>
        </div>
      </div>

      {/* Map Element */}
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}
        width={800}
        height={450}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onMoveEnd={(position: any) => {
            // Keep zoom bounding within range
            setZoom(position.zoom);
            setCenter(position.coordinates);
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name;
                const normalizedName = name === "United States of America" ? "United States" : name;
                const isSelected = selectedCountry === normalizedName;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    onMouseEnter={(e) => {
                      // Custom hover popup coordinate calculation
                      setTooltipContent({
                        name: normalizedName,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseLeave={() => {
                      setTooltipContent(null);
                    }}
                    style={{
                      default: {
                        fill: isSelected ? "rgba(108, 71, 255, 0.35)" : "rgba(15, 15, 26, 0.8)",
                        stroke: isSelected ? "#00D4AA" : "rgba(240, 240, 255, 0.08)",
                        strokeWidth: isSelected ? 1.5 : 0.6,
                        outline: "none",
                        transition: "fill 300ms ease, stroke 300ms ease"
                      },
                      hover: {
                        fill: "rgba(108, 71, 255, 0.22)",
                        stroke: isSelected ? "#00D4AA" : "rgba(108, 71, 255, 0.8)",
                        strokeWidth: isSelected ? 1.5 : 1,
                        outline: "none",
                        cursor: "pointer",
                        transition: "fill 200ms ease"
                      },
                      pressed: {
                        fill: "rgba(108, 71, 255, 0.45)",
                        stroke: "#00D4AA",
                        strokeWidth: 1.5,
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* City Hotspots */}
          {CITY_HOTSPOTS.map((city) => (
            <Marker key={city.name} coordinates={city.coordinates}>
              <g
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCountry(city.country);
                }}
                onMouseEnter={(e) => {
                  setTooltipContent({
                    name: `${city.name}, ${city.country}`,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseLeave={() => {
                  setTooltipContent(null);
                }}
              >
                {/* Pulsating outer ring */}
                <circle
                  r={7}
                  fill="none"
                  stroke="#00D4AA"
                  strokeWidth={1.5}
                  className="animate-ping"
                  opacity={0.65}
                  style={{ animationDuration: "2s" }}
                />
                {/* Glowing center dot */}
                <circle
                  r={4.5}
                  fill="#00D4AA"
                  stroke="#030307"
                  strokeWidth={1}
                  className="shadow-glow transition-all duration-300 group-hover:scale-125"
                />
              </g>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Floating Tooltip Component */}
      <AnimatePresence>
        {tooltipContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "fixed",
              left: tooltipContent.x + 12,
              top: tooltipContent.y + 12
            }}
            className="z-50 pointer-events-none glass px-3 py-2 rounded-xl text-xs font-semibold text-white shadow-xl flex items-center gap-2 border border-[rgba(240,240,255,0.12)] bg-[#0F0F1AD9]"
          >
            <MapPin className="h-3.5 w-3.5 text-[#00D4AA]" />
            <span>{tooltipContent.name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
