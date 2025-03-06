"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, Plus, Search, Clock, Trash2, Star, ChevronLeft } from 'lucide-react';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! 👋 How can I help you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Getting Started Chat', timestamp: '2:30 PM', preview: 'Hello! 👋 How can I help you today?' },
    { id: 2, title: 'Technical Support', timestamp: '1:45 PM', preview: 'I need help with API integration' },
    { id: 3, title: 'Product Inquiry', timestamp: 'Yesterday', preview: 'Can you tell me about your pricing?' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentChat, setCurrentChat] = useState({ id: 1, title: 'New Chat' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewChat = () => {
    setCurrentChat({ id: Date.now(), title: 'New Chat' });
    setMessages([{
      id: Date.now(),
      type: 'bot',
      content: 'Hello! 👋 How can I help you today?',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ff8f-34-91-90-4.ngrok-free.app/generate_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: data.response || "I understand. How else can I help you?",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: "I apologize, but I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white w-80 border-r flex-shrink-0 transition-all duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Chat History</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={startNewChat}
            className="w-full bg-blue-500 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:bg-blue-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Chat
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => setCurrentChat(conv)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{conv.title}</span>
                  <span className="text-xs text-gray-500">{conv.timestamp}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.preview}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full mr-2"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">{currentChat.title}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Star className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Trash2 className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end max-w-[70%] space-x-2">
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                
                <div className={`rounded-2xl px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white shadow-md'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp}
                  </span>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white rounded-full px-4 py-2 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                         style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                         style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                         style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
