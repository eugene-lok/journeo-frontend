import React, { useState } from 'react';

const Form = ({ setMapLoading, setItineraryLoading, setLocationData, setItineraryData }) => {
  const [origin, setOrigin] = useState('');
  const [destinations, setDestinations] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setItineraryLoading(true);  // Start itinerary spinner
    setMapLoading(true);  // Start map spinner

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
      console.log("data", data);
      setItineraryData(data); 
      setLocationData({
        places: data.places
      });

    } catch (error) {
      console.error("Error generating itinerary:", error);
    } finally {
      setItineraryLoading(false);  // Stop itinerary spinner
      setMapLoading(false);  // Stop map spinner
    }
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
      
    </form>
  );
};

export default Form;
