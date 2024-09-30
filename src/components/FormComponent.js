import React, { useState } from 'react';

const FormComponent = ({ setLoading, setLocationData }) => {
  const [origin, setOrigin] = useState('');
  const [destinations, setDestinations] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [itineraryData, setItineraryData] = useState(null);  
  const [formLoading, setFormLoading] = useState(false);  // Local loading state for the form spinner

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);  // Start form spinner
    setLoading(true);  // Start map spinner

    const destinationsList = destinations.split(',').map(dest => dest.trim());

    const formData = {
      origin: origin,
      destinations: destinationsList,
      duration: Number(duration),
      budget: Number(budget),
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/generateItinerary/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItineraryData(data); 
      setLocationData({
        coordinates: data.coordinates,
        addresses: data.addresses,
      });

    } catch (error) {
      console.error("Error generating itinerary:", error);
    } finally {
      setFormLoading(false);  // Stop form spinner
      setLoading(false);  // Stop map spinner
    }
  };

  const renderItinerary = (itinerary) => {
    // Split itinerary by newline
    const lines = itinerary.split('\n');
    
    return lines.map((line, index) => {
      // Parse headings (## or ###)
      if (line.startsWith('###')) {
        return <h3 key={index} className="text-lg font-bold mt-4">{line.replace(/#/g, '').trim()}</h3>;
      } else if (line.startsWith('##')) {
        return <h2 key={index} className="text-xl font-bold mt-6">{line.replace(/#/g, '').trim()}</h2>;
      } else if (line.startsWith('#')) {
        return <h1 key={index} className="text-2xl font-bold mt-8">{line.replace(/#/g, '').trim()}</h1>;
      }
      
      // Parse bold markdown
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={index} className="text-base text-gray-900">
            {parts.map((part, i) => 
              i % 2 === 1 ? <span key={i} className="font-bold">{part}</span> : part
            )}
          </p>
        );
      }

      // Parse hyphens
      if (line.startsWith('-')) {
        return (
          <li key={index} className="ml-4 mb-2 text-sm text-gray-700 list-disc">
            {line.replace(/^- /, '').trim()}
          </li>
        );
      }

      // Parse remaining lines
      return (
        <p key={index} className="text-base text-gray-900 mt-2">
          {line.trim()}
        </p>
      );
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Origin Location</label>
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Where are you travelling from?"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Destinations</label>
        <input
          type="text"
          value={destinations}
          onChange={(e) => setDestinations(e.target.value)}
          placeholder="Which place(s) would you like to travel to?"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Budget</label>
        <input
          type="text"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="What's your budget?"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (days)</label>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="How long would you like the trip to be?"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button type="submit" className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
        Generate Itinerary
      </button>

      {/* Loading Indicator for the form */}
      {formLoading && (
        <div className="mt-4 text-center">
          <p className="text-gray-500">Loading...</p>
          <div className="animate-spin h-20 w-20 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      )}

      {/* Render itinerary when form is not loading */}
      {itineraryData && !formLoading && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Your Itinerary</h2>
          <div className="mt-4 space-y-4">
            {renderItinerary(itineraryData.itinerary)}
          </div>
        </div>
      )}
    </form>
  );
};

export default FormComponent;
