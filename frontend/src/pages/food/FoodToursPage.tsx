import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FoodToursPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <button
      onClick={goBack}
      className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full"
    >
      <ArrowLeft className="w-5 h-5" />
      Back
    </button>
  );
};
