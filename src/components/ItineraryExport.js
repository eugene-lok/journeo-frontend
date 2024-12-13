import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Mail } from 'lucide-react';

const ItineraryExport = ({ itineraryData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateTextContent = () => {
    let content = `Trip Itinerary\n\n`;
    
    itineraryData.itinerary.days.forEach(day => {
      content += `DAY ${day.day}\n`;
      content += `${day.summaryOfDay}\n\n`;
      
      day.places.forEach(place => {
        content += `- ${place.name}\n`;
        content += `  ${place.description}\n`;
        content += `  Address: ${place.address}\n\n`;
      });
    });
    
    content += `\nBUDGET BREAKDOWN\n`;
    content += itineraryData.itinerary.budgetBreakdown;
    
    return content;
  };

  const exportAsText = () => {
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'itinerary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const shareViaEmail = () => {
    const subject = 'Trip Itinerary';
    const body = generateTextContent();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsOpen(false);
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-auto flex items-center gap-2 px-3 py-1.5 mb-3 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={exportAsText}
              className="bg-zinc-700 flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-600"
            >
              <FileText className="w-4 h-4" />
              Export (TXT)
            </button>
            <button
              onClick={shareViaEmail}
              className="bg-zinc-700 flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-600"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryExport;