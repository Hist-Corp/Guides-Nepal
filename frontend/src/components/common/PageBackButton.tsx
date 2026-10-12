import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGoBack } from '../../utils/backNavigation';
import { cn } from '../../utils/cn';

interface PageBackButtonProps {
  /** Extra classes for the wrapper (e.g. a narrower container). */
  className?: string;
}

/**
 * Back button for standalone pages such as the footer destinations and static
 * content pages. It uses the shared navigation trail, so it returns to the
 * page the user came from instead of blindly rewinding browser history.
 */
export const PageBackButton: React.FC<PageBackButtonProps> = ({ className }) => {
  const goBack = useGoBack();
  return (
    <div className={cn('container mx-auto px-4 pt-6', className)}>
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448]"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
    </div>
  );
};

export default PageBackButton;
