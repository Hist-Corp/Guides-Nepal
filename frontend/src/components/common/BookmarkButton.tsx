import React from 'react';
import { Heart } from 'lucide-react';
import { useProfileStore } from '../../store/profileStore';

export interface BookmarkButtonProps {
  /** Stable id of the bookmarked experience — the same id is reused on other pages. */
  id: string;
  title: string;
  city?: string;
  image?: string;
  /** Where the "View" link on the bookmarks page should go. */
  link?: string;
  /** Extra classes for the button chrome. */
  className?: string;
  /** Extra classes for the heart icon. */
  iconClassName?: string;
  /**
   * 'plain' renders a bare icon button, 'badge' a translucent circle like the
   * card overlays do, and 'save' the pill with a "Save"/"Saved" label.
   */
  variant?: 'plain' | 'badge' | 'save';
}

/**
 * Heart/bookmark toggle for experiences. Clicking it adds the experience to the
 * persisted profile bookmarks (shown on /favorites) or removes it again, so the
 * icon always reflects the saved state. Clicks never navigate the card underneath.
 */
export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  id,
  title,
  city,
  image,
  link,
  className = '',
  iconClassName = '',
  variant = 'plain',
}) => {
  const bookmarks = useProfileStore((state) => state.profile.bookmarks);
  const addBookmark = useProfileStore((state) => state.addBookmark);
  const removeBookmark = useProfileStore((state) => state.removeBookmark);

  const isBookmarked = bookmarks.some((bookmark) => bookmark.id === id);

  const handleClick = (event: React.MouseEvent) => {
    // The button usually sits on top of a card that navigates on click.
    event.preventDefault();
    event.stopPropagation();
    if (isBookmarked) {
      removeBookmark(id);
      return;
    }
    addBookmark({
      id,
      title,
      city,
      image,
      link,
      createdAt: new Date().toISOString(),
    });
  };

  const savedIconClass = 'text-red-500 fill-red-500';
  const unsavedIconClass = 'text-gray-700 group-hover/btn:text-red-500';
  const icon = (
    <Heart
      className={`transition-colors ${isBookmarked ? savedIconClass : unsavedIconClass} ${iconClassName}`}
    />
  );

  const variantClasses: Record<NonNullable<BookmarkButtonProps['variant']>, string> = {
    plain: 'inline-flex items-center justify-center text-current',
    badge: 'bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors',
    save: 'bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-sm transition-all flex items-center gap-2 px-4',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? `Remove ${title} from bookmarks` : `Bookmark ${title}`}
      title={isBookmarked ? 'Remove from bookmarks' : 'Save for later'}
      className={`${variantClasses[variant]} ${className}`}
    >
      {icon}
      {variant === 'save' && (
        <span
          className={`text-xs font-bold underline transition-colors ${
            isBookmarked ? 'text-red-500' : 'text-gray-700 group-hover/btn:text-red-500'
          }`}
        >
          {isBookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default BookmarkButton;
