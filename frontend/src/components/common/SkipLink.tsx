import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;