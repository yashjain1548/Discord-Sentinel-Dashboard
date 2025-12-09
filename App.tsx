import React, { useState, useCallback } from 'react';
import { DiscordMessage } from './types';
import { analyzeMessage } from './services/geminiService';
import DashboardStats from './components/DashboardStats';
import MessageList from './components/MessageList';
import { ChartBarIcon, ShieldCheckIcon, SignalIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function App() {
  const [messages, setMessages] = useState<DiscordMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate receiving a message
  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const content = inputValue;
    setInputValue('');

    const newMessage: DiscordMessage = {
      id: Date.now().toString(),
      author: 'User_Sim',
      content: content,
      timestamp: new Date(),
      isAnalyzing: true
    };

    setMessages(prev => [...prev, newMessage]);
    setIsProcessing(true);

    try {
      const analysis = await analyzeMessage(content);
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id 
          ? { ...m, analysis, isAnalyzing: false } 
          : m
      ));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id 
          ? { ...m, isAnalyzing: false } 
          : m
      ));
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue]);

  // Batch simulation for demo purposes
  const runSimulation = async () => {
    const samples = [
      "This server is absolutely amazing, I love the community here!",
      "Does anyone know how to fix the Python indentation error in line 45?",
      "You are all stupid and this game sucks.",
      "Just had lunch, thinking about streaming later.",
      "The mods here are useless, banning people for no reason.",
      "Can we get a dedicated channel for memes?",
    ];

    for (const text of samples) {
      const newMessage: DiscordMessage = {
        id: Math.random().toString(),
        author: `SimUser_${Math.floor(Math.random() * 100)}`,
        content: text,
        timestamp: new Date(),
        isAnalyzing: true
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Artificial stagger
      await new Promise(r => setTimeout(r, 500));
      
      analyzeMessage(text).then(analysis => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, analysis, isAnalyzing: false } : m));
      });
    }
  };

  return (
    <div className="flex h-screen bg-[#202225] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar Navigation (Mock) */}
      <div className="w-18 bg-[#202225] flex flex-col items-center py-4 space-y-4 border-r border-[#1e1f22]">
        <div className="w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white mb-2 shadow-sm transition-all hover:rounded-xl cursor-pointer">
          <ShieldCheckIcon className="w-7 h-7" />
        </div>
        <div className="w-12 h-12 rounded-3xl bg-[#36393f] flex items-center justify-center text-[#57F287] hover:bg-[#57F287] hover:text-white transition-all cursor-pointer group">
          <ChartBarIcon className="w-6 h-6" />
        </div>
        <div className="w-12 h-12 rounded-3xl bg-[#36393f] flex items-center justify-center text-gray-400 hover:bg-[#5865F2] hover:text-white transition-all cursor-pointer group">
          <UserGroupIcon className="w-6 h-6" />
        </div>
        <div className="mt-auto mb-4 w-12 h-12 rounded-3xl bg-[#36393f] flex items-center justify-center text-red-400 hover:bg-[#ED4245] hover:text-white transition-all cursor-pointer">
          <SignalIcon className="w-6 h-6" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#36393f]">
        {/* Header */}
        <header className="h-12 border-b border-[#202225] flex items-center px-4 shadow-sm bg-[#36393f]">
          <h1 className="font-bold text-gray-200 flex items-center gap-2">
            <span className="text-[#96989d]">#</span>
            <span>sentinel-dashboard</span>
          </h1>
          <span className="ml-4 text-xs text-gray-500 border-l border-gray-600 pl-4">
            Analysis Engine: <span className="text-[#57F287]">Online (Gemini 2.5)</span>
          </span>
          <div className="ml-auto flex gap-2">
            <button 
              onClick={runSimulation}
              className="text-xs bg-[#5865F2] hover:bg-[#4752c4] text-white px-3 py-1 rounded transition"
            >
              Run Simulation
            </button>
          </div>
        </header>

        {/* Dashboard & Feed Split */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          
          {/* Top Half: Visualization */}
          <div className="flex-shrink-0 mb-2">
            <DashboardStats messages={messages} />
          </div>

          {/* Bottom Half: Message Feed */}
          <div className="flex-1 bg-[#2f3136] rounded-lg border border-[#202225] flex flex-col min-h-0">
            <div className="p-3 border-b border-[#202225] flex justify-between items-center">
              <h2 className="text-xs font-bold text-gray-400 uppercase">Live Ingestion Stream</h2>
              <span className="text-xs text-gray-500">Watching WebSocket...</span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-hidden flex flex-col">
              <MessageList messages={messages} />
            </div>

            {/* Input Console */}
            <div className="p-4 bg-[#36393f] mx-2 mb-2 rounded-lg">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Inject message into stream..."
                  className="w-full bg-[#40444b] text-gray-200 rounded p-3 pr-10 outline-none focus:ring-0 placeholder-gray-500 font-light"
                  disabled={isProcessing}
                />
                <div className="absolute right-3 top-3 text-xs text-gray-500 pointer-events-none">
                  ENTER
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
      
      {/* Right Sidebar: Details (Mock) */}
      <div className="w-60 bg-[#2f3136] border-l border-[#202225] hidden xl:flex flex-col p-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Active Threads</h3>
        <div className="space-y-3">
            {['general', 'help-python', 'memes', 'announcements'].map(channel => (
                <div key={channel} className="flex items-center text-gray-400 hover:bg-[#36393f] p-1 rounded cursor-pointer group">
                    <span className="text-gray-500 mr-2 text-lg">#</span>
                    <span className="group-hover:text-gray-200">{channel}</span>
                </div>
            ))}
        </div>
        
        <h3 className="text-gray-400 text-xs font-bold uppercase mt-8 mb-4">System Health</h3>
        <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
                <span>Latency</span>
                <span className="text-[#57F287]">24ms</span>
            </div>
            <div className="flex justify-between text-xs text-gray-300">
                <span>Uptime</span>
                <span>99.9%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-300">
                <span>Model</span>
                <span className="text-blue-400">Gemini 2.5 Flash</span>
            </div>
        </div>
      </div>
    </div>
  );
}