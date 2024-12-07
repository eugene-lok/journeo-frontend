import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Popup from './Popup';

// Icons
import airportIcon from './../icons/airport.png'; 
import placeIcon from './../icons/place.png';
import placeIconHover from './../icons/placeHover.png';
import airportIconHover from './../icons/airportHover.png';
  

const mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = mapboxAccessToken;

const Map = ({ places, routes, mapLoading }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(null); 

  // Initialize the map only once
  useEffect(() => {
    if (map.current) return;
    const initialCoordinates = [-114, 51]; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCoordinates,
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Add the custom icons on map load
    map.current.on('load', () => {
      // Load airport icon
      if (!map.current.hasImage('airport-icon')) {
        map.current.loadImage(airportIcon, (error, image) => {
          if (error) {
            console.error('Error loading airport icon:', error);
            return;
          }
          map.current.addImage('airport-icon', image);
          console.log('Airport icon loaded');
        });
      }

      // Load marker icon
      if (!map.current.hasImage('marker-icon')) {
        map.current.loadImage(placeIcon, (error, image) => {
          if (error) {
            console.error('Error loading marker icon:', error);
            return;
          }
          map.current.addImage('marker-icon', image);
          console.log('Marker icon loaded');
        });
      }

      // Load marker hover icon
      if (!map.current.hasImage('marker-icon-hover')) {
        map.current.loadImage(placeIconHover, (error, image) => {
          if (error) {
            console.error('Error loading marker hover icon:', error);
            return;
          }
          map.current.addImage('marker-icon-hover', image);
          console.log('Marker icon hover loaded');
        });
      }

      // Load airport hover icon
      if (!map.current.hasImage('airport-icon-hover')) {
        map.current.loadImage(airportIconHover, (error, image) => {
          if (error) {
            console.error('Error loading airport hover icon:', error);
            return;
          }
          map.current.addImage('airport-icon-hover', image);
          console.log('Airport icon hover loaded');
        });
      }
    });
  }, []);

  // Add or update markers, clustering, and routes
  useEffect(() => {
    if (mapLoading || !places.length) return;

    // Adjust duplicates before processing
    /* const adjustedPlaces = adjustDuplicates(places).filter(place => {
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
    }); */

    //console.log('Adjusted Places:', adjustedPlaces);

    // Remove all layers
    const layersToRemove = [
      'airport-route',
      'clusters',
      'cluster-count',
      'unclustered-point-airport',
      'unclustered-point-airport-hover',
      'unclustered-point-marker',
      'unclustered-point-marker-hover',
      'routes-layer'
    ];

    layersToRemove.forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
        console.log(`Removed layer: ${layerId}`);
      }
    });

    // Remove all sources
    const sourcesToRemove = ['route', 'routes', 'places'];

    sourcesToRemove.forEach(sourceId => {
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
        console.log(`Removed source: ${sourceId}`);
      }
    });

    let hoveredFeatureId = null;

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
          primaryTypeDisplayName: place.details
            ? place.details.primaryTypeDisplayName
            : 'N/A',
          googleId: place.predictedLocation.precisePlaceId,
          website: place.details ? place.details.websiteUri : 'N/A',
          googleMapsUri: place.details ? place.details.googleMapsUri : 'N/A',
          phone: place.details ? place.details.nationalPhoneNumber : 'N/A',
        },
      })),
      promoteId:'id'
    };

    console.log('GeoJSON:', geojson);

    // Add GeoJSON source with clustering
    map.current.addSource('places', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 10,
      clusterRadius: 8,
      generatedId: true
    });

    // Add routes to map
    if (routes.length > 0) {
      // Convert routes to GeoJSON FeatureCollection
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

      console.log('Routes GeoJSON:', routesGeoJSON);

      // Add routes source
      map.current.addSource('routes', {
        type: 'geojson',
        data: routesGeoJSON,
      });

      // Add routes layer
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

    // Only add if there are enough airports to display a route
    const airportPlaces = places.filter(place => place.isAirport);
    if (airportPlaces.length > 1) {
      const airportRouteCoordinates = airportPlaces.map(place => [
        Number(place.coordinates.longitude),
        Number(place.coordinates.latitude),
      ]);

      console.log('Airport Route Coordinates:', airportRouteCoordinates);

      const routeGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: airportRouteCoordinates,
        },
      };

      // Add airport route source
      map.current.addSource('route', {
        type: 'geojson',
        data: routeGeoJSON,
      });

      // Add airport route layer
      map.current.addLayer({
        id: 'airport-route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#EEEEEE',
          'line-width': 5,
          'line-dasharray': [2, 6], 
        },
      });
    } 

    // Add unclustered airport hover markers
    map.current.addLayer({
      id: 'unclustered-point-airport-hover',
      type: 'symbol',
      source: 'places',
      filter: ['all', ['!=', ['get', 'isAirport'], false], ['!', ['has', 'point_count']]],
      layout: {
        'icon-image': 'airport-icon-hover', 
        'icon-size': 0.4, 
        'icon-anchor': 'center',
        'icon-allow-overlap': true
      },
    });

    // Add unclustered airports
    map.current.addLayer({
      id: 'unclustered-point-airport',
      type: 'symbol',
      source: 'places',
      filter: ['all', ['!=', ['get', 'isAirport'], false], ['!', ['has', 'point_count']]],
      layout: {
        'icon-image': 'airport-icon', 
        'icon-size': 0.4,
        'icon-anchor': 'center',
        'icon-allow-overlap': true
      },
      paint: {
        'icon-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0, 
          1   
        ],
      },
    });

  
     // Add unclustered hover markers
     map.current.addLayer({
      id: 'unclustered-point-marker-hover',
      type: 'symbol',
      source: 'places',
      filter: ['all', ['==', ['get', 'isAirport'], false], ['!', ['has', 'point_count']]],
      layout: {
        'icon-image': 'marker-icon-hover', 
        'icon-size': 0.4, 
        'icon-anchor': 'center',
        'icon-allow-overlap': true
      },
    });

    // Add unclustered markers
    map.current.addLayer({
      id: 'unclustered-point-marker',
      type: 'symbol',
      source: 'places',
      filter: ['all', ['==', ['get', 'isAirport'], false], ['!', ['has', 'point_count']]],
      layout: {
        'icon-image': 'marker-icon', 
        'icon-size': 0.4, 
        'icon-anchor': 'center',
        'icon-allow-overlap': true
      },
      paint: {
        'icon-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0, 
          1   
        ],
      },
    });

    // Add cluster layer
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'places',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#26A659',
        'circle-radius': 20,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#f4f4f5',
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
        'text-color': '#f4f4f5',
        'icon-allow-overlap': true,
        "text-allow-overlap": true
      },
    });

    // Mouse enter event
    map.current.on('mouseenter', ['unclustered-point-marker','unclustered-point-airport'], (e) => {
      if (e.features.length > 0) {
        map.current.getCanvas().style.cursor = 'pointer';
    
        // Store the hovered feature's ID
        hoveredFeatureId = e.features[0].id;
    
        // Set hover state to true
        map.current.setFeatureState(
          { source: 'places', id: hoveredFeatureId },
          { hover: true }
        );
      }
    });
    
    // Mouse leave event
    map.current.on('mouseleave', ['unclustered-point-marker','unclustered-point-airport'], () => {
      if (hoveredFeatureId !== null) {
        map.current.getCanvas().style.cursor = '';
    
        // Set hover state to false
        map.current.setFeatureState(
          { source: 'places', id: hoveredFeatureId },
          { hover: false }
        );
    
        // Reset the hovered feature ID
        hoveredFeatureId = null;
      }
    });
    

    // Initialize a single popup instance using a ref
    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: true,       // Enable the close button
        closeOnClick: false      // Allow interactions within the popup
      });
    }

    const popup = popupRef.current;

    // Show popup on click
    map.current.on('click', ['unclustered-point-airport', 'unclustered-point-marker'], (e) => {
      // Change cursor style to pointer 
      map.current.getCanvas().style.cursor = 'pointer';

      // Ensure features are present
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];

      // Check if properties exist
      if (!feature.properties) {
        console.warn('Popup properties are undefined for the clicked feature.');
        return;
      }

      const properties = feature.properties;
      console.log('Clicked Feature:', feature);
      console.log('Clicked Feature Properties:', properties);

      // Get coordinates
      const coordinates = feature.geometry.coordinates.slice();

      const handleClose = () => {
        if (popupRef.current) {
          if (popupRef.current._popupRoot) {
            popupRef.current._popupRoot.unmount();
            delete popupRef.current._popupRoot;
          }
          popupRef.current.remove();
        }
      };
  
      // Create DOM node for the popup content
      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);
      root.render(<Popup properties={properties} onClose={handleClose} />);

      // Set the content and add the popup to the map
      popup
        .setLngLat(coordinates)
        .setDOMContent(popupNode)
        .addTo(map.current);

      // Store the root for unmounting later
      popup._popupRoot = root;
    });

    // Change cursor to pointer when hovering over clusters
    map.current.on('mouseenter', 'clusters', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current.getCanvas().style.cursor = '';
    });

    // Change cursor to pointer when hovering over markers
    map.current.on('mouseenter', 'unclustered-point-marker', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point-marker', () => {
      map.current.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'unclustered-point-airport', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point-airport', () => {
      map.current.getCanvas().style.cursor = '';
    });

    // Zoom into clusters on click
    map.current.on('click', 'clusters', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });
      if (!features || features.length === 0) return;

      const clusterId = features[0].properties.cluster_id;
      map.current.getSource('places').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.current.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
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

    // Cleanup event listeners on unmount or update
    return () => {
      map.current.off('click', ['unclustered-point-airport', 'unclustered-point-marker']);
      map.current.off('mouseenter', 'clusters');
      map.current.off('mouseleave', 'clusters');
      map.current.off('click', 'clusters');
      map.current.off('mouseenter', ['unclustered-point-airport', 'unclustered-point-marker']);
      map.current.off('mouseleave', ['unclustered-point-airport', 'unclustered-point-marker']);
    };
  }, [mapLoading, places, routes]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Map container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Spinner overlay */}
      {mapLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-10">
          <div className="animate-spin h-20 w-20 border-4 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default Map;
