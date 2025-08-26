import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showText = false 
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={cn(
            sizeClasses[size],
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 rounded'
          )}
        >
          <Star
            className={cn(
              'w-full h-full',
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-none text-muted-foreground'
            )}
          />
        </button>
      ))}
      {showText && (
        <span className="ml-2 text-sm text-muted-foreground">
          {rating} out of 5 stars
        </span>
      )}
    </div>
  );
};