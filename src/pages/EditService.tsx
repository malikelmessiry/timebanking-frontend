import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getServiceById, updateService } from '../services/api';
import type { Service, CreateServiceData } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/CreateService.css'; // Reuse the same styles

const categories = ['education', 'technology', 'music', 'arts', 'sports', 'cooking', 'gardening', 'wellness', 'business', 'other'];
const commonTags = ['beginner-friendly', 'advanced', 'group-session', 'one-on-one', 'flexible-schedule', 'weekend-available', 'evening-available'];

export default function EditService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalService, setOriginalService] = useState<Service | null>(null);
  
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

  const [customTag, setCustomTag] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);

  // Load service data on mount
  useEffect(() => {
    const loadService = async () => {
      if (!id) {
        setError('Service ID is required');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/auth');
          return;
        }

        const service = await getServiceById(token, parseInt(id));
        setOriginalService(service);
        
        // Populate form with existing data
        setFormData({
          name: service.name,
          category: service.category,
          service_type: service.service_type,
          description: service.description,
          tags: service.tags,
          credit_required: service.credit_required,
          total_sessions: service.total_sessions,
          city: service.city || '',
          zip_code: service.zip_code || '',
          latitude: service.latitude || 0,
          longitude: service.longitude || 0,
          is_available: service.is_available,
        });

      } catch (error: any) {
        console.error('Failed to load service:', error);
        setError(error.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'credit_required') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'total_sessions') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
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
      setError('Credit required must be at least 1');
      return;
    }
    if (formData.total_sessions && formData.total_sessions < 1) {
      setError('Total sessions must be at least 1');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      if (!id) {
        throw new Error('Service ID is required');
      }

      await updateService(token, parseInt(id), formData);
      
      alert('Service updated successfully!');
      navigate('/dashboard?tab=services');
    } catch (error: any) {
      console.error('Failed to update service:', error);
      setError(error.message || 'Failed to update service');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="create-service-page">
          <div className="create-service-container">
            <p>Loading service...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !originalService) {
    return (
      <div>
        <Navbar />
        <div className="create-service-page">
          <div className="create-service-container">
            <div className="error-message">
              ⚠️ {error}
            </div>
            <button onClick={() => navigate('/dashboard?tab=services')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="create-service-page">
        <div className="create-service-container">
          <div className="page-header">
            <h1>Edit Service</h1>
            <p>Update your service details</p>
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
                placeholder="e.g., Piano Lessons"
                className="form-input"
                required
              />
            </div>

            {/* Service Type */}
            <div className="form-group">
              <label htmlFor="service_type">Service Type *</label>
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            {/* Categories */}
            <div className="form-group">
              <label>Categories * (Select at least one)</label>
              <div className="checkbox-grid">
                {categories.map((category) => (
                  <label key={category} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.category.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    <span className="checkbox-text">{category}</span>
                  </label>
                ))}
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
                placeholder="Describe your service in detail..."
                className="form-textarea"
                rows={4}
                required
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>Tags (Optional)</label>
              <div className="tags-section">
                <div className="common-tags">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-btn ${formData.tags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleTagChange(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="tag-btn add-custom"
                    onClick={() => setShowCustomTag(true)}
                  >
                    + Add Custom Tag
                  </button>
                </div>

                {showCustomTag && (
                  <div className="custom-tag-input">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Enter custom tag"
                      className="form-input"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                    />
                    <button type="button" onClick={addCustomTag}>Add</button>
                    <button type="button" onClick={() => setShowCustomTag(false)}>Cancel</button>
                  </div>
                )}

                {formData.tags.length > 0 && (
                  <div className="selected-tags">
                    <h4>Selected Tags:</h4>
                    <div className="tag-list">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="selected-tag">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Credits and Sessions */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="credit_required">Time Credits Required *</label>
                <input
                  type="number"
                  id="credit_required"
                  name="credit_required"
                  value={formData.credit_required}
                  onChange={handleInputChange}
                  min="0.5"
                  max="50"
                  step="0.5"
                  className="form-input"
                  placeholder="1.5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="total_sessions">Total Sessions Available</label>
                <input
                  type="number"
                  id="total_sessions"
                  name="total_sessions"
                  value={formData.total_sessions}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="form-input"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                />
                <span className="checkbox-text">Service is currently available for booking</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard?tab=services')}
                className="cancel-btn"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
