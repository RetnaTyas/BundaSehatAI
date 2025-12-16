import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithAdvisor } from '../services/gemini';

export const ChatAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo Bunda! Saya BundaSehat AI. Ada yang bisa saya bantu mengenai nutrisi atau kehamilan hari ini?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithAdvisor(history, userMsg.text);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
      <div className="bg-rose-50 p-4 border-b border-rose-100 flex items-center gap-3">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <Sparkles size={20} className="text-rose-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Tanya BundaSehat</h3>
          <p className="text-xs text-rose-600">Asisten Nutrisi Cerdas</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-rose-500 text-white rounded-tr-none shadow-md' 
                : 'bg-gray-100 text-gray-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 flex gap-2 items-center">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-2 items-center bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm focus-within:border-rose-300 focus-within:ring-1 focus-within:ring-rose-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya soal makanan, vitamin..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 py-1"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="text-rose-500 hover:text-rose-600 disabled:text-gray-300 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};