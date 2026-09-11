import { useEffect, useState, useCallback } from 'react';

interface EditableSection {
  id: string;
  element: HTMLElement;
  rect: DOMRect;
  label: string;
}

export function CmsEditOverlay({ onSectionClick, onImageClick }: {
  onSectionClick: (sectionId: string, element: HTMLElement) => void;
  onImageClick: (src: string, alt: string, sectionId?: string) => void;
}) {
  const [sections, setSections] = useState<EditableSection[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Find all editable sections
  const scanSections = useCallback(() => {
    const elements = document.querySelectorAll('[data-cms-id]');
    const found: EditableSection[] = [];
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        found.push({
          id: el.getAttribute('data-cms-id') || '',
          element: el as HTMLElement,
          rect,
          label: el.getAttribute('data-cms-label') || el.getAttribute('data-cms-id') || '',
        });
      }
    });
    setSections(found);
  }, []);

  useEffect(() => {
    scanSections();
    const interval = setInterval(scanSections, 1000);
    window.addEventListener('resize', scanSections);
    window.addEventListener('scroll', scanSections);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', scanSections);
      window.removeEventListener('scroll', scanSections);
    };
  }, [scanSections]);

  const handleSectionClick = (section: EditableSection) => {
    onSectionClick(section.id, section.element);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {sections.map(section => (
        <div
          key={section.id}
          className="absolute pointer-events-auto"
          style={{
            top: section.rect.top + window.scrollY,
            left: section.rect.left + window.scrollX,
            width: section.rect.width,
            height: section.rect.height,
          }}
        >
          {/* Highlight border */}
          <div
            className={`absolute inset-0 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
              hoveredId === section.id
                ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                : 'border-blue-400/50 hover:border-blue-500 hover:bg-blue-500/5'
            }`}
            onMouseEnter={() => setHoveredId(section.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleSectionClick(section)}
          >
            {/* Label */}
            <div className={`absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium rounded-t-md transition-all ${
              hoveredId === section.id
                ? 'bg-blue-500 text-white'
                : 'bg-blue-400/70 text-white'
            }`}>
              ✏️ {section.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
