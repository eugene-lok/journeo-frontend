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

  // Add a method to clear session data
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

      // Then clear frontend state and localStorage
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

    return (
      <div className="flex flex-col h-full bg-zinc-900 rounded-lg shadow-lg relative">
        <button
          onClick={clearSession}
          className="absolute top-2 right-2 p-2 text-red-400 hover:text-red-200 z-10"
        >
          Start Over
        </button>
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