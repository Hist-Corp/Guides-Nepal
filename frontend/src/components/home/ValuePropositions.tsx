import React from 'react';
import {
  UserCheck,
  SlidersHorizontal,
  MessagesSquare,
  HandHeart,
  Wallet,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useCmsSection } from '../../hooks/useCms';

const usps = [
  {
    icon: UserCheck,
    title: 'Private & Personal',
    subtitle: 'Your tour is just for you. No strangers, no groups.',
    description:
      "You'll experience the city one-on-one (or with your own travel group) in a relaxed, personal way. No rushing, no scripted group tours.",
  },
  {
    icon: SlidersHorizontal,
    title: 'Tailored to your wishes',
    subtitle: 'From highlights to hidden gems, your host adjusts everything to fit you.',
    description:
      'Want to skip a museum, add a food stop, or focus on street art? Just ask. Every experience is shaped around your pace, preferences and interests.',
  },
  {
    icon: MessagesSquare,
    title: 'Chat before you book',
    subtitle: 'Message your host directly to customize your experience.',
    description:
      'Ask questions, get local tips, or make special requests. Our hosts are real people, ready to make your day unforgettable.',
  },
  {
    icon: HandHeart,
    title: 'Travel that supports locals',
    subtitle: 'Every booking supports independent locals and their communities.',
    description:
      'We believe tourism should benefit the people who live there. Your host earns directly and often invests it right back into their neighborhood.',
  },
  {
    icon: Wallet,
    title: 'Feel good about where your money goes',
    subtitle: "You're choosing meaningful travel, not mass tourism.",
    description:
      'Guides Nepal is built on fair pay, human connections and travel that leaves a positive mark for both you and the places you visit.',
  },
  {
    icon: Award,
    title: 'Trusted by millions',
    subtitle: 'Loved by over 1,000,000 travelers all around the world.',
    description:
      'Guides Nepal hosts consistently earn 5-star reviews for their kindness, knowledge and the personal stories they share.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & flexible booking',
    subtitle: 'Book with peace of mind: safe payments and easy changes.',
    description:
      "Your plans can shift and that's okay. We offer flexible cancellation and real support when you need it.",
  },
];

export const ValuePropositions: React.FC = () => {
  const cms = useCmsSection('home', 'home-values');
  const heading = cms?.content?.heading || 'Why is Guides Nepal the best place to book a tour?';

  return (
    <section
      data-cms-id="home-values"
      data-cms-label="Why us"
      className="py-16 bg-white text-center"
    >
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#d12b79]">
          Real People. Real Stories. Really Good Travel.
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold leading-[1.2] mb-8 text-[#8b174e]">
          {heading.split('the best place').length > 1 ? (
            <>
              {heading.split('the best place')[0]}
              <mark className="bg-transparent text-[#d12b79]">the best place</mark>
              {heading.split('the best place')[1]}
            </>
          ) : (
            heading
          )}
        </h2>

        <ul className="flex flex-wrap items-stretch justify-center gap-5 mx-auto max-w-full">
          {usps.map((usp, index) => (
            <li
              key={index}
              className="w-full sm:w-[calc(50%-0.625rem)] md:w-[calc(33.333%-0.8333rem)] min-w-[288px] max-w-[340px] md:max-w-[calc(33.333%-0.8333rem)] bg-white rounded-2xl shadow-[0_1px_1px_0_rgba(0,0,0,0.05),0_2px_2px_0_rgba(0,0,0,0.05),0_4px_4px_0_rgba(0,0,0,0.05)] px-5 pt-6 pb-10 flex flex-col items-center"
            >
              <usp.icon className="w-12 h-12 text-[#8b174e] mb-4" strokeWidth={1.5} />
              <h3 className="text-base font-semibold leading-[1.2] mb-2 text-[#8b174e] max-w-[256px]">
                {usp.title}
              </h3>
              <div className="text-sm leading-[1.3] text-slate-700 max-w-[256px]">
                <p className="mb-4">{usp.subtitle}</p>
                <p>{usp.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ValuePropositions;
