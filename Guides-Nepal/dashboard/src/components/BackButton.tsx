import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

export default function BackButton({ label = 'Back', to }: { label?: string; to?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      icon={<ArrowLeft size={14} />}
    >
      {label}
    </Button>
  );
}
