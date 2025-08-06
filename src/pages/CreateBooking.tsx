import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../services/api';
import type { CreateBookingData } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/CreateService.css';

const BOOKING_CATEGORIES = [
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

export default function CreateBooking() {
    const [formData, setFormData] = useState<CreateBookingData>({
        service_name: '',
        category: [],
        description: '',
        tags: [],
        credit_offered: 1,
        sessions_requested: 1
});

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [customTag, setCustomTag] = useState('');
const [showCustomTag, setShowCustomTag] = useState(false);

const navigate = useNavigate();

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
const { name, value } = e.target;
    if (name === 'credit_offered' || name === 'sessions_requested') {
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
    if (!formData.service_name.trim()) {
        setError('Service name is required');
        return;
    }
    if (formData.category.length === 0) {
        setError('Please select at least one category');
        return;
    }
    if (!formData.description.trim()) {
        setError('Booking description is required');
        return;
    }
    if (formData.credit_offered < 1) {
        setError('Credit offered must be at least 1');
        return;
    }
    if (formData.sessions_requested && formData.sessions_requested < 1) {
        setError('Sessions requested must be at least 1');
        return;
    }

    setLoading(true);

    try {
    const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/auth');
            return;
    }

const newBooking = await createBooking(token, formData);
    console.log('✅ Booking created:', newBooking);

    alert('Booking created successfully!');
    navigate('/dashboard?tab=bookings');
    } catch (error: any) {
    console.error('❌ Failed to create booking:', error);
    setError(error.message || 'Failed to create booking');
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
            <h1>Request a New Booking</h1>
            <p>Find the help you need and offer time credits</p>
        </div>

        {error && (
            <div className="error-message">
            ⚠️ {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="create-service-form">
            {/* Service Name */}
            <div className="form-group">
              <label htmlFor="service_name">Service Name *</label>
                <input
                type="text"
                id="service_name"
                name="service_name"
                value={formData.service_name}
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
                {BOOKING_CATEGORIES.map(category => (
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

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description *</label>
                <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe your booking request in detail. What do you need? What can helpers expect?"
                maxLength={1000}
                required
            />
            <small className="hint">
                Be detailed about what you need, your expectations, and any relevant experience (max 1000 characters)
            </small>
            </div>

            {/* Credits and Sessions */}
            <div className="form-row">
            <div className="form-group">
                <label htmlFor="credit_offered">Credits Offered *</label>
                <input
                type="number"
                id="credit_offered"
                name="credit_offered"
                value={formData.credit_offered}
                onChange={handleInputChange}
                min="1"
                max="50"
                required
                />
                <small className="hint">
                    How many time credits per session?
                </small>
            </div>
            </div>

            <div className="form-group">
                <label htmlFor="sessions_requested">Sessions Requested</label>
                <input
                type="number"
                id="sessions_requested"
                name="sessions_requested"
                value={formData.sessions_requested || ''}
                onChange={handleInputChange}
                min="1"
                max="1000"
                placeholder="1"
                />
                <small className="hint">
                    How many sessions do you need? (optional)
                </small>
            </div>

            {/* Tags */}
            <div className="form-group">
            <label>Tags (help people find your booking)</label>
            
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
                {loading ? 'Creating Booking...' : 'Create Booking'}
            </button>
            </div>
        </form>
        </div>
    </div>
    </div>
);
}