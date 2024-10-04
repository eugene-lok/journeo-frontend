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
  <h1 className="text-5xl font-extrabold mb-2 drop-shadow-lg">Journeo</h1>
  <h3 className="text-xl font-medium text-gray-500 mb-8 tracking-wider">Your AI-powered travel assistant</h3>

  <div className="flex w-full h-[85vh] overflow-hidden"> {/* Keep overflow-hidden */}
    
    <div className="w-1/3 p-6 bg-white rounded-lg shadow-lg overflow-y-auto ml-5">
      <div className="flex flex-col space-y-4"> 
        <div className="bg-gray-50 p-4 rounded-lg"> 
          <FormComponent 
            setMapLoading={setMapLoading} 
            setItineraryLoading={setItineraryLoading} 
            setLocationData={setLocationData} 
            setItineraryData={setItineraryData}
          />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg"> 
          {/* Todo: Itinerary component */}
          <ItineraryComponent
            itineraryData={itineraryData}
            itineraryLoading={itineraryLoading}
          />
        </div>
      </div>
    </div>

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
