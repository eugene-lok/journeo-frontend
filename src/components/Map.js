import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Popup from './Popup';

const mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = mapboxAccessToken;

const Map = ({ places, routes, mapLoading }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    const initialCoordinates = [-114, 51];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCoordinates,
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
  }, []);

  // Add or update markers and routes
  useEffect(() => {
    if (mapLoading || !places.length) return;

    // Remove existing layers and sources
    const layersToRemove = [
      'airport-route',
      'markers',
      'marker-labels',
      'routes-layer'
    ];

    layersToRemove.forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    ['route', 'routes', 'places'].forEach(sourceId => {
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });

    // Convert places to GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: places.map((place, index) => ({
        type: 'Feature',
        id: index,
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
          primaryTypeDisplayName: place.details ? place.details.primaryTypeDisplayName : 'N/A',
          googleId: place.predictedLocation.precisePlaceId,
          website: place.details ? place.details.websiteUri : 'N/A',
          googleMapsUri: place.details ? place.details.googleMapsUri : 'N/A',
          phone: place.details ? place.details.nationalPhoneNumber : 'N/A',
        },
      })),
      promoteId: 'id'
    };

    // Add GeoJSON source without clustering
    map.current.addSource('places', {
      type: 'geojson',
      data: geojson
    });

    // Add routes if they exist
    if (routes.length > 0) {
      const routesGeoJSON = {
        type: 'FeatureCollection',
        features: routes.map((route) => ({
          type: 'Feature',
          geometry: route.route,
          properties: {
            from: route.from.name,
            to: route.to.name,
          },
        })),
      };

      map.current.addSource('routes', {
        type: 'geojson',
        data: routesGeoJSON,
      });

      map.current.addLayer({
        id: 'routes-layer',
        type: 'line',
        source: 'routes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#2673A6',
          'line-width': 4
        },
      });
    }

    // Add marker circles
    map.current.addLayer({
      id: 'markers',
      type: 'circle',
      source: 'places',
      paint: {
        'circle-radius': 16,
        'circle-color': [
          'case',
          ['get', 'isAirport'],
          '#3B82F6', // Blue for airports
          '#26A659'  // Green for places
        ],
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#f4f4f5',
        'circle-stroke-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          0.6
        ]
      }
    });

    // Add marker labels 
    map.current.addLayer({
      id: 'marker-labels',
      type: 'symbol',
      source: 'places',
      layout: {
        'text-field': ['get', 'index'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Handle hover states
    let hoveredId = null;

    map.current.on('mousemove', 'markers', (e) => {
      if (e.features.length > 0) {
        if (hoveredId !== null) {
          map.current.setFeatureState(
            { source: 'places', id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = e.features[0].id;
        map.current.setFeatureState(
          { source: 'places', id: hoveredId },
          { hover: true }
        );
      }
    });

    map.current.on('mouseleave', 'markers', () => {
      if (hoveredId !== null) {
        map.current.setFeatureState(
          { source: 'places', id: hoveredId },
          { hover: false }
        );
        hoveredId = null;
      }
    });

    // Initialize popup
    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false
      });
    }

    const popup = popupRef.current;

    // Handle marker clicks
    map.current.on('click', 'markers', (e) => {
      const feature = e.features[0];
      if (!feature.properties) return;

      const coordinates = feature.geometry.coordinates.slice();

      const handleClose = () => {
        if (popupRef.current?._popupRoot) {
          popupRef.current._popupRoot.unmount();
          delete popupRef.current._popupRoot;
        }
        popupRef.current?.remove();
      };

      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);
      root.render(<Popup properties={feature.properties} onClose={handleClose} />);

      popup
        .setLngLat(coordinates)
        .setDOMContent(popupNode)
        .addTo(map.current);

      popup._popupRoot = root;
    });

    // Cursor handling
    map.current.on('mouseenter', 'markers', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'markers', () => {
      map.current.getCanvas().style.cursor = '';
    });

    // Fit map to points
    const bounds = new mapboxgl.LngLatBounds();
    places.forEach((place) => {
      const lng = Number(place.coordinates.longitude);
      const lat = Number(place.coordinates.latitude);
      if (!isNaN(lng) && !isNaN(lat)) {
        bounds.extend([lng, lat]);
      }
    });

    if (places.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      });
    }

    // Cleanup
    return () => {
      map.current.off('mouseenter', 'markers');
      map.current.off('mouseleave', 'markers');
      map.current.off('click', 'markers');
    };
  }, [mapLoading, places, routes]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {mapLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-zinc-900 backdrop-blur-md z-10">
          <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default Map;