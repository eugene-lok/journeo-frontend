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