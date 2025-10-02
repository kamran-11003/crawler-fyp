import { useState, useEffect } from 'react';
import { Play, Pause, RotateCw, Loader, Power } from 'lucide-react';

interface DemoProps {
  showModal: (title: string, message: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function Demo({ showModal, showToast }: DemoProps) {
  const [toggleState, setToggleState] = useState(false);
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState(false);
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerRunning(false);
      showToast('Countdown finished!', 'success');
    }
    return () => clearInterval(interval);
  }, [timerRunning, countdown, showToast]);

  const handleDoubleClick = () => {
    setDoubleClickCount(prev => prev + 1);
    showToast('Double-clicked!', 'info');
  };

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Loading complete!', 'success');
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setDroppedFile(files[0].name);
      showToast(`Dropped: ${files[0].name}`, 'success');
    }
  };

  const flipCard = (index: number) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Interactive Demo Playground
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Test all interactive elements in one place
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Button Interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => showToast('Standard button clicked!', 'info')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Standard Button
          </button>

          <button
            onClick={() => showModal('Alert', 'This is a button that triggers hidden content!')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Trigger Modal
          </button>

          <button
            onDoubleClick={handleDoubleClick}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Double-Click Me ({doubleClickCount})
          </button>

          <button
            onClick={handleLoadingClick}
            disabled={loading}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Click to Load'
            )}
          </button>

          <button
            onClick={() => setToggleState(!toggleState)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              toggleState
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <Power className="w-5 h-5" />
            {toggleState ? 'ON' : 'OFF'}
          </button>

          <button className="relative group bg-gradient-to-r from-pink-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold overflow-hidden">
            <span className="relative z-10">Ripple Effect</span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Hover Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-48 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              Hover Me
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-lg">Hidden Content!</span>
            </div>
          </div>

          <div
            onMouseEnter={() => setHoveredImage(true)}
            onMouseLeave={() => setHoveredImage(false)}
            className="bg-gradient-to-br from-green-400 to-green-600 h-48 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all transform hover:scale-105 cursor-pointer"
            style={{
              backgroundImage: hoveredImage
                ? 'linear-gradient(to bottom right, #f59e0b, #ef4444)'
                : '',
            }}
          >
            {hoveredImage ? 'Changed!' : 'Image Change'}
          </div>

          <div className="relative group">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 h-48 rounded-lg flex items-center justify-center text-white font-bold text-xl cursor-help">
              ?
            </div>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              This is a tooltip!
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Flip Cards</h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((index) => (
              <div
                key={index}
                onClick={() => flipCard(index)}
                className="relative h-40 cursor-pointer perspective-1000"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    flippedCards[index] ? 'rotate-y-180' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold backface-hidden">
                    Front {index}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold backface-hidden rotate-y-180">
                    Back {index}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Countdown Timer</h2>
          <div className="text-center">
            <div className="text-6xl font-bold mb-6 text-blue-600 dark:text-blue-400">
              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setCountdown(60);
                  setTimerRunning(false);
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RotateCw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Drag & Drop Area</h2>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
            dragOver
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <div className="text-6xl mb-4">📁</div>
          <p className="text-xl font-semibold mb-2 dark:text-white">
            {dragOver ? 'Drop here!' : 'Drag & drop files here'}
          </p>
          {droppedFile && (
            <p className="text-green-600 dark:text-green-400 mt-4">
              Last dropped: {droppedFile}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Animated Elements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-600 h-24 rounded-lg animate-pulse flex items-center justify-center text-white font-bold">
            Pulse
          </div>
          <div className="bg-green-600 h-24 rounded-lg animate-bounce flex items-center justify-center text-white font-bold">
            Bounce
          </div>
          <div className="bg-purple-600 h-24 rounded-lg hover:rotate-12 transition-transform flex items-center justify-center text-white font-bold cursor-pointer">
            Rotate
          </div>
          <div className="bg-orange-600 h-24 rounded-lg hover:skew-x-12 transition-transform flex items-center justify-center text-white font-bold cursor-pointer">
            Skew
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Try More Interactions!</h2>
        <p className="text-lg mb-6 opacity-90">
          Press ESC to close modals, use keyboard navigation, and explore context menus by right-clicking
        </p>
        <button
          onClick={() => showModal('Demo Complete', 'You\'ve explored all the interactive elements!')}
          className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
        >
          Show Summary
        </button>
      </div>
    </div>
  );
}
