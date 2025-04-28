import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

const AIChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string; }[]>([
    { sender: 'assistant', text: 'Hi, I am SecureLance AI Assistant. How can I help you?' }
  ]);
  const [input, setInput] = useState('');

  const toggleOpen = () => setOpen(!open);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    // Placeholder response
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'assistant', text: "Sorry, I'm not available right now." }]);
    }, 500);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <span className="font-semibold">AI Assistant</span>
            <button onClick={toggleOpen}><X /></button>
          </div>
          <div className="flex-1 p-2 space-y-2 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className={`${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`${msg.sender === 'user' ? 'inline-block bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100' : 'inline-block bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'} rounded px-2 py-1 max-w-[80%]`}>{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex">
              <input
                className="flex-1 px-2 py-1 rounded-l border border-gray-300 dark:border-gray-600 focus:outline-none"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              />
              <button onClick={sendMessage} className="px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-r">Send</button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:scale-110 transform transition"
        aria-label="Toggle AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </>
  );
};

export default AIChatWidget;
