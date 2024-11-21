import React, { useState } from 'react';
import Map from './components/Map';
import Chat from './components/Chat';
import Navbar from './components/Navbar';
import Itinerary from './components/Itinerary';

function App() {
  const [itineraryData, setItineraryData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex-grow relative flex w-full overflow-hidden">
        {/* Chat Component */}
        <div className="w-1/3 h-full bg-gray-100 z-10">
          <div className="h-full bg-white shadow-lg overflow-y-auto">
            <Chat
              setMapLoading={setMapLoading}
              setItineraryLoading={setItineraryLoading}
              setLocationData={setLocationData}
              setItineraryData={setItineraryData}
            />
          </div>
        </div>

        {/* Map Component */}
        <div className="flex-1 relative h-full overflow-hidden">
          <Map
            places={locationData ? locationData.places : []}
            mapLoading={mapLoading}
          />

          {showItinerary && (
            <div className="absolute top-0 left-0 h-full w-1/3 bg-white shadow-lg z-20 overflow-auto">
              <div className="p-4">
                <button
                  className="mb-4 text-md text-blue-500"
                  onClick={() => setShowItinerary(false)}
                >
                  Close
                </button>
                <Itinerary
                  itineraryData={itineraryData}
                  itineraryLoading={itineraryLoading}
                />
              </div>
            </div>
          )}

          {!showItinerary && (
            <button
              className="absolute top-4 left-4 bg-emerald-500 text-white py-2 px-4 rounded-lg shadow-md z-30"
              onClick={() => setShowItinerary(true)}
            >
              Show Itinerary
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
