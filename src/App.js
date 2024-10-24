import React, { useState } from 'react';
import Map from './components/Map';
import Form from './components/Form';
import Itinerary from './components/Itinerary';
import Navbar from './components/Navbar';
import Chat from './components/Chat';

function App() {
  const [itineraryData, setItineraryData] = useState(null);  
  const [locationData, setLocationData] = useState(null);  
  const [mapLoading, setMapLoading] = useState(false);  
  const [itineraryLoading, setItineraryLoading] = useState(false);  

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 overflow-hidden">
      <Navbar />
      <div className="flex w-full h-[90vh] overflow-hidden"> 
        
        <div className="w-1/3 flex flex-col space-y-4 p-6 ml-5 h-full">
          {/* <div className="bg-white p-6 rounded-lg shadow-lg h-1/2 overflow-auto"> 
            <Form
              setMapLoading={setMapLoading} 
              setItineraryLoading={setItineraryLoading} 
              setLocationData={setLocationData} 
              setItineraryData={setItineraryData}
            />
          </div> */}
  
          <div className="bg-white p-6 rounded-lg shadow-lg h-1/2 overflow-auto"> 
            <Itinerary
              itineraryData={itineraryData}
              itineraryLoading={itineraryLoading}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg h-1/2 overflow-auto"> 
            <Chat
              setMapLoading={setMapLoading} 
              setItineraryLoading={setItineraryLoading}
            />
          </div>
        </div>
  
        <div className="w-2/3 h-full p-6">
          <Map 
            places={locationData ? locationData.places : []} 
            mapLoading={mapLoading} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
