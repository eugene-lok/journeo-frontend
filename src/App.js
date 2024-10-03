import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import FormComponent from './components/FormComponent';

function App() {
  const [locationData, setLocationData] = useState(null);  // Manage location data in App
  const [loading, setLoading] = useState(false);  // Track loading state

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-5xl font-extrabold mb-2 drop-shadow-lg">Journeo</h1>
      <h3 className="text-xl font-medium text-gray-500 mb-8 tracking-wider">Your AI-powered travel assistant</h3>

      <div className="flex w-full h-[85vh] overflow-hidden"> {/* Add overflow-hidden here */}
        <div className="w-1/3 p-6 bg-white rounded-lg shadow-lg overflow-y-auto ml-5">
          <FormComponent setLoading={setLoading} setLocationData={setLocationData} />
        </div>

        <div className="w-2/3 h-full p-6">
          <MapComponent 
            places={locationData ? locationData.places : []} 
            loading={loading}  // Pass loading state to MapComponent
          />
        </div>
      </div>
    </div>
  );
}

export default App;
