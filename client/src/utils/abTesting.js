import { useState, useEffect } from 'react';

// Utility to manage A/B testing variants dynamically

export const getABVariant = () => {
  const v = localStorage.getItem('abVariant');
  if (v !== 'A' && v !== 'B') {
    localStorage.setItem('abVariant', 'B'); // Default is 'B'
    return 'B';
  }
  return v;
};

export const setABVariant = (variant) => {
  localStorage.setItem('abVariant', variant);
  window.dispatchEvent(new Event('ab-variant-changed'));
};

export function useABVariant() {
  const [variant, setVariant] = useState(getABVariant());

  useEffect(() => {
    const handleChanged = () => {
      setVariant(getABVariant());
    };
    window.addEventListener('ab-variant-changed', handleChanged);
    return () => window.removeEventListener('ab-variant-changed', handleChanged);
  }, []);

  return variant;
}

