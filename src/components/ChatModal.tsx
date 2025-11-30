/**
 * ChatModal - Full-screen chat interface with TI-Guy
 * Premium Quebec Heritage Design with smooth slide animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { IoCloseOutline, IoSend } from 'react-icons/io5';
import { useHaptics } from '@/hooks/useHaptics';
import { GoldInput } from '@/components/GoldInput';
import { ChatMessage } from '@/types/chat';
import { getTiGuyResponse } from '@/utils/tiGuyResponses';
import { cn } from '@/lib/utils';

interface ChatModalProps {
  onClose: () => void;
}

// Initial welcome message from TI-Guy
const initialMessages: ChatMessage[] = [
  {
    id: '0',
    sender: 'tiGuy',
    text: "Hé ben! Bienvenue dans le chat. Qu'est-ce que j'peux faire pour toé aujourd'hui? 🦫",
    timestamp: new Date(),
  },
];

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isTiGuy = message.sender === 'tiGuy';

  // Gold/Black theme styling for bubbles
  const bubbleClasses = isTiGuy
    ? 'bg-gold-500 text-black self-start rounded-r-xl rounded-bl-xl'
    : 'bg-gray-700 text-white self-end rounded-l-xl rounded-br-xl';

  return (
    <div className={cn('flex mb-3', isTiGuy ? 'justify-start' : 'justify-end')}>
      <div className={cn('max-w-xs px-4 py-2.5 text-sm shadow-lg', bubbleClasses)}>
        <p className="leading-relaxed">{message.text}</p>
        <span className="block text-xs mt-1.5 opacity-70 text-right">
          {message.timestamp.toLocaleTimeString('fr-CA', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

export const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
  const { tap, impact } = useHaptics();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Slide-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    // Focus input when modal opens
    setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleClose = () => {
    tap();
    // Start slide-out animation
    setIsVisible(false);
    // Wait for animation to complete before unmounting
    setTimeout(onClose, 300);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    impact(); // Strong haptic feedback

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate TI-Guy typing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get and add TI-Guy's response
    const tiGuyResponse = getTiGuyResponse(userMessage.text);
    setMessages((prev) => [...prev, tiGuyResponse]);
    setIsTyping(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-end z-50 backdrop-blur-sm">
      {/* Modal Container with Slide Animation */}
      <div
        className={cn(
          'w-full max-w-sm h-full bg-black leather-overlay text-white flex flex-col shadow-2xl shadow-gold-500/20',
          'transform transition-transform duration-300 ease-out',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-gold-500/50 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center border-2 border-gold-700 glow-gold relative">
              <span className="text-xl">🦫</span>
              {/* Embossed effect ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-neutral-700"
                style={{ transform: 'scale(1.1)' }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gold-500 tracking-wider embossed">
                Chat avec TI-GUY
              </h2>
              <p className="text-xs text-stone-400">Ton assistant québécois</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gold-500 hover:text-white transition-colors rounded-full hover:bg-gold-500/20"
            aria-label="Fermer"
          >
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        {/* Chat Conversation Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3 flex flex-col bg-black/30">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center border border-gold-700">
                <span className="text-lg">🦫</span>
              </div>
              <div className="bg-neutral-800 p-3 rounded-2xl border border-neutral-700">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-gold-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gold-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gold-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t-2 border-gold-500/50 bg-neutral-900/50 flex gap-2"
        >
          <GoldInput
            ref={inputRef}
            type="text"
            placeholder="Écris ton message, mon loup..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow rounded-full"
            size="md"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-gold-500 text-black p-3 rounded-full hover:bg-gold-400 transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
            aria-label="Envoyer"
          >
            <IoSend className="text-xl" />
          </button>
        </form>

        {/* Quebec Pride Footer */}
        <div className="px-4 py-2 bg-neutral-950 border-t border-gold-700/20">
          <p className="text-center text-stone-500 text-xs embossed flex items-center justify-center gap-1">
            <span className="text-gold-500">⚜️</span>
            <span>Propulsé par l'IA québécoise</span>
            <span className="text-gold-500">🦫</span>
          </p>
        </div>
      </div>
    </div>
  );
};

