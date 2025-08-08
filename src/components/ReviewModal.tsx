import { useState } from "react";

interface ReviewModalProps {
  serviceName: string;
  onSubmit: (rating: number, review: string) => void;
  onClose: () => void;
}

export default function ReviewModal({ serviceName, onSubmit, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, review);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Rate & Review: {serviceName}</h3>
        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label>Rating (1-5 stars):</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                >⭐</span>
              ))}
            </div>
          </div>

          <div className="review-section">
            <label>Review (optional):</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Submit Review</button>
          </div>
        </form>
      </div>
    </div>
  );
}