import React from 'react';

const Itinerary = ({ itineraryData, itineraryLoading }) => {
  const renderItinerary = (itinerary) => {
    const lines = itinerary.split('\n');

    return lines.map((line, index) => {
      if (line.startsWith('###')) {
        return (
          <h3 key={index} className="text-lg font-bold mt-4">
            {line.replace(/#/g, '').trim()}
          </h3>
        );
      } else if (line.startsWith('##')) {
        return (
          <h2 key={index} className="text-xl font-bold mt-6">
            {line.replace(/#/g, '').trim()}
          </h2>
        );
      } else if (line.startsWith('#')) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-8">
            {line.replace(/#/g, '').trim()}
          </h1>
        );
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={index} className="text-sm text-gray-900">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className="font-bold">
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
        return <hr key={index} className="border-t border-gray-300 my-4" />;
      }

      if (line.startsWith('-')) {
        return (
          <li key={index} className="ml-4 mb-2 text-sm text-gray-700 list-disc">
            {line.replace(/^- /, '').trim()}
          </li>
        );
      }

      return (
        <p key={index} className="text-base text-gray-900 mt-2">
          {line.trim()}
        </p>
      );
    });
  };

  // Loading state
  if (itineraryLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white bg-opacity-75">
        <p className="text-gray-500 mb-4">Loading...</p>
        <div className="animate-spin h-16 w-16 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Placeholder state
  if (!itineraryLoading && !itineraryData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-300 bg-opacity-50 rounded-xl">
        <p className="text-gray-600 text-lg">
          Your itinerary will appear here
        </p>
    </div>
    );
  }

  // Itinerary content
  return (
    <div className="mt-2 p-4">
      <div className="mt-4 space-y-4">
        {renderItinerary(itineraryData.itinerary)}
      </div>
    </div>
  );
};

export default Itinerary;
