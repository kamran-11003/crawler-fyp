import { useState } from 'react';
import { ChevronDown, HelpCircle, Users, Target, Award } from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(0);
  const [readMore, setReadMore] = useState<{ [key: number]: boolean }>({});

  const tabs = [
    { title: 'Our Story', icon: <Users className="w-5 h-5" /> },
    { title: 'Mission', icon: <Target className="w-5 h-5" /> },
    { title: 'Achievements', icon: <Award className="w-5 h-5" /> },
  ];

  const tabContent = [
    {
      title: 'How We Started',
      content: 'Founded in 2020, InteractUI began with a simple mission: make web interactions delightful. Our team of passionate developers and designers came together to create the most comprehensive interactive UI library.',
    },
    {
      title: 'Our Mission',
      content: 'We believe that every interaction matters. Our mission is to empower developers with tools that make building beautiful, interactive interfaces effortless and enjoyable.',
    },
    {
      title: 'What We\'ve Achieved',
      content: 'Over 100,000 developers trust InteractUI. We\'ve powered millions of websites and continue to innovate in the space of interactive design and user experience.',
    },
  ];

  const accordionItems = [
    {
      question: 'What makes InteractUI different?',
      answer: 'InteractUI stands out with its comprehensive collection of interactive components, smooth animations, and focus on accessibility. We prioritize both developer experience and end-user satisfaction.',
    },
    {
      question: 'How do I get started?',
      answer: 'Getting started is easy! Simply explore our demo page, check out the documentation, and start integrating our components into your project. We provide detailed examples and best practices.',
    },
    {
      question: 'Is it customizable?',
      answer: 'Absolutely! Every component is fully customizable with extensive theming options. You can adjust colors, animations, spacing, and behavior to match your brand perfectly.',
    },
    {
      question: 'What technologies do you use?',
      answer: 'We build with modern technologies including React, TypeScript, and Tailwind CSS. Our components are optimized for performance and follow industry best practices.',
    },
  ];

  const toggleReadMore = (index: number) => {
    setReadMore(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          About InteractUI
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Building the future of interactive web experiences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>

        <div className="p-8">
          {tabContent.map((content, index) => (
            <div
              key={index}
              className={`transition-opacity duration-300 ${
                activeTab === index ? 'opacity-100 animate-fadeIn' : 'hidden'
              }`}
            >
              <h2 className="text-3xl font-bold mb-4 dark:text-white">{content.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {content.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 dark:text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {accordionItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedAccordion(expandedAccordion === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-semibold text-left dark:text-white">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    expandedAccordion === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedAccordion === index && (
                <div className="px-6 py-4 bg-white dark:bg-gray-800 animate-slideDown">
                  <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map((item) => (
          <div key={item} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="relative group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute left-20 top-4 bg-gray-900 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Hover for info
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 dark:text-white">Feature Highlight {item}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {readMore[item]
                ? 'This is a detailed description that reveals more information about this particular feature. We provide comprehensive documentation and examples to help you understand every aspect of our platform. Our commitment to quality ensures that you have all the tools you need to succeed.'
                : 'This is a detailed description that reveals more information about this particular feature. We provide comprehensive...'}
            </p>
            <button
              onClick={() => toggleReadMore(item)}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              {readMore[item] ? 'Read Less' : 'Read More'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
