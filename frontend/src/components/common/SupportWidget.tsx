import { useEffect, useRef, useState } from 'react';
import { submitSupportTicket } from '../../services/publicApi';
import './SupportWidget.css';

type WidgetState = 'closed' | 'open' | 'sent';

/**
 * Floating customer-support widget. Visitors/travellers can raise a
 * support ticket stating their problem; the ticket lands in the
 * dashboard's Support > Tickets panel for the support team to resolve.
 */
export default function SupportWidget() {
  const [state, setState] = useState<WidgetState>('closed');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape / outside click.
  useEffect(() => {
    if (state !== 'open') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setState('closed');
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setState('closed');
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [state]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitSupportTicket({
        customer_name: String(data.get('customer_name') || ''),
        customer_email: String(data.get('customer_email') || ''),
        subject: String(data.get('subject') || ''),
        description: String(data.get('description') || ''),
        priority: String(data.get('priority') || 'medium'),
      });
      if (result.ok) {
        form.reset();
        setState('sent');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="support-widget" ref={panelRef}>
      {state === 'open' && (
        <div className="support-panel" role="dialog" aria-label="Customer support">
          <div className="support-panel-header">
            <h3>How can we help?</h3>
            <button
              type="button"
              className="support-close"
              aria-label="Close support panel"
              onClick={() => setState('closed')}
            >
              ×
            </button>
          </div>
          <form className="support-form" onSubmit={handleSubmit}>
            <label>
              Your name
              <input name="customer_name" type="text" required placeholder="Jane Doe" />
            </label>
            <label>
              Email
              <input
                name="customer_email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              Subject
              <input
                name="subject"
                type="text"
                required
                placeholder="e.g. Problem with my booking"
              />
            </label>
            <label>
              Describe your problem
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Tell us what went wrong..."
              />
            </label>
            <label>
              Priority
              <select name="priority" defaultValue="medium">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            {error && <p className="support-error">{error}</p>}
            <button type="submit" className="support-submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Submit ticket'}
            </button>
          </form>
        </div>
      )}

      {state === 'sent' && (
        <div className="support-panel support-sent" role="status">
          <div className="support-sent-icon" aria-hidden="true">✓</div>
          <h3>Ticket submitted!</h3>
          <p>Our support team will get back to you by email shortly.</p>
          <button type="button" className="support-submit" onClick={() => setState('closed')}>
            Done
          </button>
        </div>
      )}

      {state === 'closed' && (
        <button
          type="button"
          className="support-fab"
          aria-label="Open customer support"
          title="Customer support"
          onClick={() => setState('open')}
        >
          {/* Headset support icon */}
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 13a8 8 0 0 1 16 0" />
            <path d="M3 15a2 2 0 0 1 2-2h1v5H5a2 2 0 0 1-2-2v-1z" />
            <path d="M21 15a2 2 0 0 0-2-2h-1v5h1a2 2 0 0 0 2-2v-1z" />
            <path d="M19 18v1a3 3 0 0 1-3 3h-3" />
          </svg>
        </button>
      )}
    </div>
  );
}
