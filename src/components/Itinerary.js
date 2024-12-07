import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const Itinerary = ({ itineraryData, itineraryLoading }) => {
  const [expandedDays, setExpandedDays] = useState({});

  const toggleDay = (dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

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

  const renderDay = (dayData) => {
    const isExpanded = expandedDays[dayData.day] ?? true; // Default to expanded

    return (
      <div className="bg-zinc-800 rounded-lg overflow-hidden">
        <button 
          onClick={() => toggleDay(dayData.day)}
          className="w-full p-6 flex items-center justify-between hover:bg-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-semibold text-zinc-100">Day {dayData.day}</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </button>

        {isExpanded && (
          <div className="px-6 pb-6 pt-2">
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
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (itineraryLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-800/50 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin mb-4" />
        <p className="text-zinc-300 text-sm">Generating your itinerary...</p>
      </div>
    );
  }

  // Placeholder state
  if (!itineraryLoading && (!itineraryData || !itineraryData.itinerary)) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-800/50 backdrop-blur-sm px-6 text-center">
        <Calendar className="h-12 w-12 text-zinc-600 mb-4" />
        <p className="text-zinc-400 text-sm mb-2">
          Your travel itinerary will appear here
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
          Your Travel Itinerary
        </h1>
        <div className="space-y-4">
          {itineraryData.itinerary.days.map((day) => (
            <div key={day.day}>
              {renderDay(day)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;