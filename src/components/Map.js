import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = mapboxAccessToken;

const Map = ({ places, mapLoading }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Initialize the map only once
  useEffect(() => {
    if (map.current) return;
    const initialCoordinates = [-114, 51]; // Default coordinates (e.g., Calgary)

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: initialCoordinates,
      zoom: 10,
    });

  }, []);

  

  // Add or update markers, clustering, and routes
  useEffect(() => {
    if (mapLoading || !places.length) return;

    // Clear existing data layers to prevent duplicates
    if (map.current.getLayer('clusters')) {
      map.current.removeLayer('clusters');
      map.current.removeLayer('cluster-count');
      map.current.removeLayer('unclustered-point');
      map.current.removeSource('places');
    }
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    // Convert places to GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: places.map((place, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [place.coordinates.longitude, place.coordinates.latitude],
        },
        properties: {
          name: place.name,
          address: place.address,
          index: index + 1,
        },
      })),
    };

    // Add GeoJSON source with clustering
    map.current.addSource('places', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 30,
    });

    // Add cluster layer
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'places',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#99d8c9',
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

    // Add unclustered point layer with custom markers
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'places',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#99d8c9',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#000',
      },
    });

    // Add route layer 
    if (places.length > 1) {
      const routeCoordinates = places.map(
        (place) => [place.coordinates.longitude, place.coordinates.latitude]
      );

      const routeGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates,
        },
      };

      map.current.addSource('route', {
        type: 'geojson',
        data: routeGeoJSON,
      });

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
        },
      });
    }

    // Add popup for unclustered points
    map.current.on('click', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { name, address, index } = e.features[0].properties;

      new mapboxgl.Popup({ offset: 25 })
        .setLngLat(coordinates)
        .setHTML(
          `<h4>Location ${index}</h4><h3>${name}</h3><p>${address}</p>`
        )
        .addTo(map.current);
    });
    

    // Zoom into clusters on click
    map.current.on('click', 'clusters', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });
      const clusterId = features[0].properties.cluster_id;
      map.current.getSource('places').getClusterExpansionZoom(clusterId, (err, zoom) => {
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
    map.current.on('mouseenter', 'unclustered-point', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      map.current.getCanvas().style.cursor = '';
    });

    // Fit map to all points
    const bounds = new mapboxgl.LngLatBounds();
    places.forEach((place) => {
      bounds.extend([place.coordinates.longitude, place.coordinates.latitude]);
    });

    if (places.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      });
    }
  }, [mapLoading, places]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
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
