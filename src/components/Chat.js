import React, { useState, useRef, useEffect } from 'react';
const Chat = () => {
    const [messages, setMessages] = useState([]); 
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
          const botMessage = { sender: 'bot', text: data.response };
          setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
          console.error('Error:', error);
          const errorMessage = { sender: 'bot', text: 'Something went wrong. Please try again.' };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
    };
  
    // Render chat messages
    const renderMessages = () =>
      messages.map((msg, index) => (
        // Change position and color of message based on sender
        <div
          key={index}
          className={`p-2 rounded-lg my-2 ${
            msg.sender === 'user' ? 'bg-green-500 text-white self-end' : 'bg-gray-300 text-black self-start'
          }`}
        >
          {msg.text}
        </div>
      ));
  
    return (
      <div className="flex flex-col h-screen p-6 bg-gray-100">
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
            className="p-2 bg-green-500 text-white rounded-r-lg hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? 'Sending' : 'Send'}
          </button>
        </div>
      </div>
    );
  };
  
  export default Chat;