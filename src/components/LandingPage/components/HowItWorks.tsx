import { Target, Bot, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Target className="w-12 h-12 text-blue-600" />,
              title: 'Tell Us Your Goals',
              description: 'Take a comprehensive assessment to help us understand your aspirations and current skill level.',
            },
            {
              icon: <Bot className="w-12 h-12 text-blue-600" />,
              title: 'Get Your AI-Powered Plan',
              description: 'Receive a customized learning path tailored to your specific needs and learning style.',
            },
            {
              icon: <TrendingUp className="w-12 h-12 text-blue-600" />,
              title: 'Learn, Adapt, Succeed',
              description: 'Progress through your journey with real-time adjustments and AI mentor support.',
            },
          ].map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-6">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}