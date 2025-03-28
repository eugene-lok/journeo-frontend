import React, { useState } from 'react';
import Map from './components/Map';
import Chat from './components/Chat';
import Navbar from './components/Navbar';
import Itinerary from './components/Itinerary';
import { Layers, X, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [itineraryData, setItineraryData] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  // Selected day controller state
  const [selectedDay, setSelectedDay] = useState(1);
  const totalDays = itineraryData?.itinerary?.days?.length || 0;

  // Seleted day controller functions
  const handlePrevDay = () => {
    setSelectedDay(prev => Math.max(1, prev - 1));
  };
  const handleNextDay = () => {
    setSelectedDay(prev => Math.min(totalDays, prev + 1));
  };

  // Get places for the selected day
  const getCurrentDayPlaces = () => {
    if (!itineraryData?.itinerary?.days) return [];
    const currentDay = itineraryData.itinerary.days.find(day => day.day === selectedDay);
    return currentDay?.places || [];
  };

  // Get routes for the selected day
  const getCurrentDayRoutes = () => {
    if (!itineraryData?.itinerary?.days) return [];
    const currentDay = itineraryData.itinerary.days.find(day => day.day === selectedDay);
    return currentDay?.routes || [];
  };

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
              setItineraryData={setItineraryData}
              setShowItinerary={setShowItinerary}
            />
          </div>
        </div>

        {/* Map Container*/}
        <div className="flex-1 flex flex-col rounded-xl bg-zinc-900 shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
            {/* Day Selection Controls */}
            {itineraryData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevDay}
                  disabled={selectedDay === 1}
                  className="p-1 hover:bg-zinc-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-zinc-400" />
                </button>
                <span className="text-zinc-100">Day {selectedDay}</span>
                <button
                  onClick={handleNextDay}
                  disabled={selectedDay === totalDays}
                  className="p-1 hover:bg-zinc-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setShowItinerary(!showItinerary)}
              className={`text-sm ml-auto flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showItinerary
                  ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              {showItinerary ? (
                <>
                  <X size={18} />
                  <span>Hide itinerary</span>
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
              itineraryData={itineraryData}
              places={getCurrentDayPlaces()}
              routes={getCurrentDayRoutes()}
              mapLoading={mapLoading}
            />
          
            {/* Itinerary panel */}
            <div
              className={`absolute top-0 right-0 bottom-5 w-1/3 bg-zinc-900 shadow-lg transition-transform duration-300 rounded-2xl overflow-hidden ${
                showItinerary ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="h-full p-4">
                <Itinerary
                  itineraryData={itineraryData}
                  itineraryLoading={itineraryLoading}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;