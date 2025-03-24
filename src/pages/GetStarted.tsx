
import React from 'react';
import FadeIn from '@/components/animations/FadeIn';
import WelcomeView from '@/components/student-biometrics/WelcomeView';

const GetStarted = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fud-navy mb-2">Get Started</h1>
          <p className="text-gray-600">
            Choose a feature to explore our identity management system
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <WelcomeView />
      </FadeIn>
    </div>
  );
};

export default GetStarted;
