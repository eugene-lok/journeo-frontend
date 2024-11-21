import React, { useState, useRef, useEffect } from 'react';
const Chat = ({setMapLoading, setItineraryLoading, setLocationData, setItineraryData}) => {
    const [messages, setMessages] = useState([
      {sender: 'bot', text: 'Hi! How can I help you plan your trip today?'}
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
  
    // Handle user input submission
    const handleSend = async () => {
        if (!input.trim()) return;
      
        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
      
        setIsLoading(true);
        setItineraryLoading(true);  // Start itinerary spinner
        setMapLoading(true);  // Start map spinner
      
        try {
          const response = await fetch('http://127.0.0.1:8000/api/chat/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to fetch response');
          }
          
          const data = await response.json();
          console.log("data: ", data);
          if (typeof data?.response === 'string') {
            const botMessage = { sender: 'bot', text: data.response };
            setMessages((prev) => [...prev, botMessage]);
          }
          // Set data and alternate chat message if itinerary recieved
          else if (data.response.hasOwnProperty('itinerary')) {
            setItineraryData(data.response); 
            setLocationData({
              places: data.response.places
            }); 
            
            const completionMessage = { sender: 'bot', text: 'Okay! Here is a sample itinerary.' };
            setMessages((prev) => [...prev, completionMessage]);
          }
          
        } 
        catch (error) {
          console.log('Error:', error);
          const errorMessage = { sender: 'bot', text: 'Something went wrong. Please try again.' };
          setMessages((prev) => [...prev, errorMessage]);
        } 
        finally {
          setIsLoading(false);
          setItineraryLoading(false);  // Start itinerary spinner
          setMapLoading(false);  // Start map spinner
        }
    };
  
    // Render chat messages
    const renderMessages = () =>
      messages.map((msg, index) => (
        // Change position and color of message based on sender
        <div
          key={index}
          className={`p-2 rounded-lg my-2 ${
            msg.sender === 'user' ? 'bg-emerald-500 text-white self-end' : 'bg-gray-300 text-black self-start'
          }`}
        >
          {msg.text}
        </div>
      ));

    // Handle message when itinerary object is received


  
    return (
      <div className="flex flex-col h-full p-6 bg-gray-100">
        <div className="flex-grow overflow-y-auto flex flex-col space-y-2">
          {renderMessages()}
          <div ref={chatEndRef} /> 
        </div>
  
        <div className="mt-4 flex">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l-lg"
            placeholder="Send message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          />
          <button
            onClick={handleSend}
            className="p-2 bg-emerald-500 text-white rounded-r-lg hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? 'Sending' : 'Send'}
          </button>
        </div>
      </div>
    );
  };
  
  export default Chat;