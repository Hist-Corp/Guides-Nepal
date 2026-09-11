import { useState, useEffect, useCallback, useRef } from 'react';
import { getPageSections, updateAllSections, getMedia } from '../services/api';
import { FRONTEND_URL } from '../config/api';

// ─── Frontend content map (pre-populated from frontend components) ───

// ─── Frontend content map (pre-populated from frontend components) ───
export const FRONTEND_CONTENT: Record<string, { id: string; label: string; type: string; content: Record<string, any>; style: Record<string, any> }[]> = {
  home: [
    { id: 'home-hero', label: 'Hero Section', type: 'hero', content: { heading: 'Enchanting experiences,\nwith incredible locals', subtitle: 'Book unique and memorable travel experiences guided by locals', buttonText: 'Search', tagline: 'Guides Nepal', primaryText: 'Guides Nepal', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200' }, style: { backgroundColor: '#FFF5E6', textColor: '#547792', accentColor: '#F4B400', alignment: 'left' } },
    { id: 'home-featured', label: 'Featured Experiences', type: 'featured', content: { heading: 'Go local in Charming Cities', subtitle: 'Find unforgettable experiences with locals', buttonText: 'View all', image: 'https://images.unsplash.com/photo-1558790477-8c992df33fe1?w=800' }, style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' } },
    { id: 'home-promo', label: 'Promo Banner', type: 'promo', content: { heading: 'We have released our 2024\nImpact Report!', subtitle: 'Discover the true power of your travel with our 2024 Impact Report. See how responsible tourism supports local communities, preserves culture, and protects the planet.', buttonText: 'Read our report', tagline: 'IMPACT', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' }, style: { backgroundColor: '#0ea5e9', textColor: '#ffffff', alignment: 'left' } },
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
export default function LivePageEditor({ slug, title, path = '/', initialSections, onSaved, onClose }: {
  slug: string;
  title: string;
  path?: string;
  initialSections?: Section[];
  onSaved?: (sections: Section[]) => Promise<void>;
  onClose: () => void;
}) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeReady, setIframeReady] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState<{ sectionId: string; imageKey: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load sections: prefer CMS, fall back to frontend content
  useEffect(() => {
    setLoading(true);
    getPageSections(slug).then((cmsSections) => {
      if (cmsSections && cmsSections.length > 0) {
        setSections(cmsSections.map((s: any) => ({ ...s, format: s.format || {} })));
      } else {
        const defaults = FRONTEND_CONTENT[slug] || initialSections || [];
        setSections(defaults.map(s => ({ ...s, format: {} })));
      }
      setLoading(false);
    }).catch(() => {
      const defaults = FRONTEND_CONTENT[slug] || initialSections || [];
      setSections(defaults.map(s => ({ ...s, format: {} })));
      setLoading(false);
    });
  }, [slug]);

  const selected = sections.find(s => s.id === selectedId) || null;

  // Handle messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data as { type?: string; id?: string; kind?: string; sectionId?: string; label?: string; currentUrl?: string; alt?: string; slug?: string };
      if (data?.type === 'cms-section-click') {
        const rawId = data.id ?? data.sectionId ?? '';
        const ownerId = data.sectionId ?? data.id ?? '';
        if (!rawId || !ownerId) return;
        if (data.kind === 'image') {
          const existing = sections.find(s => s.id === ownerId || s.id === rawId);
          if (existing) {
            setSelectedId(existing.id);
          } else {
            const newSection: Section = {
              id: ownerId,
              label: data.label ?? 'Image Section',
              type: 'text',
              content: { heading: '', subtitle: '', buttonText: '' },
              style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' },
              format: {},
            };
            setSections(prev => [...prev, newSection]);
            setSelectedId(ownerId);
          }
          setImagePickerOpen({ sectionId: ownerId, imageKey: 'image' });
          return;
        }
        const existing = sections.find(s => s.id === rawId);
        if (existing) {
          setSelectedId(rawId);
        } else {
          const newSection: Section = {
            id: rawId,
            label: data.label ?? rawId,
            type: data.kind ?? 'text',
            content: { heading: data.label ?? '', subtitle: '', buttonText: '' },
            style: { backgroundColor: '#ffffff', textColor: '#213448', alignment: 'left' },
            format: {},
          };
          setSections(prev => [...prev, newSection]);
          setSelectedId(rawId);
        }
      } else if (data?.type === 'cms-image-click') {
        const imgOwner = data.sectionId ?? data.id ?? '';
        if (!imgOwner) return;
        setSelectedId(imgOwner);
        setImagePickerOpen({ sectionId: imgOwner, imageKey: 'image' });
      } else if (data?.type === 'ready' || data?.type === 'cms-page-loaded') {
        setIframeReady(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [slug, sections]);

  const updateContent = useCallback((key: string, value: any) => {
    setSections(prev => prev.map(s => s.id === selectedId ? { ...s, content: { ...s.content, [key]: value } } : s));
    setDirty(true);
  }, [selectedId]);

  const updateStyle = useCallback((key: string, value: string) => {
    setSections(prev => prev.map(s => s.id === selectedId ? { ...s, style: { ...s.style, [key]: value } } : s));
    setDirty(true);
  }, [selectedId]);

  const updateFormat = useCallback((key: string, value: any) => {
    setSections(prev => prev.map(s => s.id === selectedId ? { ...s, format: { ...(s.format || {}), [key]: value } } : s));
    setDirty(true);
  }, [selectedId]);

  const toggleFormat = useCallback((key: 'bold' | 'italic' | 'underline') => {
    setSections(prev => prev.map(s => {
      if (s.id !== selectedId) return s;
      const fmt = { ...(s.format || {}) };
      fmt[key] = !fmt[key];
      return { ...s, format: fmt };
    }));
    setDirty(true);
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

  const handleImageSelect = (url: string) => {
    if (imagePickerOpen) {
      updateContent(imagePickerOpen.imageKey, url);
      // Send message to iframe to update the image live
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'cms-update-image',
          sectionId: imagePickerOpen.sectionId,
          url,
        }, '*');
      }
      setImagePickerOpen(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateAllSections(slug, sections);
      if (onSaved) await onSaved(sections);
      setDirty(false);
      setToast('Changes saved — frontend updated!');
      setTimeout(() => setToast(null), 3000);
      // Notify iframe to reload CMS content
      if (iframeRef.current?.contentWindow) {
        sections.forEach(s => {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'cms-update-section',
            sectionId: s.id,
            content: s.content,
            style: s.style,
          }, '*');
        });
      }
    } catch {
      setToast('Saved (local)');
      setTimeout(() => setToast(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  // Send live update to iframe when selected section changes
  useEffect(() => {
    if (!selected || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({
      type: 'cms-update-section',
      sectionId: selected.id,
      content: selected.content,
      style: selected.style,
    }, '*');
  }, [selected?.id, selected?.content, selected?.style]);

  const iframeSrc = `${FRONTEND_URL}${path}?cms_edit=1&cms_slug=${encodeURIComponent(slug)}`;

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
      <div className="min-h-16 border-b border-line bg-gradient-to-r from-slate-100 via-surface to-accent-500/10 dark:from-slate-800/40 dark:via-surface dark:to-accent-500/10 flex items-center justify-between px-4 sm:px-5 py-2.5 gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-surface border border-slate-300 dark:border-slate-600 shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-x-0.5 active:translate-x-0 active:scale-[0.98] transition-all duration-200"
            title="Back to pages"
          >
            <span className="w-7 h-7 rounded-lg bg-slate-500/10 dark:bg-slate-400/15 flex items-center justify-center group-hover:bg-slate-600 dark:group-hover:bg-slate-400 transition-colors duration-200">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-white dark:group-hover:text-slate-900 group-hover:-translate-x-px transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </span>
            Back
          </button>
          <div className="w-px h-8 bg-line hidden sm:block" />
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-white flex items-center justify-center text-base shadow-sm shrink-0">
              ✏️
            </span>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-main truncate leading-tight">Live Editor <span className="text-soft font-medium">·</span> <span className="text-accent-600 dark:text-accent-400">{title}</span></h1>
              <p className="text-xs text-soft font-mono truncate">{FRONTEND_URL}{path}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={`${FRONTEND_URL}${path}`} target="_blank" rel="noopener" className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-line bg-surface text-soft hover:text-emerald-600 hover:border-emerald-300 hover:shadow-sm transition-all duration-200">View live ↗</a>
          <button onClick={save} disabled={!dirty || saving} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200">
            {saving ? 'Saving...' : dirty ? '● Save Changes' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-line bg-surface-2 overflow-y-auto shrink-0">
          <div className="p-3">
            <h2 className="text-xs font-semibold text-soft uppercase tracking-wider mb-2">Sections</h2>
            {sections.map(s => (
              <button key={s.id} onClick={() => setSelectedId(s.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${selectedId === s.id ? 'bg-brand-500 text-white' : 'text-main hover:bg-surface'}`}>
                <div className="font-medium truncate">{s.label}</div>
                <div className={`text-xs ${selectedId === s.id ? 'text-white/70' : 'text-soft'}`}>{s.type}</div>
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-line">
              <p className="text-xs text-soft mb-2">Add section:</p>
              <div className="flex flex-wrap gap-1">
                {['hero', 'text', 'featured', 'promo', 'categories', 'footer'].map(t => (
                  <button key={t} onClick={() => addSection(t)} className="px-2 py-1 text-xs bg-surface border border-line rounded-md hover:border-brand-300 text-main transition-colors">+ {t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-surface-2 relative">
          {!iframeReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-2">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            key={slug + path}
            src={iframeSrc}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            onLoad={() => setIframeReady(true)}
          />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-xs rounded-full font-medium pointer-events-none z-20">
            Click any section to edit • Click images to replace
          </div>
        </div>

        <div className="w-96 border-l border-line bg-surface overflow-y-auto shrink-0">
          {selected ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-main">{selected.label}</h2>
                <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 rounded-md font-medium">{selected.type}</span>
              </div>
              <RichTextToolbar format={selected.format || {}} onToggle={toggleFormat} onUpdate={updateFormat} />
              <div className="mt-4 space-y-3">
                <h3 className="text-xs font-semibold text-soft uppercase tracking-wider">Content</h3>
                {renderContentFields(selected, updateContent, (sid, key) => setImagePickerOpen({ sectionId: sid, imageKey: key }))}
              </div>
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
                <div className="text-4xl mb-3">✊</div>
                <p className="text-sm">Click a section in the live preview to edit.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {imagePickerOpen && (
        <ImagePickerModal sectionId={imagePickerOpen.sectionId} imageKey={imagePickerOpen.imageKey} currentValue={selected?.content[imagePickerOpen.imageKey] || ''} onSelect={handleImageSelect} onClose={() => setImagePickerOpen(null)} />
      )}

      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium z-50">
          {toast}
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


// ─── Content Field Renderer ───
function renderContentFields(selected: Section, updateContent: (key: string, value: any) => void, onPickImage: (sectionId: string, imageKey: string) => void) {
  const fields: Record<string, { key: string; label: string; multiline?: boolean; image?: boolean }[]> = {
    hero: [
      { key: 'image', label: 'Background Image', image: true },
      { key: 'heading', label: 'Heading', multiline: true },
      { key: 'subtitle', label: 'Subtitle', multiline: true },
      { key: 'buttonText', label: 'Button Text' },
      { key: 'tagline', label: 'Tagline' },
      { key: 'primaryText', label: 'Primary Brand Text' },
    ],
    text: [
      { key: 'image', label: 'Section Image', image: true },
      { key: 'heading', label: 'Heading', multiline: true },
      { key: 'subtitle', label: 'Subtitle', multiline: true },
      { key: 'body', label: 'Body Text', multiline: true },
    ],
    featured: [
      { key: 'image', label: 'Section Image', image: true },
      { key: 'heading', label: 'Heading', multiline: true },
      { key: 'subtitle', label: 'Subtitle', multiline: true },
      { key: 'buttonText', label: 'Button Text' },
    ],
    promo: [
      { key: 'image', label: 'Background Image', image: true },
      { key: 'heading', label: 'Heading', multiline: true },
      { key: 'subtitle', label: 'Subtitle', multiline: true },
      { key: 'buttonText', label: 'Button Text' },
      { key: 'tagline', label: 'Tagline' },
    ],
    categories: [
      { key: 'heading', label: 'Heading', multiline: true },
      { key: 'subtitle', label: 'Subtitle', multiline: true },
    ],
    testimonials: [
      { key: 'heading', label: 'Heading', multiline: true },
      { key: 'subtitle', label: 'Subtitle', multiline: true },
    ],
    values: [
      { key: 'heading', label: 'Heading', multiline: true },
    ],
    footer: [
      { key: 'supportEmail', label: 'Support Email' },
      { key: 'copyright', label: 'Copyright' },
    ],
  };

  const fieldList = fields[selected.type] || [
    { key: 'heading', label: 'Heading', multiline: true },
    { key: 'subtitle', label: 'Subtitle', multiline: true },
    { key: 'buttonText', label: 'Button Text' },
  ];

  return fieldList.map(f => (
    f.image ? (
      <ImageField key={f.key} label={f.label} value={selected.content[f.key] || ''} onPick={() => onPickImage(selected.id, f.key)} />
    ) : (
      <TextField key={f.key} label={f.label} value={selected.content[f.key] || ''} onChange={v => updateContent(f.key, v)} multiline={f.multiline} />
    )
  ));
}

// ─── Image Field with Picker Trigger ───
function ImageField({ label, value, onPick }: { label: string; value: string; onPick: () => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-soft mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-line shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-line flex items-center justify-center text-soft text-xs shrink-0">
            No image
          </div>
        )}
        <button onClick={onPick} className="flex-1 py-2 px-3 border border-line rounded-lg text-sm text-main hover:border-brand-300 hover:bg-surface-2 transition-colors text-left">
          <span className="font-medium">Change Image</span>
          <span className="text-xs text-soft block">Upload, media library, or URL</span>
        </button>
      </div>
    </div>
  );
}

// ─── Image Picker Modal ───
function ImagePickerModal({ sectionId, imageKey, currentValue, onSelect, onClose }: {
  sectionId: string;
  imageKey: string;
  currentValue: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(currentValue);
  const [media, setMedia] = useState<{ id: number; url: string; name: string }[]>([]);
  const [tab, setTab] = useState<'upload' | 'media' | 'url'>('upload');

  useEffect(() => {
    getMedia().then((items: any) => setMedia(items || [])).catch(() => {});
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onSelect(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-line" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-sm font-semibold text-main">Replace Image</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-surface-2 flex items-center justify-center text-soft">&times;</button>
        </div>
        <div className="flex border-b border-line">
          {(['upload', 'media', 'url'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-xs font-medium transition-colors ${tab === t ? 'text-brand-500 border-b-2 border-brand-500' : 'text-soft hover:text-main'}`}>
              {t === 'upload' ? 'Upload' : t === 'media' ? 'Media Library' : 'URL'}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'upload' && (
            <div className="border-2 border-dashed border-line rounded-xl p-8 text-center hover:border-brand-300 transition-colors">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="img-upload" />
              <label htmlFor="img-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">⬆️</div>
                <p className="text-sm text-main font-medium">Click to upload an image</p>
                <p className="text-xs text-soft mt-1">PNG, JPG, WEBP up to 10MB</p>
              </label>
            </div>
          )}
          {tab === 'media' && (
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {media.map(item => (
                <button key={item.id} onClick={() => onSelect(item.url)} className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-brand-500 transition-all">
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                </button>
              ))}
              {media.length === 0 && <p className="col-span-3 text-center text-sm text-soft py-8">No media found</p>}
            </div>
          )}
          {tab === 'url' && (
            <div className="space-y-3">
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full border border-line rounded-lg px-3 py-2 text-sm text-main bg-surface focus:border-brand-500 outline-none" />
              <button onClick={() => onSelect(url)} disabled={!url} className="w-full py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 hover:bg-brand-600 transition-colors">Use this URL</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
