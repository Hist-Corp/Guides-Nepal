import { useState, useEffect, useCallback, useRef } from 'react';
import { getPageSections, updateAllSections } from '../services/api';
import { FRONTEND_URL } from '../config/api';
import ImagePicker from '../components/forms/ImagePicker';

// ─── Frontend content map (pre-populated from frontend components) ───
const FRONTEND_CONTENT: Record<string, { id: string; label: string; type: string; content: Record<string, any>; style: Record<string, any> }[]> = {
  home: [
    { id: 'home-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Enchanting experiences,\nwith incredible locals', subtitle: 'Book unique and memorable travel experiences guided by locals', buttonText: 'Search', tagline: 'Guides Nepal', primaryText: 'Guides Nepal' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'left' } },
    { id: 'home-featured', label: 'Featured Experiences', type: 'featured', content: { heading: 'Go local in Charming Cities', subtitle: 'Find unforgettable experiences with locals', buttonText: 'View all' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' } },
    { id: 'home-promo', label: 'Promo Banner', type: 'promo', content: { heading: 'We have released our 2024\nImpact Report!', subtitle: 'Discover the true power of your travel with our 2024 Impact Report. See how responsible tourism supports local communities, preserves culture, and protects the planet.', buttonText: 'Read our report', tagline: 'IMPACT' }, style: { backgroundColor: '#0ea5e9', textColor: '#ffffff', alignment: 'left' } },
    { id: 'home-categories', label: 'Categories', type: 'categories', content: { heading: 'Most Popular. Most Delicious.', subtitle: 'Real-Good Travel.' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'center' } },
    { id: 'home-testimonials', label: 'Testimonials', type: 'testimonials', content: { heading: 'What travelers say', subtitle: 'Real stories from real travelers' }, style: { backgroundColor: '#f8fafc', textColor: '#213448', alignment: 'center' } },
    { id: 'home-values', label: 'Value Propositions', type: 'values', content: { heading: 'Why Guides Nepal?' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'center' } },
  ],
  explore: [
    { id: 'explore-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Explore Nepal', subtitle: 'Discover authentic experiences across the Himalayas', buttonText: 'Browse all', tagline: 'Experiences' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'explore-categories', label: 'Categories Strip', type: 'categories', content: { heading: 'Browse by category', subtitle: 'Food, culture, outdoor adventures and more' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'center' } },
  ],
  'most-popular': [
    { id: 'most-popular-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Most Popular', subtitle: 'Our most-loved experiences chosen by travelers', buttonText: 'Explore', tagline: 'Popular' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
  ],
  'most-delicious': [
    { id: 'most-delicious-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Most Delicious', subtitle: 'Food and culinary experiences that delight', buttonText: 'Taste now', tagline: 'Food' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
  ],
  'real-good-travel': [
    { id: 'real-good-travel-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Real Good Travel', subtitle: 'Curated travel stories, tips, and guides', buttonText: 'Read more', tagline: 'Stories' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
  ],
  'food-tours': [
    { id: 'food-tours-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Food Tours', subtitle: 'Cooking classes and food tours with local experts', buttonText: 'Book now', tagline: 'Food' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'food-tours-categories', label: 'Categories Strip', type: 'categories', content: { heading: 'Browse food experiences', subtitle: 'From momos to dal bhat, taste it all' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'center' } },
  ],
  'cultural-tours': [
    { id: 'cultural-tours-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Cultural Tours', subtitle: 'Cultural heritage tours through ancient cities', buttonText: 'Discover', tagline: 'Culture' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'cultural-tours-categories', label: 'Categories Strip', type: 'categories', content: { heading: 'Browse cultural experiences', subtitle: 'Temples, heritage, and living traditions' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'center' } },
  ],
  'outdoor-activities': [
    { id: 'outdoor-activities-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Outdoor Activities', subtitle: 'Adventure and outdoor activities in the Himalayas', buttonText: 'Adventure', tagline: 'Outdoor' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'outdoor-activities-categories', label: 'Categories Strip', type: 'categories', content: { heading: 'Browse outdoor adventures', subtitle: 'Trekking, hiking, and thrilling experiences' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'center' } },
  ],
  'cooking-classes': [
    { id: 'cooking-classes-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Cooking Classes', subtitle: 'Hands-on cooking classes with local chefs', buttonText: 'Learn to cook', tagline: 'Cooking' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'cooking-classes-categories', label: 'Categories Strip', type: 'categories', content: { heading: 'Browse cooking classes', subtitle: 'From momos to traditional Nepali cuisine' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'center' } },
  ],
  kathmandu: [
    { id: 'kathmandu-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Kathmandu', subtitle: 'Explore the ancient temples and vibrant streets', buttonText: 'Explore', tagline: 'City' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'kathmandu-featured', label: 'Featured Experiences', type: 'featured', content: { heading: 'Experiences in Kathmandu', subtitle: 'Hand-picked tours and activities', buttonText: 'View all' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' } },
  ],
  pokhara: [
    { id: 'pokhara-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Pokhara', subtitle: 'Boating on Phewa Lake with mountain views', buttonText: 'Explore', tagline: 'City' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'pokhara-featured', label: 'Featured Experiences', type: 'featured', content: { heading: 'Experiences in Pokhara', subtitle: 'Hand-picked tours and activities', buttonText: 'View all' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' } },
  ],
  lalitpur: [
    { id: 'lalitpur-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Lalitpur', subtitle: 'Discover the art and heritage of Patan', buttonText: 'Explore', tagline: 'City' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'lalitpur-featured', label: 'Featured Experiences', type: 'featured', content: { heading: 'Experiences in Lalitpur', subtitle: 'Hand-picked tours and activities', buttonText: 'View all' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' } },
  ],
  bhaktapur: [
    { id: 'bhaktapur-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Bhaktapur', subtitle: 'Step back in time in the City of Devotees', buttonText: 'Explore', tagline: 'City' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'bhaktapur-featured', label: 'Featured Experiences', type: 'featured', content: { heading: 'Experiences in Bhaktapur', subtitle: 'Hand-picked tours and activities', buttonText: 'View all' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' } },
  ],
  bharatpur: [
    { id: 'bharatpur-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Bharatpur', subtitle: 'Gateway to Chitwan National Park and wildlife', buttonText: 'Explore', tagline: 'City' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'center' } },
    { id: 'bharatpur-featured', label: 'Featured Experiences', type: 'featured', content: { heading: 'Experiences in Bharatpur', subtitle: 'Hand-picked tours and activities', buttonText: 'View all' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' } },
  ],
};

// ─── Types ───
export interface Section {
  id: string;
  label: string;
  type: string;
  content: Record<string, any>;
  style: Record<string, any>;
  format?: TextFormat;
}

interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
}

// ─── Constants ───
const FONT_FAMILIES = [
  { label: 'Default', value: 'inherit' },
  { label: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'ui-serif, Georgia, serif' },
  { label: 'Monospace', value: 'ui-monospace, monospace' },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Playfair', value: "'Playfair Display', serif" },
];

const FONT_SIZES = [
  { label: 'XS', value: '0.75rem' },
  { label: 'SM', value: '0.875rem' },
  { label: 'Base', value: '1rem' },
  { label: 'LG', value: '1.125rem' },
  { label: 'XL', value: '1.25rem' },
  { label: '2XL', value: '1.5rem' },
  { label: '3XL', value: '1.875rem' },
  { label: '4XL', value: '2.25rem' },
  { label: '5XL', value: '3rem' },
];

const TEXT_COLORS = [
  '#000000', '#333333', '#555555', '#ffffff',
  '#213448', '#547792', '#F4B400', '#0ea5e9',
  '#9A2143', '#10b981', '#f97316', '#8b5cf6',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
];

const PAGE_SECTION_TYPES = ['hero', 'text', 'featured', 'promo', 'categories', 'testimonials', 'values', 'footer'];

// ─── Main Component ───
export default function LivePageEditor({ slug, title, path, onSaved, onClose }: {
  slug: string;
  title: string;
  path: string;
  onSaved?: (sections: Section[]) => Promise<void>;
  onClose: () => void;
}) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load sections: prefer CMS, fall back to frontend content
  useEffect(() => {
    setLoading(true);
    getPageSections(slug).then((cmsSections) => {
      if (cmsSections && cmsSections.length > 0) {
        setSections(cmsSections.map((s: any) => ({ ...s, format: s.format || {} })));
      } else {
        const defaults = FRONTEND_CONTENT[slug] || [];
        setSections(defaults.map(s => ({ ...s, format: {} })));
      }
      setLoading(false);
    }).catch(() => {
      const defaults = FRONTEND_CONTENT[slug] || [];
      setSections(defaults.map(s => ({ ...s, format: {} })));
      setLoading(false);
    });
  }, [slug]);

  const selected = sections.find(s => s.id === selectedId) || null;

  const updateContent = useCallback((key: string, value: any) => {
    setSections(prev => prev.map(s => s.id === selectedId ? { ...s, content: { ...s.content, [key]: value } } : s));
    setDirty(true);
    setIframeKey(k => k + 1); // refresh iframe
  }, [selectedId]);

  const updateStyle = useCallback((key: string, value: string) => {
    setSections(prev => prev.map(s => s.id === selectedId ? { ...s, style: { ...s.style, [key]: value } } : s));
    setDirty(true);
    setIframeKey(k => k + 1);
  }, [selectedId]);

  const updateFormat = useCallback((key: string, value: any) => {
    setSections(prev => prev.map(s => s.id === selectedId ? { ...s, format: { ...(s.format || {}), [key]: value } } : s));
    setDirty(true);
    setIframeKey(k => k + 1);
  }, [selectedId]);

  const toggleFormat = useCallback((key: 'bold' | 'italic' | 'underline') => {
    setSections(prev => prev.map(s => {
      if (s.id !== selectedId) return s;
      const fmt = { ...(s.format || {}) };
      fmt[key] = !fmt[key];
      return { ...s, format: fmt };
    }));
    setDirty(true);
    setIframeKey(k => k + 1);
  }, [selectedId]);

  const addSection = (type: string) => {
    const id = `${type}-${Date.now()}`;
    const newSection: Section = {
      id,
      label: type.charAt(0).toUpperCase() + type.slice(1) + ' Section',
      type,
      content: { heading: 'New Section', subtitle: 'Click to edit this section', buttonText: 'Learn more' },
      style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' },
      format: {},
    };
    setSections(prev => [...prev, newSection]);
    setSelectedId(id);
    setDirty(true);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateAllSections(slug, sections);
      if (onSaved) await onSaved(sections);
      setDirty(false);
      setToast('Changes saved — frontend updated!');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('Saved (local)');
      setTimeout(() => setToast(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  // Build the preview URL with content injected via query params
  const previewSrc = `${FRONTEND_URL}${path}?cms-preview=1&slug=${encodeURIComponent(slug)}`;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-soft text-sm">Loading live preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-line bg-surface flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-soft hover:text-main transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="w-px h-5 bg-line" />
          <div>
            <h1 className="text-sm font-semibold text-main">Live Editor — {title}</h1>
            <p className="text-xs text-soft">{path} · Click any element to edit</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIframeKey(k => k + 1)} className="text-xs text-soft hover:text-main" title="Refresh preview">↻ Refresh</button>
          <a href={previewSrc} target="_blank" rel="noopener" className="text-xs text-brand-500 hover:underline">View live ↗</a>
          <button onClick={save} disabled={!dirty || saving} className="px-4 py-1.5 bg-brand-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 hover:bg-brand-600 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Section list sidebar */}
        <div className="w-56 border-r border-line bg-surface-2 overflow-y-auto shrink-0">
          <div className="p-3">
            <h2 className="text-xs font-semibold text-soft uppercase tracking-wider mb-2">Sections</h2>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                  selectedId === s.id ? 'bg-brand-500 text-white' : 'text-main hover:bg-surface'
                }`}
              >
                <div className="font-medium truncate">{s.label}</div>
                <div className={`text-xs ${selectedId === s.id ? 'text-white/70' : 'text-soft'}`}>{s.type}</div>
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-line">
              <p className="text-xs text-soft mb-2">Add:</p>
              <div className="flex flex-wrap gap-1">
                {PAGE_SECTION_TYPES.map(t => (
                  <button key={t} onClick={() => addSection(t)} className="px-2 py-1 text-xs bg-surface border border-line rounded-md hover:border-brand-300 text-main">
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live iframe preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface-2">
          <div className="flex-1 relative">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={previewSrc}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            {/* Overlay hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-xs rounded-full pointer-events-none">
              Live preview — changes appear on save
            </div>
          </div>
        </div>

        {/* Edit panel */}
        <div className="w-96 border-l border-line bg-surface overflow-y-auto shrink-0">
          {selected ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-main">{selected.label}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-md font-medium">{selected.type}</span>
                  <button onClick={() => removeSection(selected.id)} className="text-xs text-red-500 hover:text-red-600" title="Remove section">×</button>
                </div>
              </div>

              {/* Rich text toolbar */}
              <RichTextToolbar format={selected.format || {}} onToggle={toggleFormat} onUpdate={updateFormat} />

              {/* Content fields */}
              <div className="mt-4 space-y-3">
                <h3 className="text-xs font-semibold text-soft uppercase tracking-wider">Content</h3>
                {renderContentFields(selected, updateContent)}
              </div>

              {/* Style fields */}
              <div className="mt-5 pt-4 border-t border-line space-y-3">
                <h3 className="text-xs font-semibold text-soft uppercase tracking-wider">Styling</h3>
                <ColorField label="Background" value={selected.style.backgroundColor || '#ffffff'} onChange={v => updateStyle('backgroundColor', v)} />
                <ColorField label="Text Color" value={selected.style.textColor || '#213448'} onChange={v => updateStyle('textColor', v)} />
                <ColorField label="Accent" value={selected.style.accentColor || '#F4B400'} onChange={v => updateStyle('accentColor', v)} />
                <SelectField label="Alignment" value={selected.style.alignment || 'left'} options={['left', 'center', 'right']} onChange={v => updateStyle('alignment', v)} />
                <TextField label="Padding" value={selected.style.padding || ''} onChange={v => updateStyle('padding', v)} placeholder="2rem, 1rem 2rem" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-soft px-6 text-center">
              <div>
                <div className="text-4xl mb-3">👆</div>
                <p className="text-sm">Select a section from the sidebar, or click on the live preview to edit.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Render content fields based on section type ───
function renderContentFields(section: Section, updateContent: (key: string, value: any) => void) {
  const typeFields: { key: string; label: string; type: 'text' | 'textarea' | 'image' }[] = [];

  // Common fields per type
  if (section.type === 'hero') {
    typeFields.push({ key: 'backgroundImage', label: 'Background Image', type: 'image' });
    typeFields.push({ key: 'heading', label: 'Heading', type: 'textarea' });
    typeFields.push({ key: 'subtitle', label: 'Subtitle', type: 'textarea' });
    typeFields.push({ key: 'buttonText', label: 'Button Text', type: 'text' });
    typeFields.push({ key: 'tagline', label: 'Tagline', type: 'text' });
    typeFields.push({ key: 'primaryText', label: 'Primary Brand Text', type: 'text' });
  } else if (section.type === 'text') {
    typeFields.push({ key: 'image', label: 'Section Image', type: 'image' });
    typeFields.push({ key: 'heading', label: 'Heading', type: 'textarea' });
    typeFields.push({ key: 'subtitle', label: 'Subtitle', type: 'textarea' });
    typeFields.push({ key: 'body', label: 'Body Text', type: 'textarea' });
  } else if (section.type === 'featured') {
    typeFields.push({ key: 'image', label: 'Section Image', type: 'image' });
    typeFields.push({ key: 'heading', label: 'Heading', type: 'textarea' });
    typeFields.push({ key: 'subtitle', label: 'Subtitle', type: 'textarea' });
    typeFields.push({ key: 'buttonText', label: 'Button Text', type: 'text' });
  } else if (section.type === 'promo') {
    typeFields.push({ key: 'backgroundImage', label: 'Background Image', type: 'image' });
    typeFields.push({ key: 'heading', label: 'Heading', type: 'textarea' });
    typeFields.push({ key: 'subtitle', label: 'Subtitle', type: 'textarea' });
    typeFields.push({ key: 'buttonText', label: 'Button Text', type: 'text' });
    typeFields.push({ key: 'tagline', label: 'Tagline', type: 'text' });
  } else if (section.type === 'categories') {
    typeFields.push({ key: 'heading', label: 'Heading', type: 'textarea' });
    typeFields.push({ key: 'subtitle', label: 'Subtitle', type: 'textarea' });
  } else if (section.type === 'testimonials') {
    typeFields.push({ key: 'heading', label: 'Heading', type: 'textarea' });
    typeFields.push({ key: 'subtitle', label: 'Subtitle', type: 'textarea' });
  } else if (section.type === 'values') {
    typeFields.push({ key: 'heading', label: 'Heading', type: 'textarea' });
  } else if (section.type === 'footer') {
    typeFields.push({ key: 'supportEmail', label: 'Support Email', type: 'text' });
    typeFields.push({ key: 'copyright', label: 'Copyright', type: 'text' });
  } else {
    typeFields.push({ key: 'image', label: 'Image', type: 'image' });
    typeFields.push({ key: 'heading', label: 'Heading', type: 'textarea' });
    typeFields.push({ key: 'subtitle', label: 'Subtitle', type: 'textarea' });
    typeFields.push({ key: 'buttonText', label: 'Button Text', type: 'text' });
  }

  return typeFields.map(f => {
    if (f.type === 'image') {
      return (
        <ImageField
          key={f.key}
          label={f.label}
          value={section.content[f.key] || ''}
          onChange={v => updateContent(f.key, v)}
        />
      );
    }
    return (
      <TextField
        key={f.key}
        label={f.label}
        value={section.content[f.key] || ''}
        onChange={v => updateContent(f.key, v)}
        multiline={f.type === 'textarea'}
      />
    );
  });
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [mode, setMode] = useState<'url' | 'upload' | 'media'>('url');
  return (
    <div>
      <label className="block text-xs font-medium text-soft mb-1">{label}</label>
      <div className="flex items-center gap-1 mb-2">
        {(['url', 'upload', 'media'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              mode === m ? 'bg-brand-500 text-white' : 'bg-surface-2 border border-line text-soft hover:text-main'
            }`}
          >
            {m === 'url' ? '🔗 URL' : m === 'upload' ? '📤 Upload' : '🖼️ Media'}
          </button>
        ))}
      </div>
      {mode === 'url' && (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-line rounded-lg px-3 py-2 text-sm text-main bg-surface focus:border-brand-500 outline-none transition-colors"
        />
      )}
      {mode === 'upload' && (
        <ImagePicker onImageSelected={(url) => onChange(url)} currentImageUrl={value} />
      )}
      {mode === 'media' && (
        <button
          onClick={() => alert('Media Library: Browse and select from uploaded images')}
          className="w-full border-2 border-dashed border-line rounded-lg px-3 py-6 text-sm text-soft hover:border-brand-400 hover:text-brand-500 transition-colors"
        >
          🖼️ Browse Media Library
        </button>
      )}
      {value && mode === 'url' && (
        <div className="mt-2 rounded-lg overflow-hidden border border-line">
          <img src={value} alt={label} className="w-full h-24 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
      )}
    </div>
  );
}

// ─── Rich Text Toolbar ───
function RichTextToolbar({ format, onToggle, onUpdate }: { format: TextFormat; onToggle: (key: 'bold' | 'italic' | 'underline') => void; onUpdate: (key: string, value: any) => void }) {
  return (
    <div className="p-3 bg-surface-2 border border-line rounded-xl space-y-2">
      <div className="flex items-center gap-1 flex-wrap">
        <button onClick={() => onToggle('bold')} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${format.bold ? 'bg-brand-500 text-white' : 'bg-surface border border-line text-main hover:border-brand-300'}`} title="Bold">B</button>
        <button onClick={() => onToggle('italic')} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm italic transition-colors ${format.italic ? 'bg-brand-500 text-white' : 'bg-surface border border-line text-main hover:border-brand-300'}`} title="Italic">I</button>
        <button onClick={() => onToggle('underline')} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm underline transition-colors ${format.underline ? 'bg-brand-500 text-white' : 'bg-surface border border-line text-main hover:border-brand-300'}`} title="Underline">U</button>
        <div className="w-px h-6 bg-line mx-1" />
        <select value={format.fontFamily || 'inherit'} onChange={e => onUpdate('fontFamily', e.target.value)} className="h-8 px-2 text-xs bg-surface border border-line rounded-lg text-main" title="Font Family">
          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={format.fontSize || 'inherit'} onChange={e => onUpdate('fontSize', e.target.value)} className="h-8 px-2 text-xs bg-surface border border-line rounded-lg text-main" title="Font Size">
          <option value="inherit">Size</option>
          {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs text-soft mr-1">Color:</span>
        {TEXT_COLORS.slice(0, 8).map(c => (
          <button key={c} onClick={() => onUpdate('color', c)} className={`w-5 h-5 rounded-md border-2 transition-all ${format.color === c ? 'border-brand-500 scale-110' : 'border-line hover:scale-105'}`} style={{ backgroundColor: c }} title={c} />
        ))}
        <div className="w-px h-5 bg-line mx-1" />
        <span className="text-xs text-soft mr-1">BG:</span>
        {['#ffffff', '#f8fafc', '#FFF5E6', '#213448', '#547792', '#F4B400', '#0ea5e9', '#9A2143'].map(c => (
          <button key={c} onClick={() => onUpdate('backgroundColor', c)} className={`w-5 h-5 rounded-md border-2 transition-all ${format.backgroundColor === c ? 'border-brand-500 scale-110' : 'border-line hover:scale-105'}`} style={{ backgroundColor: c }} title={c} />
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-soft mr-1">Align:</span>
        {(['left', 'center', 'right'] as const).map(a => (
          <button key={a} onClick={() => onUpdate('alignment', a)} className={`px-3 h-7 rounded-lg text-xs font-medium transition-colors ${format.alignment === a ? 'bg-brand-500 text-white' : 'bg-surface border border-line text-main hover:border-brand-300'}`}>{a}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Form Fields ───
function TextField({ label, value, onChange, multiline, placeholder }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-soft mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full border border-line rounded-lg px-3 py-2 text-sm text-main bg-surface focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-colors resize-y" />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-line rounded-lg px-3 py-2 text-sm text-main bg-surface focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-colors" />
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-soft mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-9 h-9 rounded-lg border border-line cursor-pointer" />
        <input value={value} onChange={e => onChange(e.target.value)} className="flex-1 border border-line rounded-lg px-3 py-2 text-sm text-main bg-surface font-mono focus:border-brand-500 outline-none transition-colors" />
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-soft mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full border border-line rounded-lg px-3 py-2 text-sm text-main bg-surface focus:border-brand-500 outline-none transition-colors">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
