import { useEffect, useState, useCallback } from 'react';

export interface CmsEditMessage {
  type: 'section-click' | 'image-click' | 'section-updated' | 'ready';
  sectionId?: string;
  sectionData?: any;
  imageSrc?: string;
  imageAlt?: string;
  pageSlug?: string;
}

/**
 * Hook for CMS edit mode in the frontend.
 * When ?cms-edit=1 is in the URL, the frontend enters edit mode where:
 * - Sections with data-cms-id are highlighted on hover
 * - Clicking a section sends its data to the parent dashboard
 * - Clicking an image shows options to upload/pick/use URL
 * - The parent can send updated sections back to re-render
 */
export function useCmsEdit() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editMode = params.get('cms-edit') === '1' || params.get('cmspreview') === '1';
    setIsEditMode(editMode);
    if (editMode) {
      // Notify parent that edit mode is ready
      window.parent.postMessage({ type: 'ready', pageSlug: params.get('slug') }, '*');
      setReady(true);
    }
  }, []);

  // Listen for messages from parent (dashboard)
  useEffect(() => {
    if (!isEditMode) return;

    const handler = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const msg = event.data as CmsEditMessage;

      if (msg.type === 'section-updated') {
        // Trigger a re-fetch of CMS sections
        window.dispatchEvent(new CustomEvent('cms-sections-updated', { detail: msg }));
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isEditMode]);

  const notifySectionClick = useCallback((sectionId: string, sectionData: any) => {
    window.parent.postMessage({
      type: 'section-click',
      sectionId,
      sectionData,
    } as CmsEditMessage, '*');
  }, []);

  const notifyImageClick = useCallback((imageSrc: string, imageAlt: string, sectionId?: string) => {
    window.parent.postMessage({
      type: 'image-click',
      imageSrc,
      imageAlt,
      sectionId,
    } as CmsEditMessage, '*');
  }, []);

  const sendUpdateToParent = useCallback((sectionId: string, data: any) => {
    window.parent.postMessage({
      type: 'section-updated',
      sectionId,
      sectionData: data,
    } as CmsEditMessage, '*');
  }, []);

  return {
    isEditMode,
    ready,
    notifySectionClick,
    notifyImageClick,
    sendUpdateToParent,
  };
}
