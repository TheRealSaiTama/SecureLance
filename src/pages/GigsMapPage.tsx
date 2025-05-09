import React, { useState, useEffect, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  ZoomableGroup
} from 'react-simple-maps';

// URL to a TopoJSON file for world map
const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface CountryData {
  [key: string]: { gigs: number };
}

// A few sample countries to give data to initially
const sampleCountries = [
  "India", "United States of America", "China", "Brazil", "Germany", 
  "United Kingdom", "Canada", "Australia", "France", "Japan", "Nigeria"
];

const GigsMapPage: React.FC = () => {
  const [countryData, setCountryData] = useState<CountryData>({});
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);

  const generateInitialData = useCallback(() => {
    const initialData: CountryData = {};
    sampleCountries.forEach(name => {
      initialData[name] = { gigs: Math.floor(Math.random() * 200) + 1 };
    });
    setCountryData(initialData);
  }, []);

  useEffect(() => {
    generateInitialData();

    const intervalId = setInterval(() => {
      setCountryData(prevData => {
        const newData = { ...prevData };
        for (const countryName in newData) {
          // Only update if country is in sampleCountries to avoid growing indefinitely
          if (sampleCountries.includes(countryName)) {
             newData[countryName] = { gigs: Math.floor(Math.random() * 200) + 1 };
          }
        }
        return newData;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(intervalId);
  }, [generateInitialData]);

  const handleMouseEnter = (geo: any, currentGigCount: number | undefined) => {
    if (currentGigCount) {
      setTooltipContent(`${geo.properties.name}: ${currentGigCount} gigs`);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    setTooltipPosition({ x: event.clientX + 15, y: event.clientY + 15 });
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
    setTooltipPosition(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-800 overflow-hidden">
      <h1 className="text-3xl font-bold py-4 text-center shrink-0 text-gray-100">Explore Gigs Across the World</h1>
      <div className="flex-grow w-full h-full border-t border-gray-700 relative">
        {tooltipContent && tooltipPosition && (
          <div 
            style={{ top: tooltipPosition.y, left: tooltipPosition.x, pointerEvents: 'none' }}
            className="absolute z-10 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap"
          >
            {tooltipContent}
          </div>
        )}
        <ComposableMap
          projectionConfig={{
            scale: 140,
            rotate: [-10, 0, 0],
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={[0, 0]} zoom={1}>
            <rect width="10000" height="10000" x="-5000" y="-5000" fill="url(#oceanPattern)" />
            <defs>
                <pattern id="oceanPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                    <circle cx="1" cy="1" r="0.5" fill="rgba(0, 100, 150, 0.1)" />
                </pattern>
            </defs>

            <Graticule stroke="rgba(100, 150, 200, 0.3)" step={[15, 15]} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const countryName = geo.properties.name;
                  const gigs = countryData[countryName]?.gigs;
                  const hasGigs = gigs !== undefined && gigs > 0;
                  
                  // Base color for countries with gigs
                  const gigFillColor = "#3182CE"; // Blue-500

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={hasGigs ? gigFillColor : "#2D3748"}
                      stroke="#4A5568"
                      onMouseEnter={() => handleMouseEnter(geo, gigs)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        default: {
                          outline: 'none'
                        },
                        hover: {
                          fill: hasGigs ? "#4299E1" : "#3182CE",
                          stroke: "#63B3ED",
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        pressed: {
                          fill: "#2B6CB0", 
                          stroke: "#63B3ED",
                          outline: 'none'
                        }
                      }}
                      onClick={() => console.log(`${countryName} clicked. Gigs: ${gigs || 'N/A'}`)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
};

export default GigsMapPage; 