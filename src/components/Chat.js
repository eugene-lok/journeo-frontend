import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Trash2 } from 'lucide-react';

const Chat = ({
  setMapLoading,
  setItineraryLoading,
  setLocationData,
  setItineraryData,
  setRouteData,
  setShowItinerary
}) => {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    try {
      const parsed = savedMessages ? JSON.parse(savedMessages) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing saved messages:', error);
      return [];
    }
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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const validateStoredSession = async () => {
      const sid = localStorage.getItem('sessionId');
      if (sid) {
        const isValid = await validateSession(sid);
        if (!isValid) {
          // If stored session is invalid, clear everything
          await clearSession();
        }
      }
    };

    validateStoredSession();
  }, []);

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
  const API_BASE_URL = 'http://127.0.0.1:8000';

  // Validate session with backend
  const validateSession = async (sid) => {
    if (!sid) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/validate-session/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      });

      if (!response.ok) {
        console.log('Session invalid or expired');
        await clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      await clearSession();
      return false;
    }
  };

  // Check session validity on component mount and after inactivity
  useEffect(() => {
    const checkSession = async () => {
      const sid = localStorage.getItem('sessionId');
      if (sid) {
        const isValid = await validateSession(sid);
        if (!isValid) {
          // Session expired or invalid - clear everything
          await clearSession();
        }
      }
    };

    checkSession();

    // Revalidate session after user inactivity
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(checkSession, 15 * 60 * 1000); // Check every 15 minutes
    };

    // Reset timer on user interaction
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, []);

  const handlePreferenceExtraction = async (userInput) => {
    try {
      const requestBody = {
        userInput: userInput,
        ...(sessionId && { sessionId })
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
      console.log("Preference extraction response:", data);
      
      // Store session ID and extracted entities
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      
      setExtractedEntities(data.extractedEntities);
      setIsPreferencesComplete(data.isComplete);

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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setIsLoading(true);
    setItineraryLoading(true);
    setMapLoading(true);

    try {
      const preferencesData = await handlePreferenceExtraction(input.trim());
      console.log("Extracted Preferences:", preferencesData);

      if (preferencesData.isComplete) {
        const itineraryData = await handleItineraryGeneration(
          preferencesData.sessionId,
          preferencesData.extractedEntities
        );
        
        console.log("Itinerary:", itineraryData);
        
        if (itineraryData?.response?.itinerary) {
          localStorage.setItem('itineraryData', JSON.stringify(itineraryData.response));
          setItineraryData(itineraryData.response);
          setLocationData({ places: itineraryData.response.places });
          setRouteData({ routes: itineraryData.response.routes });

          const completionMessage = {
            sender: 'bot',
            text: "Your itinerary has been generated! Let us know if you'd like to make any changes or ask questions about your trip. You can also click on the map markers to view details for each location."
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

  // Safe state setter for messages
  const safeSetMessages = (newMessages) => {
    // Ensure we're always setting an array
    const safeMessages = Array.isArray(newMessages) ? newMessages : [];
    setMessages(safeMessages);
    try {
      localStorage.setItem('chatMessages', JSON.stringify(safeMessages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  };

  // Clear session data
  const clearSession = async () => {
    try {
      // Clear backend session first
      if (sessionId) {
        const response = await fetch(`${API_BASE_URL}/api/clear-session/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          console.error('Error clearing backend session');
        }
      }

      // Clear all localStorage items
      localStorage.removeItem('sessionId');
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('extractedEntities');
      localStorage.removeItem('isPreferencesComplete');
      localStorage.removeItem('itineraryData');
      
      // Reset all state with safe defaults
      setSessionId(null);
      safeSetMessages([]);
      setExtractedEntities({});
      setIsPreferencesComplete(false);
      setItineraryData(null);
      setLocationData(null);
      setRouteData(null);
      setShowItinerary(false);
    } catch (error) {
      console.error('Error during session cleanup:', error);
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

  const renderOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
    <div className="bg-zinc-800 p-8 rounded-2xl max-w-md w-full border border-zinc-700 shadow-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-teal-500/10 p-3 rounded-xl">
          <MessageSquare className="h-6 w-6 text-teal-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-zinc-100 text-xl font-semibold">
            Plan Your Trip
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700/50">
          <p className="text-zinc-300 text-sm leading-relaxed">
            Include these details in your description:
          </p>
          <ul className="mt-2 space-y-1 text-zinc-400 text-sm">
            <li>• Destination</li>
            <li>• Duration of trip</li>
            <li>• Number of travelers</li>
            <li>• Budget</li>
          </ul>
        </div>

        <div className="bg-teal-500/5 p-4 rounded-xl border border-teal-500/10">
          <p className="text-zinc-200 text-sm font-medium mb-2">Example</p>
          <p className="text-zinc-400 text-sm italic">
            "I want to plan a 5-day trip to New York City for 2 people next month with a budget of $3000"
          </p>
        </div>
      </div>
    </div>
  </div>
);

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button
          onClick={clearSession}
          className="ml-auto flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          <span>Clear Trip</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto p-4 space-y-2 relative">
          {messages.length === 0 && renderOverlay()}
          {renderMessages()}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-zinc-800 p-4 mt-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-grow p-3 bg-zinc-800 rounded-full placeholder-zinc-400 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              placeholder="Send message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
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