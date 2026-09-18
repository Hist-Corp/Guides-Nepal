import React from 'react';
import { cn } from '../../utils/cn';
import { useInView } from '../../hooks/useInView';

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'pop' | 'fade';

/** Variant → Tailwind animation utility (keyframes live in tailwind.config.js). */
const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: 'animate-fade-in-up',
  down: 'animate-fade-in-down',
  left: 'animate-fade-in-left',
  right: 'animate-fade-in-right',
  zoom: 'animate-zoom-in',
  pop: 'animate-pop-in',
  fade: 'animate-fade-in',
};

export type RevealTag = 'div' | 'section' | 'article' | 'span' | 'li';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Direction/style of the entrance animation. */
  variant?: RevealVariant;
  /** Stagger in milliseconds, applied as `animation-delay`. */
  delay?: number;
  /** Element to render — use `li` to keep list semantics when wrapping items. */
  as?: RevealTag;
  /** Animate once (default) or replay every time the element re-enters view. */
  once?: boolean;
  /** Override the default IntersectionObserver threshold (0.15). */
  threshold?: number;
  children: React.ReactNode;
}

/**
 * Wraps content so it animates in when it enters the viewport.
 *
 * Content is kept visually hidden (`opacity-0`) until it is in view, then the
 * Tailwind entrance animation runs — with the `both` fill mode used by the
 * config's animations, `delay` keeps an element invisible until its turn, so
 * staggered lists never flash.
 *
 * Accessibility/robustness: `useInView` reveals immediately for
 * `prefers-reduced-motion` users and force-reveals after 2.5s, so content can
 * never be stuck hidden.
 *
 * Usage:
 *   <Reveal delay={index * 100}>…card…</Reveal>
 *   <Reveal as="li" variant="left" delay={80}>…row…</Reveal>
 */
export const Reveal: React.FC<RevealProps> = ({
  variant = 'up',
  delay = 0,
  as = 'div',
  once = true,
  threshold,
  className,
  style,
  children,
  ...rest
}) => {
  const { ref, inView } = useInView<HTMLElement>({
    once,
    ...(threshold === undefined ? {} : { threshold }),
  });

  // A string tag (div/li/…) at runtime; typed as a component so the ref is
  // accepted without narrowing each intrinsic element's own attribute types.
  const Tag = as as unknown as React.ComponentType<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;

  return (
    <Tag
      ref={ref}
      className={cn(inView ? VARIANT_CLASS[variant] : 'opacity-0', className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
