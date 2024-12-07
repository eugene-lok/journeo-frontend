import React from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';

const Itinerary = ({ itineraryData, itineraryLoading }) => {
  const renderItinerary = (itinerary) => {
    const lines = itinerary.split('\n');

    return lines.map((line, index) => {
      if (line.startsWith('###')) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-6 mb-2 text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-500" />
            {line.replace(/#/g, '').trim()}
          </h3>
        );
      } else if (line.startsWith('##')) {
        return (
          <h2 key={index} className="text-xl font-semibold mt-8 mb-3 text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            {line.replace(/#/g, '').trim()}
          </h2>
        );
      } else if (line.startsWith('#')) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-2 mb-6 text-zinc-100 pb-3 border-b border-zinc-700">
            {line.replace(/#/g, '').trim()}
          </h1>
        );
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={index} className="text-sm text-zinc-300 leading-relaxed">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className="font-medium text-teal-400">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        );
      }

      if (line.startsWith('---')) {
        return <hr key={index} className="border-t border-zinc-700 my-6" />;
      }

      if (line.startsWith('-')) {
        return (
          <li key={index} className="ml-4 mb-3 text-sm text-zinc-300 list-disc marker:text-teal-500">
            {line.replace(/^- /, '').trim()}
          </li>
        );
      }

      if (line.trim()) {
        return (
          <p key={index} className="text-sm text-zinc-300 mb-3 leading-relaxed">
            {line.trim()}
          </p>
        );
      }

      return null;
    });
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
  if (!itineraryLoading && !itineraryData) {
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
      <div className="px-6 py-4">
        <div className="prose prose-invert prose-zinc prose-sm max-w-none">
          {renderItinerary(itineraryData.itinerary)}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;