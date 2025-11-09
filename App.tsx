
import React, { useState, useEffect, useCallback } from 'react';
import { generateImage } from './services/geminiService';
import { STYLE_PRESETS, ASPECT_RATIOS } from './constants';
import type { ImageHistoryItem } from './types';
import { Spinner } from './components/Spinner';
import { DownloadIcon, SparklesIcon, XCircleIcon } from './components/Icons';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<string>(STYLE_PRESETS[0].value);
  const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('imageGenerationHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem('imageGenerationHistory');
    }
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const fullPrompt = `${prompt.trim()}, ${style}`;

    try {
      const imageBase64 = await generateImage(fullPrompt, aspectRatio);
      const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
      setGeneratedImage(imageUrl);

      const newHistoryItem: ImageHistoryItem = {
        id: new Date().toISOString(),
        prompt: prompt,
        style: style,
        aspectRatio: aspectRatio,
        imageUrl: imageUrl,
      };

      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 3);
        localStorage.setItem('imageGenerationHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, style, aspectRatio, isLoading]);

  const handleHistoryClick = (item: ImageHistoryItem) => {
    setGeneratedImage(item.imageUrl);
    setPrompt(item.prompt);
    setStyle(item.style);
    setAspectRatio(item.aspectRatio);
  };

  const getAspectRatioClass = (ratio: string): string => {
    switch (ratio) {
      case '16:9': return 'aspect-[16/9]';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      case '1:1':
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-fuchsia-500">
            Imagen AI
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Controls Panel */}
          <aside className="lg:w-1/3 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-primary-300">1. Describe your image</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A hyper-detailed 8K photograph of a futuristic city at sunset"
                className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder-gray-500"
              />
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
              <h2 className="text-xl font-semibold text-primary-300">2. Configure style</h2>
              <div>
                <label htmlFor="style-preset" className="block text-sm font-medium mb-2 text-gray-400">Style Preset</label>
                <select
                  id="style-preset"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  {STYLE_PRESETS.map(preset => (
                    <option key={preset.value} value={preset.value}>{preset.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Aspect Ratio</label>
                <div className="grid grid-cols-5 gap-2">
                  {ASPECT_RATIOS.map(ratio => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`py-2 px-1 text-xs rounded-lg border-2 transition-colors ${
                        aspectRatio === ratio.value
                          ? 'bg-primary-600 border-primary-500 text-white'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-3 text-lg font-bold bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-500 hover:to-fuchsia-500 text-white py-4 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-6 h-6"/>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6"/>
                  Generate Image
                </>
              )}
            </button>
          </aside>

          {/* Image Display Area */}
          <section className="lg:w-2/3">
            <div className={`w-full max-w-full mx-auto bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center transition-all ${getAspectRatioClass(aspectRatio)}`}>
              {isLoading && <Spinner className="w-16 h-16 text-primary-500" />}
              {error && (
                <div className="p-8 text-center text-red-400">
                  <XCircleIcon className="w-16 h-16 mx-auto mb-4" />
                  <p className="font-semibold">Generation Failed</p>
                  <p className="text-sm text-gray-400 mt-2">{error}</p>
                </div>
              )}
              {!isLoading && !error && generatedImage && (
                <img src={generatedImage} alt={prompt} className="rounded-lg object-contain w-full h-full" />
              )}
              {!isLoading && !error && !generatedImage && (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg font-medium">Your generated image will appear here.</p>
                  <p className="text-sm">Enter a prompt and click "Generate Image" to start.</p>
                </div>
              )}
            </div>
            {generatedImage && !isLoading && (
              <a
                href={generatedImage}
                download={`imagen-ai-${Date.now()}.jpeg`}
                className="mt-4 w-full flex items-center justify-center gap-2 text-md font-semibold bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                <DownloadIcon className="w-5 h-5" />
                Download High-Res Image
              </a>
            )}
          </section>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Generation History</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map(item => (
                <div key={item.id} className="group relative cursor-pointer overflow-hidden rounded-lg" onClick={() => handleHistoryClick(item)}>
                  <img src={item.imageUrl} alt={item.prompt} className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${getAspectRatioClass(item.aspectRatio)}`} />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm line-clamp-2">{item.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
