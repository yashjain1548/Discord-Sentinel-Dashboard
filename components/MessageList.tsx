import React, { useEffect, useRef } from 'react';
import { DiscordMessage } from '../types';

interface MessageListProps {
  messages: DiscordMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBorderColor = (m: DiscordMessage) => {
    if (!m.analysis) return 'border-transparent';
    if (m.analysis.is_toxic) return 'border-l-4 border-[#ED4245] bg-[#ED4245]/10';
    if (m.analysis.sentiment_score > 0.5) return 'border-l-4 border-[#57F287]';
    if (m.analysis.sentiment_score < -0.5) return 'border-l-4 border-[#FEE75C]';
    return 'border-l-4 border-[#5865F2]';
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-0">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-10 italic">
          No messages monitored yet. Start typing below to simulate stream.
        </div>
      )}
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`relative group p-3 rounded bg-[#36393f] hover:bg-[#32353b] transition-colors ${getBorderColor(msg)}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs">
                {msg.author.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-white text-sm mr-2">{msg.author}</span>
                <span className="text-xs text-gray-400">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            {msg.isAnalyzing && (
               <span className="text-xs text-[#5865F2] animate-pulse">Analyzing...</span>
            )}
            {!msg.isAnalyzing && msg.analysis && (
              <div className="flex gap-2">
                 <span className="text-[10px] uppercase bg-[#202225] px-1.5 py-0.5 rounded text-gray-300">
                  {msg.analysis.primary_topic}
                </span>
                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded text-white ${msg.analysis.is_toxic ? 'bg-[#ED4245]' : 'bg-[#202225]'}`}>
                  {msg.analysis.is_toxic ? 'TOXIC' : 'SAFE'}
                </span>
                <span className="text-[10px] bg-[#202225] px-1.5 py-0.5 rounded text-gray-300" title="Sentiment Score">
                  {msg.analysis.sentiment_score.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <p className={`mt-1 text-sm text-gray-200 pl-10 ${msg.analysis?.is_toxic ? 'opacity-50 blur-[2px] group-hover:blur-0 transition-all' : ''}`}>
            {msg.content}
          </p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;