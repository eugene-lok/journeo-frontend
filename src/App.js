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
    <div className="min-h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Navbar />
      <div className="flex w-full h-[93vh] relative">

        <div className="w-1/3 flex flex-col space-y-4 p-6 bg-gray-100 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg h-full overflow-auto">
            <Chat
              setMapLoading={setMapLoading}
              setItineraryLoading={setItineraryLoading}
              setLocationData={setLocationData}
              setItineraryData={setItineraryData}
            />
          </div>
        </div>

        <div className="flex-1 relative h-full">
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
              className="absolute top-4 left-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md z-30"
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
