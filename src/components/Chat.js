import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const Chat = ({
  setMapLoading,
  setItineraryLoading,
  setLocationData,
  setItineraryData,
  setRouteData,
  setShowItinerary
}) => {
  // Initialize state from localStorage if it exists
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      { sender: 'bot', text: 'Hi! How can I help you plan your trip today?' }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('sessionId') || null;
  });
  
  const [extractedEntities, setExtractedEntities] = useState(() => {
    const savedEntities = localStorage.getItem('extractedEntities');
    return savedEntities ? JSON.parse(savedEntities) : {};
  });

  const [isPreferencesComplete, setIsPreferencesComplete] = useState(() => {
    return localStorage.getItem('isPreferencesComplete') === 'true';
  });

  const chatEndRef = useRef(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
    } else {
      localStorage.removeItem('sessionId');
    }
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('extractedEntities', JSON.stringify(extractedEntities));
  }, [extractedEntities]);

  useEffect(() => {
    localStorage.setItem('isPreferencesComplete', isPreferencesComplete);
  }, [isPreferencesComplete]);

  // Restore itinerary display if it exists
  useEffect(() => {
    const savedItinerary = localStorage.getItem('itineraryData');
    if (savedItinerary) {
      const itineraryData = JSON.parse(savedItinerary);
      setItineraryData(itineraryData);
      setLocationData({ places: itineraryData.places });
      setRouteData({ routes: itineraryData.routes });
      setShowItinerary(true);
    }
  }, []);

  // Your existing methods here, but add localStorage for itinerary
  const handleItineraryGeneration = async (currentSessionId, currentEntities) => {
    try {
      console.log("Sending itinerary request with:", {
        sessionId: currentSessionId,
        entities: currentEntities
      });

      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          input: currentEntities
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const data = await response.json();
      
      // Save itinerary data
      if (data.response?.itinerary) {
        localStorage.setItem('itineraryData', JSON.stringify(data.response));
      }

      return data;
    } catch (error) {
      console.error('Error in itinerary generation:', error);
      throw error;
    }
  };

  // Add a method to clear session data
  const clearSession = () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('extractedEntities');
    localStorage.removeItem('isPreferencesComplete');
    localStorage.removeItem('itineraryData');
    
    setSessionId(null);
    setMessages([{ sender: 'bot', text: 'Hi! How can I help you plan your trip today?' }]);
    setExtractedEntities({});
    setIsPreferencesComplete(false);
    setItineraryData(null);
    setLocationData(null);
    setRouteData(null);
    setShowItinerary(false);
  };

  // ... rest of your component code ...

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg shadow-lg">
      {/* Add a reset button if you want */}
      <button
        onClick={clearSession}
        className="absolute top-2 right-2 p-2 text-zinc-400 hover:text-zinc-200"
      >
        Reset Session
      </button>
      {/* ... rest of your JSX ... */}
    </div>
  );
};

export default Chat;