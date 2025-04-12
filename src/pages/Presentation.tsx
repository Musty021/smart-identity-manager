
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PresentationSlides from '@/components/presentation/PresentationSlides';

const Presentation = () => {
  const navigate = useNavigate();
  
  const handleExitPresentation = () => {
    navigate('/');
  };

  return (
    <div className="presentation-page">
      <PresentationSlides onExit={handleExitPresentation} />
    </div>
  );
};

export default Presentation;
