import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css'; 

const mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = mapboxAccessToken;

const MapComponent = ({ places, mapLoading }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]); // Store markers to remove them later

  // Initialize the map only once
  useEffect(() => {
    if (map.current) return; // Only initialize once
    const initialCoordinates = [-114, 51]; // Default coordinates (e.g., Calgary)

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1', 
      center: initialCoordinates, 
      zoom: 10,
    });
  }, []);

  // Add or update markers when coordinates change
  useEffect(() => {
    if (mapLoading || !places.length) return; // Do nothing if loading or no places
  
    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  
    // Add new markers and calculate bounds
    const bounds = new mapboxgl.LngLatBounds(); // Initialize bounds
  
    places.forEach((place, index) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([place.coordinates.longitude, place.coordinates.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h4>Location ${index + 1}</h4><h3>${place.name}</h3><p>${place.address}</p>`)
        )
        .addTo(map.current);
  
      // Extend bounds to include each marker's position
      bounds.extend([place.coordinates.longitude, place.coordinates.latitude]);
  
      // Save the marker so it can be removed later
      markersRef.current.push(marker);
    });
  
    // Fit the map to the bounds if coordinates exist
    if (places.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50, // Optional padding around the markers
        maxZoom: 15, // Optional maximum zoom level to avoid excessive zooming
      });
    }
  }, [mapLoading, places, map.current]);
  

  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      {/* Map container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Spinner overlay */}
      {mapLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-10">
          <div className="animate-spin h-20 w-20 border-4 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
