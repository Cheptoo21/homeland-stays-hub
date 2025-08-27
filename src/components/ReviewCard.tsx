import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StarRating } from './StarRating';
import { MessageSquare, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Temporary interface until types are regenerated
interface ReviewRow {
  id: string;
  booking_id: string;
  property_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  host_reply: string | null;
  host_reply_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  host_reply?: string;
  created_at: string;
  host_reply_at?: string;
  reviewer: {
    full_name: string;
  };
}

interface ReviewCardProps {
  review: Review;
  isHost?: boolean;
  onReplyAdded?: () => void;
}

export const ReviewCard = ({ review, isHost = false, onReplyAdded }: ReviewCardProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('reviews')
        .update({ 
          host_reply: replyText,
          host_reply_at: new Date().toISOString()
        })
        .eq('id', review.id);

      if (error) throw error;

      toast({
        title: "Reply Posted",
        description: "Your reply has been added to the review.",
      });

      setReplyText('');
      setShowReplyForm(false);
      onReplyAdded?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {review.reviewer.full_name?.charAt(0) || 'G'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{review.reviewer.full_name || 'Guest'}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(review.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>

          <p className="text-sm leading-relaxed">{review.comment}</p>

          {review.host_reply && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Reply className="w-4 h-4" />
                Host Reply
                {review.host_reply_at && (
                  <span className="text-muted-foreground font-normal">
                    • {format(new Date(review.host_reply_at), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{review.host_reply}</p>
            </div>
          )}

          {isHost && !review.host_reply && (
            <div className="mt-4">
              {!showReplyForm ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowReplyForm(true)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Reply to Review
                </Button>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your reply to this review..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReply}
                      disabled={isSubmitting || !replyText.trim()}
                      size="sm"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Reply'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};