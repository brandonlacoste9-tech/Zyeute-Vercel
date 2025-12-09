'use client';

/**
 * 🔥⚜️ ZYEUTÉ PLAYGROUND - "Fur Trader walks into Louis Vuitton" ⚜️🔥
 *
 * Design: Dark Espresso leather with gold stitching
 * AI Stack: DeepSeek V3 + Flux.1 Schnell
 * Aesthetic: Canadian luxury heritage meets high fashion
 */

import { useState } from 'react';
import { generateCaption, chatWithTiGuy } from '@/services/tiGuyService';
import { generateImage } from '@/services/imageGenService';

export default function PlaygroundPage() {
  // Le Concierge (Ti-Guy Chat) state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);

  // L'Atelier (Flux Image) state
  const [imagePrompt] = useState(
    'A close-up of a beaver fur coat with gold stitching, hyper-realistic, 8k, luxury fashion photography'
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Le Concierge - Chat with Ti-Guy
  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await chatWithTiGuy(chatInput, chatMessages);
      const assistantMessage = { role: 'assistant' as const, content: response };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Désolé, Ti-Guy a un problème. Réessaie! 😅",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // L'Atelier - Generate Image with Flux
  const handleGenerateImage = async () => {
    setImageLoading(true);
    setGeneratedImage(null);

    try {
      const result = await generateImage({
        prompt: imagePrompt,
        style: 'luxury',
        aspectRatio: 'square',
        enhancePrompt: true,
      });

      if (result) {
        setGeneratedImage(result.url);
      } else {
        alert('Impossible de générer l\'image. Vérifie ton API key Fal.ai!');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('Erreur: ' + error);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="min-h-screen espresso-background">
      {/* Header: Luxury Branding */}
      <header className="border-b border-gold-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="luxury-title text-4xl md:text-5xl mb-2">
                LE SALON PRIVÉ
              </h1>
              <p className="text-gold-400/80 text-sm tracking-wider uppercase font-light">
                Atelier de création • Powered by DeepSeek V3 & Flux.1
              </p>
            </div>
            <div className="hidden md:block">
              <div className="gold-beaver-coin">
                ⚜️
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Two Zones */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* ZONE 1: LE CONCIERGE (Ti-Guy Chat) */}
          <section className="stitched-leather-card p-6 md:p-8">
            <div className="mb-6">
              <h2 className="luxury-subtitle text-2xl md:text-3xl mb-2">
                LE CONCIERGE
              </h2>
              <p className="text-gold-300/70 text-sm">
                Jasette avec Ti-Guy en Joual authentique
              </p>
            </div>

            {/* Chat Messages */}
            <div className="chat-container mb-4 h-64 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gold-400/50 py-12">
                  <p className="text-lg">Salut! Comment Ti-Guy peut t'aider?</p>
                  <p className="text-sm mt-2">Pose-moi des questions sur le Québec! ⚜️</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`${
                        msg.role === 'user'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block max-w-[80%] p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-gold-900/30 text-gold-100'
                            : 'bg-leather-800/50 text-gold-200'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1 text-gold-400">
                          {msg.role === 'user' ? 'Toi' : 'Ti-Guy'}
                        </p>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Jase avec Ti-Guy..."
                disabled={chatLoading}
                className="leather-input flex-1"
              />
              <button
                onClick={handleChat}
                disabled={chatLoading || !chatInput.trim()}
                className="luxury-button"
              >
                {chatLoading ? '...' : 'JASER'}
              </button>
            </div>
          </section>

          {/* ZONE 2: L'ATELIER (Flux Image Generation) */}
          <section className="stitched-leather-card p-6 md:p-8">
            <div className="mb-6">
              <h2 className="luxury-subtitle text-2xl md:text-3xl mb-2">
                L'ATELIER
              </h2>
              <p className="text-gold-300/70 text-sm">
                Génération d'images avec Flux.1 Schnell
              </p>
            </div>

            {/* Image Display Area */}
            <div className="image-frame mb-6">
              {imageLoading ? (
                <div className="aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="loading-spinner mb-4"></div>
                    <p className="text-gold-400 text-sm">
                      Flux génère ton image...
                    </p>
                    <p className="text-gold-500/50 text-xs mt-2">~6 secondes</p>
                  </div>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated by Flux.1"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="aspect-square flex items-center justify-center text-center p-8">
                  <div>
                    <p className="text-gold-400/70 text-lg mb-2">
                      Ton chef-d'œuvre apparaîtra ici
                    </p>
                    <p className="text-gold-500/50 text-sm">
                      Clique "CRÉER L'IMAGE" pour commencer
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Display */}
            <div className="mb-4 p-4 bg-leather-900/30 rounded-lg border border-gold-800/20">
              <p className="text-xs text-gold-400/60 mb-1 uppercase tracking-wider">
                Prompt:
              </p>
              <p className="text-sm text-gold-300/90 leading-relaxed">
                {imagePrompt}
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateImage}
              disabled={imageLoading}
              className="luxury-button w-full"
            >
              {imageLoading ? 'CRÉATION EN COURS...' : "CRÉER L'IMAGE"}
            </button>
          </section>
        </div>

        {/* Footer: Cost Info */}
        <footer className="mt-12 text-center">
          <div className="inline-block stitched-leather-card px-6 py-4">
            <p className="text-gold-400/70 text-sm">
              💰 Coût estimé: <span className="text-gold-300">$0.003</span> par
              génération •{' '}
              <span className="text-gold-300">98%</span> moins cher que DALL-E 3
            </p>
          </div>
        </footer>
      </main>

      {/* Global Styles for Playground */}
      <style jsx>{`
        /* === ESPRESSO BACKGROUND WITH NOISE === */
        .espresso-background {
          background-color: #1a0f0a;
          background-image:
            /* Leather grain noise */
            url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E"),
            /* Subtle gold ambient glow */
            radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.03) 0%, transparent 70%);
        }

        /* === STITCHED LEATHER CARD === */
        .stitched-leather-card {
          background: linear-gradient(135deg, #2a1f1a 0%, #1f1512 100%);
          border: 2px dashed #f3e5ab;
          border-radius: 1.5rem;
          box-shadow:
            0 10px 40px rgba(0, 0, 0, 0.8),
            inset 0 1px 0 rgba(255, 191, 0, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.7);
          position: relative;
        }

        .stitched-leather-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1.5rem;
          padding: 2px;
          background: linear-gradient(135deg, #d4af37, #8b6914);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.3;
          pointer-events: none;
        }

        /* === LUXURY TYPOGRAPHY === */
        .luxury-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          letter-spacing: 0.05em;
          background: linear-gradient(180deg, #d4af37 0%, #8b6914 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 20px rgba(212, 175, 55, 0.3);
        }

        .luxury-subtitle {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 600;
          letter-spacing: 0.08em;
          background: linear-gradient(180deg, #d4af37 0%, #c4a037 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* === GOLD BEAVER COIN === */
        .gold-beaver-coin {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d4af37 0%, #8b6914 100%);
          border: 3px solid #f3e5ab;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          box-shadow:
            0 4px 20px rgba(212, 175, 55, 0.4),
            inset 0 2px 10px rgba(255, 255, 255, 0.2);
        }

        /* === LEATHER INPUT === */
        .leather-input {
          background: linear-gradient(135deg, #1a1310 0%, #0f0b08 100%);
          border: 1px solid #8b6914;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: #d4af37;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .leather-input:focus {
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .leather-input::placeholder {
          color: rgba(212, 175, 55, 0.4);
        }

        .leather-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* === LUXURY BUTTON === */
        .luxury-button {
          background: linear-gradient(135deg, #d4af37 0%, #8b6914 100%);
          border: 2px solid #f3e5ab;
          border-radius: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: #1a0f0a;
          font-weight: 700;
          font-size: 0.875rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow:
            0 4px 15px rgba(212, 175, 55, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .luxury-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 6px 20px rgba(212, 175, 55, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .luxury-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .luxury-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* === IMAGE FRAME === */
        .image-frame {
          background: linear-gradient(135deg, #0f0b08 0%, #1a1310 100%);
          border: 2px dashed #8b6914;
          border-radius: 1rem;
          padding: 1rem;
          min-height: 300px;
        }

        /* === CHAT CONTAINER === */
        .chat-container {
          scrollbar-width: thin;
          scrollbar-color: #8b6914 #1a0f0a;
        }

        .chat-container::-webkit-scrollbar {
          width: 6px;
        }

        .chat-container::-webkit-scrollbar-track {
          background: #1a0f0a;
          border-radius: 3px;
        }

        .chat-container::-webkit-scrollbar-thumb {
          background: #8b6914;
          border-radius: 3px;
        }

        /* === LOADING SPINNER === */
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(212, 175, 55, 0.2);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .luxury-title {
            font-size: 2rem;
          }

          .luxury-subtitle {
            font-size: 1.5rem;
          }

          .gold-beaver-coin {
            width: 48px;
            height: 48px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
