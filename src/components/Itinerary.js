import React, { useRef, useEffect } from 'react';

const Itinerary = ({itineraryData, itineraryLoading }) => {

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
              <p key={index} className="text-sm text-gray-900">
                {parts.map((part, i) => 
                  i % 2 === 1 ? <span key={i} className="font-bold">{part}</span> : part
                )}
              </p>
            );
          }
    
          // Parse horizontal rule
          if (line.startsWith('---')) {
            return <hr key={index} className="border-t border-gray-300 my-4" />;
          }
    
          // Parse bullet points
          if (line.startsWith('-')) {
            return (
              <li key={index} className="ml-4 mb-2 text-sm text-gray-700 list-disc">
                {line.replace(/^- /, '').trim()}
              </li>
            );
          }

          if (line.startsWith('- **')) {
            
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
    <div>
    {itineraryLoading && (
         <div className="mt-2 text-center">
          <p className="text-gray-500">Loading...</p>
          <div className="animate-spin h-20 w-20 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
        </div> 
      )}

      {/* Render itinerary when form is not loading */}
      {itineraryData && !itineraryLoading && (
        <div className="mt-2">
          <h2 className="text-xl font-bold">Your Itinerary</h2>
          <div className="mt-4 space-y-4">
            {renderItinerary(itineraryData.itinerary)}
          </div>
        </div> 
      )}
    </div>
  );
};

export default Itinerary;
