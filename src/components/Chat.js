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
            
            const completionMessage = { sender: 'bot', text: "Your itinerary has been generated! Let us know if you'd like to make any changes or ask questions about your trip."};
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
        <div
          key={index}
          className={`p-2 rounded-lg my-2 ${
            msg.sender === 'user' ? 'bg-emerald-500 text-white self-end' : 'bg-zinc-800 text-black self-start'
          }`}
        >
          {parseMarkdown(msg.text)}
        </div>
      ));

    // Helper function to parse markdown in messages
    const parseMarkdown = (text) => {
  // Split the text by newline
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    // Parse bold markdown
    const boldRegex = /\*\*(.*?)\*\*/g;
    if (boldRegex.test(line)) {
      const parts = line.split(boldRegex);
      return (
        <p key={index} className="text-white">
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
        <li key={index} className="ml-4 mb-2 text-white list-disc">
          {line.replace(/^- /, '').trim()}
        </li>
      );
    }

    // Parse remaining lines
    return (
      <p key={index} className=" text-white self-end">
        {line.trim()}
      </p>
    );
  });
};


  
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