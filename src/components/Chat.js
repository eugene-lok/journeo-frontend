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
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setIsLoading(true);
    setItineraryLoading(true);
    setMapLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      if (typeof data?.response === 'string') {
        const botMessage = { sender: 'bot', text: data.response };
        setMessages((prev) => [...prev, botMessage]);
      } else if (data.response?.itinerary) {
        setItineraryData(data.response);
        setLocationData({ places: data.response.places });
        setRouteData({ routes: data.response.routes });

        const completionMessage = {
          sender: 'bot',
          text: "Your itinerary has been generated. Let us know if you'd like to make any changes or ask questions about your trip. You can also click on the map markers to view details for each location."
        };
        setMessages((prev) => [...prev, completionMessage]);
        setShowItinerary(true);
      }
    } catch (error) {
      console.log('Error:', error);
      const errorMessage = {
        sender: 'bot',
        text: 'Something went wrong. Please try again.'
      };
      setMessages((prev) => [...prev, errorMessage]);
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