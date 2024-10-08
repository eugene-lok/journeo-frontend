import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import FormComponent from './components/FormComponent';
import ItineraryComponent from './components/ItineraryComponent';

function App() {
  const [itineraryData, setItineraryData] = useState(null);  
  const [locationData, setLocationData] = useState(null);  // Manage location data in App\
  const [mapLoading, setMapLoading] = useState(false);  
  const [itineraryLoading, setItineraryLoading] = useState(false);  

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-5xl font-extrabold mt-2 mb-2 drop-shadow-lg">Journeo</h1>
      <h3 className="text-xl font-medium text-gray-500 mb-2 tracking-wider">Your AI-powered travel assistant</h3>
  
      <div className="flex w-full h-[85vh] overflow-hidden"> 
        
        <div className="w-1/3 flex flex-col space-y-4 p-6 ml-2">
          <div className="bg-white p-6 rounded-lg shadow-lg"> 
            <FormComponent 
              setMapLoading={setMapLoading} 
              setItineraryLoading={setItineraryLoading} 
              setLocationData={setLocationData} 
              setItineraryData={setItineraryData}
            />
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow-lg flex-grow overflow-y-auto"> 
            <ItineraryComponent
              itineraryData={itineraryData}
              itineraryLoading={itineraryLoading}
            />
          </div>
        </div>
  
        {/* Right column remains the same */}
        <div className="w-2/3 h-full p-6">
          <MapComponent 
            places={locationData ? locationData.places : []} 
            mapLoading={mapLoading} 
          />
        </div>
      </div>
    </div>
  );
  
  
}

export default App;
