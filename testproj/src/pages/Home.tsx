import { useState } from 'react';
import { ChevronLeft, ChevronRight, Zap, Layers, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const slides = [
    {
      title: 'Welcome to InteractUI',
      description: 'Experience the most interactive UI components',
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
    {
      title: 'Beautiful Animations',
      description: 'Smooth transitions and delightful interactions',
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
    },
    {
      title: 'Modern Design',
      description: 'Clean and professional aesthetics',
      bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
    },
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimized performance for smooth interactions',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: 'Modular Design',
      description: 'Reusable components for rapid development',
      color: 'from-blue-400 to-blue-600',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Beautiful UI',
      description: 'Carefully crafted interfaces that users love',
      color: 'from-pink-400 to-red-500',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="space-y-16">
      <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 ${slide.bg} transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center animate-fadeIn">
                <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            style={{
              transform: hoveredCard === index ? 'translateY(-8px) scale(1.02)' : '',
            }}
          >
            <div className={`inline-block p-4 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-4 ${
              hoveredCard === index ? 'animate-bounce' : ''
            }`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>

            {hoveredCard === index && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl animate-fadeIn pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-12 text-white text-center shadow-xl">
        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8 opacity-90">Explore all our interactive components and features</p>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto group">
          Explore Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:scale-105 transition-transform cursor-pointer flex items-center justify-center text-2xl font-bold"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
