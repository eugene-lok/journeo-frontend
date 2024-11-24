import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Icons
import airportIcon from './../icons/airplane.png'; 
import markerIcon from './../icons/marker.png';   

const mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = mapboxAccessToken;

// Moves a point a set distance using spherical trig 
const movePoint = (lat, lon, distance, bearing) => {
  // Earth's radius (m)
  const R = 6378137; 
  // Angular distance 
  const delta = distance / R; 
  // Bearing in radians
  const theta = (bearing * Math.PI) / 180; 

  // Convert lat, lon to radians
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180; 

  // Calculate shift in lat and lon 
  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const sinDelta = Math.sin(delta);
  const cosDelta = Math.cos(delta);

  const sinLat2 = sinLat1 * cosDelta + cosLat1 * sinDelta * Math.cos(theta);
  const lat2 = Math.asin(sinLat2);

  const y = Math.sin(theta) * sinDelta * cosLat1;
  const x = cosDelta - sinLat1 * sinLat2;
  const lon2 = lon1 + Math.atan2(y, x);

  // Convert back to degrees
  const newLat = (lat2 * 180) / Math.PI;
  const newLon = (lon2 * 180) / Math.PI;

  return { lat: newLat, lon: newLon };
};

// Adjusts duplicates coordinates by moving them 20m, scaling with latitude
const adjustDuplicates = (places) => {
  const coordMap = {};
  const adjustedPlaces = [...places]; 

  for (let i = 0; i < adjustedPlaces.length; i++) {
    const place = adjustedPlaces[i];
    const lat = Number(place.coordinates.latitude);
    const lon = Number(place.coordinates.longitude);
    const key = `${lat.toFixed(6)},${lon.toFixed(6)}`; 

    if (coordMap[key]) {
      const count = coordMap[key];

      // Generate random bearing 
      const bearing = Math.random() * 360;

      // Increase distance for each duplicate 
      const distance = 20 + (count - 1) * 0.5; 

      // Update place coordinates
      const newCoord = movePoint(lat, lon, distance, bearing);      
      adjustedPlaces[i].coordinates.latitude = newCoord.lat;
      adjustedPlaces[i].coordinates.longitude = newCoord.lon;

      coordMap[key] += 1;
    } else {
      coordMap[key] = 1;
    }
  }

  return adjustedPlaces;
};

const Map = ({ places, mapLoading }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Initialize the map only once
  useEffect(() => {
    if (map.current) return;
    const initialCoordinates = [-114, 51]; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: initialCoordinates,
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Add the custom icons on map load
    map.current.on('load', () => {
      // Load airport icon
      if (!map.current.hasImage('airport-icon')) {
        map.current.loadImage(airportIcon, (error, image) => {
          if (error) throw error;
          map.current.addImage('airport-icon', image);
          console.log('Airport icon loaded');
        });
      }

      // Load marker icon
      if (!map.current.hasImage('marker-icon')) {
        map.current.loadImage(markerIcon, (error, image) => {
          if (error) throw error;
          map.current.addImage('marker-icon', image);
          console.log('Marker icon loaded');
        });
      }
    });
  }, []);

  // Add or update markers, clustering, and routes
  useEffect(() => {
    if (mapLoading || !places.length) return;

    // Adjust duplicates before processing
    const adjustedPlaces = adjustDuplicates(places).filter(place => {
      const lng = Number(place.coordinates.longitude);
      const lat = Number(place.coordinates.latitude);
      return (
        !isNaN(lng) &&
        !isNaN(lat) &&
        lng >= -180 &&
        lng <= 180 &&
        lat >= -90 &&
        lat <= 90
      );
    });

    console.log('Adjusted Places:', adjustedPlaces);

    // Clear existing data layers to prevent duplicates
    const removeLayerAndSource = (layerId, sourceId) => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    };

    removeLayerAndSource('clusters', 'places');
    removeLayerAndSource('cluster-count', 'places');
    removeLayerAndSource('unclustered-point-airport', 'places'); 
    removeLayerAndSource('unclustered-point-marker', 'places');  
    removeLayerAndSource('route', 'route');

    // Convert places to GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: adjustedPlaces.map((place, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            Number(place.coordinates.longitude),
            Number(place.coordinates.latitude),
          ],
        },
        properties: {
          index: index + 1,
          name: place.name,
          address: place.address,
          isAirport: place.isAirport,
          primaryType: place.details ? place.details.primaryType : 'N/A',
          primaryTypeDisplayName: place.details
            ? place.details.primaryTypeDisplayName
            : 'N/A',
          googleId: place.predictedLocation.precisePlaceId,
          website: place.details ? place.details.websiteUri : 'N/A',
          googleMapsUri: place.details ? place.details.googleMapsUri : 'N/A',
          phone: place.details ? place.details.nationalPhoneNumber : 'N/A',
        },
      })),
    };

    console.log('GeoJSON:', geojson);

    // Add GeoJSON source with clustering
    map.current.addSource('places', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 9,
      clusterRadius: 20,
    });

    // Add cluster layer
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'places',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#FF2E39',
        'circle-radius': 20,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'places',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14,
        'text-color': '#ffffff',
      },
    });

    // **Add Route Layer Here**
    // Only add if there are routes to display
    const airportPlaces = adjustedPlaces.filter(place => place.isAirport);
    if (airportPlaces.length > 1) {
      const routeCoordinates = airportPlaces.map(place => [
        Number(place.coordinates.longitude),
        Number(place.coordinates.latitude),
      ]);

      console.log('Route Coordinates:', routeCoordinates);

      const routeGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates,
        },
      };

      // Add route source
      map.current.addSource('route', {
        type: 'geojson',
        data: routeGeoJSON,
      });

      // Add route layer
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#007AFF',
          'line-width': 4,
          'line-dasharray': [2, 3], // Dotted line
        },
      });
    }

    // **Add Route Layer Before Unclustered Markers**
    // To ensure it appears below the unclustered markers, add it before adding markers

    // Add unclustered airport points
    map.current.addLayer({
      id: 'unclustered-point-airport',
      type: 'symbol',
      source: 'places',
      filter: ['all', ['!=', ['get', 'isAirport'], false], ['!', ['has', 'point_count']]],
      layout: {
        'icon-image': 'airport-icon', // Use the image name as a string
        'icon-size': 0.07, // Adjust size as needed
        'icon-anchor': 'bottom',
      },
    });

    // Add unclustered marker points
    map.current.addLayer({
      id: 'unclustered-point-marker',
      type: 'symbol',
      source: 'places',
      filter: ['all', ['==', ['get', 'isAirport'], false], ['!', ['has', 'point_count']]],
      layout: {
        'icon-image': 'marker-icon', // Use the image name as a string
        'icon-size': 0.1, // Adjust size as needed
        'icon-anchor': 'bottom',
      },
    });

    // Create a popup instance
    const popup = new mapboxgl.Popup({
      closeButton: false,       
      closeOnClick: false    
    });

    // Show popup on hover 
    map.current.on('mouseenter', ['unclustered-point-airport', 'unclustered-point-marker'], (e) => {
      // Change cursor style to pointer 
      map.current.getCanvas().style.cursor = 'pointer';

      // Get coordinates and details of hovered location
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { name, address, index } = e.features[0].properties;
      console.log(e.features[0].properties)

      const htmlContent = `
        <h4>Location ${index}</h4>
        <h3>${name}</h3>
        <p>${address}</p>
      `;

      popup
        .setLngLat(coordinates)
        .setHTML(htmlContent)
        .addTo(map.current);
    });

    // Reset cursor and remove popup when unhovering
    map.current.on('mouseleave', ['unclustered-point-airport', 'unclustered-point-marker'], () => {
      map.current.getCanvas().style.cursor = '';
      popup.remove();
    });

    // Zoom into clusters on click
    map.current.on('click', 'clusters', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });
      const clusterId = features[0].properties.cluster_id;
      map.current
        .getSource('places')
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
    });

    // Change cursor to pointer when hovering over clusters and points
    map.current.on('mouseenter', 'clusters', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', ['unclustered-point-airport', 'unclustered-point-marker'], () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', ['unclustered-point-airport', 'unclustered-point-marker'], () => {
      map.current.getCanvas().style.cursor = '';
    });

    // Fit map to all points
    const bounds = new mapboxgl.LngLatBounds();
    adjustedPlaces.forEach((place) => {
      const lng = Number(place.coordinates.longitude);
      const lat = Number(place.coordinates.latitude);
      if (!isNaN(lng) && !isNaN(lat)) {
        bounds.extend([lng, lat]);
      }
    });

    if (adjustedPlaces.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      });
    }

    // Cleanup event listeners on unmount or update
    return () => {
      map.current.off('mouseenter', ['unclustered-point-airport', 'unclustered-point-marker']);
      map.current.off('mouseleave', ['unclustered-point-airport', 'unclustered-point-marker']);
      map.current.off('mouseenter', 'clusters');
      map.current.off('mouseleave', 'clusters');
    };
  }, [mapLoading, places]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Map container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Spinner overlay */}
      {mapLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-10">
          <div className="animate-spin h-20 w-20 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default Map;
