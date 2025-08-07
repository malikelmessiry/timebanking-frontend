import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createService } from '../services/api';
import type { CreateServiceData } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/CreateService.css';

const CATEGORIES = [
  'education', 'tutoring', 'technology', 'health', 'fitness', 
  'cooking', 'cleaning', 'gardening', 'childcare', 'petcare',
  'transportation', 'handyman', 'art', 'music', 'language',
  'business', 'writing', 'photography', 'other'
];

const COMMON_TAGS = [
  'beginner-friendly', 'advanced', 'online', 'in-person', 'weekend',
  'evening', 'flexible', 'quick', 'detailed', 'certified',
  'experienced', 'patient', 'creative', 'technical', 'practical'
];

export default function CreateService() {
  const [formData, setFormData] = useState<CreateServiceData>({
    name: '',
    category: [],
    service_type: 'in-person',
    description: '',
    tags: [],
    credit_required: 0.5,
    total_sessions: 10,
    city: '',
    zip_code: '',
    latitude: 0,
    longitude: 0,
    is_available: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'credit_required' || name === 'total_sessions') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const handleTagChange = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
      setShowCustomTag(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Service name is required');
      return;
    }
    if (formData.category.length === 0) {
      setError('Please select at least one category');
      return;
    }
    if (!formData.description.trim()) {
      setError('Service description is required');
      return;
    }
    if (formData.credit_required < 0.5) {
      setError('Credit required must be at least 0.5');
      return;
    }
    if (formData.total_sessions && formData.total_sessions < 1) {
      setError('Total sessions must be at least 1');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      const newService = await createService(token, formData);
      console.log('✅ Service created:', newService);
      
      alert('Service created successfully!');
      navigate('/dashboard?tab=services');
    } catch (error: any) {
      console.error('❌ Failed to create service:', error);
      setError(error.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create-service-page">
        <div className="create-service-container">
          <div className="page-header">
            <h1>Offer a New Service</h1>
            <p>Share your skills and earn time credits</p>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-service-form">
            {/* Service Name */}
            <div className="form-group">
              <label htmlFor="name">Service Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Math Tutoring for High School Students"
                maxLength={100}
                required
              />
              <small className="hint">
                Be specific and descriptive (max 100 characters)
              </small>
            </div>

            {/* Categories */}
            <div className="form-group">
              <label>Categories * (select all that apply)</label>
              <div className="categories-grid">
                {CATEGORIES.map(category => (
                  <label key={category} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.category.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    <span className="category-name">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              <small className="hint">
                Selected: {formData.category.join(', ') || 'None'}
              </small>
            </div>

            {/* Service Type */}
            <div className='form-group'>
              <label htmlFor='service_type'>Service Type *</label>
              <div className='service-type-options'>
                <label className='radio-option'>
                  <input 
                    type='radio'
                    name='service_type'
                    value='in-person'
                    checked={formData.service_type === 'in-person'}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  />
                  <span className='radio-label'>
                    <span className='radio-icon'>🏠</span>
                    In-Person
                  </span>
                </label>

                <label className='radio-option'>
                  <input
                    type='radio'
                    name='service_type'
                    value='virtual'
                    checked={formData.service_type === 'virtual'}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  />
                  <span className='radio-label'>
                    <span className='radio-icon'>💻</span>
                    Virtual
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe your service in detail. What will you do? What can clients expect? What's your experience?"
                maxLength={1000}
                required
              />
              <small className="hint">
                Be detailed about what you offer, your experience, and what clients can expect (max 1000 characters)
              </small>
            </div>

            {/* Credits and Sessions */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="credit_required">Credits Required *</label>
                <input
                  type="number"
                  id="credit_required"
                  name="credit_required"
                  value={formData.credit_required}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData({ ...formData, credit_required: 0 });
                      return;
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      setFormData({ ...formData, credit_required: numValue })
                    }
                  }}
                  min="0.5"
                  max="50"
                  step="0.5"
                  className="form-input"
                  placeholder="1.5"
                  required
                />
                <small className="hint">
                  How many time credits per session?
                  <span className="info-tooltip">
                    <span className="info-icon">ℹ️</span>
                    <span className="tooltip-text">
                      Time credits are the currency of our platform - 1 credit is 1 hour. When someone books your service, 
                      they'll spend this many credits from their account. You'll earn the same amount 
                      to spend on other services. Consider the time and effort your service requires 
                      when setting this amount.
                    </span>
                  </span>
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="total_sessions">Total Sessions Available</label>
                <input
                  type="number"
                  id="total_sessions"
                  name="total_sessions"
                  value={formData.total_sessions || ''}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  placeholder="10"
                />
                <small className="hint">
                  How many sessions can you offer? (optional)
                </small>
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>Tags (help people find your service)</label>
              
              {/* Common Tags */}
              <div className="tags-section">
                <h4>Popular Tags</h4>
                <div className="tags-grid">
                  {COMMON_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-button ${formData.tags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleTagChange(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Tags */}
              <div className="custom-tags-section">
                <button
                  type="button"
                  className="add-custom-tag-btn"
                  onClick={() => setShowCustomTag(!showCustomTag)}
                >
                  + Add Custom Tag
                </button>

                {showCustomTag && (
                  <div className="custom-tag-input">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Enter custom tag"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    />
                    <button type="button" onClick={addCustomTag}>Add</button>
                  </div>
                )}
              </div>

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="selected-tags">
                  <h4>Selected Tags:</h4>
                  <div className="selected-tags-list">
                    {formData.tags.map(tag => (
                      <span key={tag} className="selected-tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="remove-tag"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating Service...' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}