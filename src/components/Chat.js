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
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you plan your trip today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isPreferencesComplete, setIsPreferencesComplete] = useState(false);
  const [extractedEntities, setExtractedEntities] = useState({});
  const chatEndRef = useRef(null);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


// Endpoint for entity extraction loop
  const handlePreferenceExtraction = async (userInput) => {
    try {
      const requestBody = {
        userInput: userInput,
        ...(sessionId && { sessionId }) // Include sessionId if it exists
      };

      const response = await fetch(`${API_BASE_URL}/api/extract-preferences/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to extract preferences');
      }

      const data = await response.json();
      
      // Update session state
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      
      // Update preferences state
      setExtractedEntities(data.extractedEntities);
      setIsPreferencesComplete(data.isComplete);

      // Add clarification message if not complete
      if (!data.isComplete && data.clarificationMessage) {
        const botMessage = { sender: 'bot', text: data.clarificationMessage };
        setMessages(prev => [...prev, botMessage]);
      }

      return data;
    } catch (error) {
      console.error('Error in preference extraction:', error);
      throw error;
    }
  };

  // Endpoint for itinerary genration after entities extracted
  const handleItineraryGeneration = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: JSON.stringify(extractedEntities) }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in itinerary generation:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setIsLoading(true);
    setItineraryLoading(true);
    setMapLoading(true);

    try {
      // Handle preference extraction if first message or preferences incomplete
      const preferencesData = await handlePreferenceExtraction(input.trim());

      console.log("Extracted Preferences: ", preferencesData)
      // If preferences are complete, proceed with itinerary generation
      if (preferencesData.isComplete) {
        const itineraryData = await handleItineraryGeneration();
        
        if (itineraryData?.response?.itinerary) {
          setItineraryData(itineraryData.response);
          setLocationData({ places: itineraryData.response.places });
          setRouteData({ routes: itineraryData.response.routes });

          const completionMessage = {
            sender: 'bot',
            text: "Your itinerary has been generated. Let us know if you'd like to make any changes or ask questions about your trip. You can also click on the map markers to view details for each location."
          };
          setMessages(prev => [...prev, completionMessage]);
          setShowItinerary(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        sender: 'bot',
        text: 'Something went wrong. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setItineraryLoading(false);
      setMapLoading(false);
    }
  };

  const renderMessages = () =>
    messages.map((msg, index) => (
      <div
        key={index}
        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`inline-block max-w-[80%] p-3 rounded-2xl my-2 shadow-md transition-all ${
            msg.sender === 'user'
              ? 'bg-teal-500 text-zinc-100 rounded-br-sm'
              : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
          }`}
        >
          {msg.text}
        </div>
      </div>
    ));

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {renderMessages()}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-zinc-800 p-4 mt-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-grow p-3 bg-zinc-800 rounded-full placeholder-zinc-400 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              placeholder="Send message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="p-3 bg-teal-500 text-zinc-100 rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;