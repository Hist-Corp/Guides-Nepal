import React, { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useGuideStore } from '../../store/guideStore';
import { BadgeCheck, Users, Calendar, UsersOff } from 'lucide-react';

type GuideCardProps = {
  guide: {
    guideId: number;
    guideName: string;
    city: string;
    category: string;
    price: number;
    isAvailable: boolean;
    spotsRemaining: number;
    maxGuests: number;
    isBooking: boolean;
  };
  isLocked: boolean;
  onClick: () => void;
};

const GuideCard: React.FC<GuideCardProps> = ({ guide, isLocked, onClick }) => {
  const handleClick = () => {
    if (isLocked || guide.isBooking) return;
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        rounded-xl border p-4 shadow-sm transition-shadow cursor-pointer 
        ${!guide.isAvailable || isLocked ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      title={isLocked ? 'Booked by another traveler' : undefined}
    >
      <div className="flex flex-col items-start">
        <p className="text-xs font-bold uppercase text-gray-500">
          {guide.category} - {guide.city}
        </p>
        <h3 className="mt-1 font-bold text-gray-900">{guide.guideName}</h3>
        <div className="mt-2 text-sm">
          {guide.isAvailable && (
            <span className="text-emerald-600">
              {guide.spotsRemaining}/{guide.maxGuests} spots
            </span>
          )}
          {!guide.isAvailable && (
            <span className="text-gray-400">Full</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideCard;