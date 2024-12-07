import React, { useState } from 'react';
import Map from './components/Map';
import Chat from './components/Chat';
import Navbar from './components/Navbar';
import Itinerary from './components/Itinerary';
import { Layers, X } from 'lucide-react';

function App() {
  const [itineraryData, setItineraryData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <Navbar />
      
      <div className="flex-grow flex gap-4 p-4 overflow-hidden">
        {/* Chat */}
        <div className="w-1/3 flex flex-col">
          <div className="flex-grow rounded-xl overflow-hidden shadow-lg">
            <Chat
              setMapLoading={setMapLoading}
              setItineraryLoading={setItineraryLoading}
              setLocationData={setLocationData}
              setItineraryData={setItineraryData}
              setRouteData={setRouteData}
              setShowItinerary={setShowItinerary}
            />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 flex flex-col rounded-xl bg-zinc-900 shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-700 flex justify-between items-center">
            <button
              onClick={() => setShowItinerary(!showItinerary)}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showItinerary 
                ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700' 
                : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              {showItinerary ? (
                <>
                  <X size={18} />
                  <span>Hide Itinerary</span>
                </>
              ) : (
                <>
                  <Layers size={18} />
                  <span>Show Itinerary</span>
                </>
              )}
            </button>
          </div>

          {/* Map */}
          <div className="flex-grow relative">
            <Map
              places={locationData ? locationData.places : []}
              routes={routeData ? routeData.routes : []}
              mapLoading={mapLoading}
            />
            
            {/* Itinerary panel */}
            <div 
              className={`absolute top-0 right-0 h-full w-1/3 bg-zinc-900 shadow-lg transition-transform duration-300 rounded-2xl ${
                showItinerary ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="h-full p-4">
                {/* <Itinerary
                  itineraryData={itineraryData}
                  itineraryLoading={itineraryLoading}
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;