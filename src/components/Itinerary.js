import React from 'react';
import { Calendar, MapPin, Loader2, WalletCards } from 'lucide-react';
import ItineraryExport from './ItineraryExport';

const Itinerary = ({ itineraryData, itineraryLoading, selectedDay, setSelectedDay }) => {
  const renderPlace = (place) => (
    <div className="mb-6 last:mb-0">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-teal-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="text-base font-medium text-zinc-100">{place.name}</h4>
          <p className="text-sm text-zinc-300 mt-1">{place.description}</p>
          <p className="text-xs text-zinc-400 mt-1">{place.address}</p>
        </div>
      </div>
    </div>
  );

  const renderDay = (dayData) => (
    <button 
      onClick={() => setSelectedDay(dayData.day)}
      className={`w-full text-left transition-colors ${
        selectedDay === dayData.day 
          ? 'bg-zinc-700/50 hover:bg-zinc-700/70' 
          : 'bg-zinc-800/50 hover:bg-zinc-700/50'
      } rounded-lg p-6 mb-6 last:mb-0`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-teal-500" />
        <h2 className="text-xl font-semibold text-zinc-100">Day {dayData.day}</h2>
      </div>
     
      <div className="border-l-2 border-zinc-700 pl-4 mb-6">
        <p className="text-sm text-zinc-300">{dayData.summaryOfDay}</p>
      </div>
      <div className="space-y-6">
        {dayData.places.map((place, index) => (
          <div key={index}>
            {renderPlace(place)}
          </div>
        ))}
      </div>
    </button>
  );

  const renderBudgetBreakdown = () => (
    <div className="bg-zinc-800/50 rounded-lg p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <WalletCards className="w-5 h-5 text-teal-500" />
        <h2 className="text-xl font-semibold text-zinc-100">Budget</h2>
      </div>
      <div className="border-zinc-700 pl-4">
        <p className="text-sm text-zinc-300 whitespace-pre-line">
          {itineraryData.itinerary.budgetBreakdown}
        </p>
      </div>
    </div>
  );

  // Loading state
  if (itineraryLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-800/50 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin mb-4" />
        <p className="text-zinc-300 text-sm">Generating your itinerary</p>
      </div>
    );
  }

  // Placeholder state
  if (!itineraryLoading && (!itineraryData || !itineraryData.itinerary)) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-800/50 backdrop-blur-sm px-6 text-center">
        <Calendar className="h-12 w-12 text-zinc-600 mb-4" />
        <p className="text-zinc-400 text-sm mb-2">
          Your trip itinerary will appear here
        </p>
        <p className="text-zinc-500 text-xs">
          Start chatting to generate a personalized travel plan
        </p>
      </div>
    );
  }

  // Itinerary content
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-6 pb-3 border-b border-zinc-700">
          Trip itinerary
        </h1>
        <ItineraryExport itineraryData={itineraryData} />
        <div className="space-y-6">
          {itineraryData.itinerary.days.map((day) => (
            <div key={day.day}>
              {renderDay(day)}
            </div>
          ))}
        </div>
        {renderBudgetBreakdown()}
      </div>
    </div>
  );
};

export default Itinerary;