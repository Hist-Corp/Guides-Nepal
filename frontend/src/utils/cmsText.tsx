import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Renders CMS-provided copy without losing the styling of the hardcoded design:
 * newlines become line breaks, known phrases keep their brand-yellow accent and
 * category names stay links. When the dashboard text matches the original copy
 * the markup is identical to the design version.
 */

/** Splits text on newlines and renders each line separated by <br/>. */
export function withLineBreaks(text?: string, breakClassName?: string): React.ReactNode {
  if (!text) return null;
  return text.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && (breakClassName ? <br className={breakClassName} /> : <br />)}
      {line}
    </React.Fragment>
  ));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights every occurrence of the given phrases (case-insensitive) with the
 * brand accent colour, preserving line breaks.
 */
export function accentText(
  text?: string,
  accents: string[] = [],
  accentClassName = 'text-brand-yellow'
): React.ReactNode {
  if (!text) return null;
  const phrases = accents.filter(Boolean);
  if (phrases.length === 0) return withLineBreaks(text);

  const re = new RegExp(`(${phrases.map(escapeRegExp).join('|')})`, 'gi');
  const isAccent = (chunk: string) =>
    phrases.some((p) => p.toLowerCase() === chunk.trim().toLowerCase());

  const nodes: React.ReactNode[] = [];
  text.split('\n').forEach((line, lineIndex) => {
    if (lineIndex > 0) nodes.push(<br key={`br-${lineIndex}`} />);
    line.split(re).forEach((chunk, chunkIndex) => {
      if (!chunk) return;
      const key = `${lineIndex}-${chunkIndex}`;
      nodes.push(
        isAccent(chunk) ? (
          <span key={key} className={accentClassName}>
            {chunk}
          </span>
        ) : (
          <React.Fragment key={key}>{chunk}</React.Fragment>
        )
      );
    });
  });
  return nodes;
}

const CATEGORY_LINKS: { text: string; to: string }[] = [
  { text: 'Most Popular', to: '/most-popular' },
  { text: 'Most Delicious', to: '/most-delicious' },
  { text: 'Real-Good Travel', to: '/real-good-travel' },
  { text: 'Food Tours', to: '/food-tours' },
  { text: 'Cultural Tours', to: '/cultural-tours' },
  { text: 'Outdoor Activities', to: '/outdoor-activities' },
  { text: 'Cooking Classes', to: '/cooking-classes' },
];

/** Turns category names inside CMS copy back into the links used by the design. */
export function linkifyCategories(text?: string): React.ReactNode {
  if (!text) return null;
  const nodes: React.ReactNode[] = [];
  let buffer = '';

  const flush = (key: string) => {
    if (buffer) {
      nodes.push(<React.Fragment key={`t-${key}`}>{buffer}</React.Fragment>);
      buffer = '';
    }
  };

  let i = 0;
  while (i < text.length) {
    const match = CATEGORY_LINKS.find((entry) =>
      text.toLowerCase().startsWith(entry.text.toLowerCase(), i)
    );
    if (match) {
      flush(String(i));
      nodes.push(
        <Link key={`l-${i}`} to={match.to}>
          {text.slice(i, i + match.text.length)}
        </Link>
      );
      i += match.text.length;
    } else {
      buffer += text[i];
      i += 1;
    }
  }
  flush('end');
  return nodes;
}

/**
 * Section background from the dashboard style editor, falling back to the
 * design's own colour so untouched sections render exactly as before.
 */
export function cmsBackground(
  style?: Record<string, any>,
  fallback?: string
): React.CSSProperties | undefined {
  const bg = style?.backgroundColor;
  const value = bg && bg !== 'transparent' ? bg : fallback;
  return value ? { backgroundColor: value } : undefined;
}
