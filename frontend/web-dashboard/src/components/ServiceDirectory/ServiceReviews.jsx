import React, { useState } from 'react';
import { 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown,
  User,
  Calendar,
  Filter,
  TrendingUp
} from 'lucide-react';
import '../../styles/ServiceReviews.css';

const ServiceReviews = ({ reviews = [], averageRating = 0, totalReviews = 0 }) => {
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <MessageCircle size={48} className="empty-icon" />
        <h3>No reviews yet</h3>
        <p>Be the first to review this service and help others make informed decisions.</p>
        <button className="write-review-button">
          Write First Review
        </button>
      </div>
    );
  }

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      if (filterRating === 'all') return true;
      return review.rating === parseInt(filterRating);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
          size={14}
        />
      );
    }
    return stars;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const distribution = getRatingDistribution();

  return (
    <div className="service-reviews">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <p>Read what other users say about this service</p>
      </div>

      {/* Reviews Overview */}
      <div className="reviews-overview">
        <div className="rating-summary">
          <div className="average-rating">
            <div className="rating-number">{averageRating}</div>
            <div className="rating-stars">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="rating-count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = distribution[rating];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="distribution-row">
                <span className="rating-label">{rating} star</span>
                <div className="rating-bar">
                  <div 
                    className="rating-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="rating-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="reviews-controls">
        <div className="filter-controls">
          <Filter size={16} />
          <span>Filter by rating:</span>
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="sort-controls">
          <TrendingUp size={16} />
          <span>Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  <User size={20} />
                </div>
                <div className="reviewer-details">
                  <span className="reviewer-name">{review.user}</span>
                  <span className="review-date">{formatDate(review.date)}</span>
                </div>
              </div>
              
              <div className="review-rating">
                {renderStars(review.rating)}
                <span className="rating-value">{review.rating}/5</span>
              </div>
            </div>

            <div className="review-content">
              <p className="review-comment">{review.comment}</p>
            </div>

            <div className="review-actions">
              <button className="action-button helpful-button">
                <ThumbsUp size={14} />
                Helpful (0)
              </button>
              <button className="action-button not-helpful-button">
                <ThumbsDown size={14} />
                Not Helpful (0)
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write Review Section */}
      <div className="write-review-section">
        <div className="write-review-header">
          <MessageCircle size={20} />
          <h3>Share Your Experience</h3>
        </div>
        <p>Have you used this service? Share your experience to help others.</p>
        <button className="write-review-button">
          Write a Review
        </button>
      </div>

      {/* Review Stats */}
      <div className="review-stats">
        <div className="stat-item">
          <div className="stat-value">{averageRating}</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalReviews}</div>
          <div className="stat-label">Total Reviews</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {totalReviews > 0 ? Math.round((distribution[5] + distribution[4]) / totalReviews * 100) : 0}%
          </div>
          <div className="stat-label">Positive Reviews</div>
        </div>
      </div>
    </div>
  );
};

export default ServiceReviews;
