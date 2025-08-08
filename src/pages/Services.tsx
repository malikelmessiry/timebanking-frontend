import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllServices, getServiceById, getServicesByZipCode } from '../services/api';
import type { Service } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import MapView from '../components/MapView';
import Navbar from '../components/Navbar';
import '../styles/Services.css';

const CATEGORIES = [
  'education', 'tutoring', 'technology', 'health', 'fitness', 
  'cooking', 'cleaning', 'gardening', 'childcare', 'petcare',
  'transportation', 'handyman', 'art', 'music', 'language',
  'business', 'writing', 'photography', 'other'
];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minCredits, setMinCredits] = useState<number>(0);
  const [maxCredits, setMaxCredits] = useState<number>(50);
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  
  // View states
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'credits-low' | 'credits-high' | 'rating'>('newest');
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load initial services
  useEffect(() => {
    loadServices();
    
    // Handle URL parameters
    const category = searchParams.get('category');
    const zip = searchParams.get('zip_code');
    const cityParam = searchParams.get('city');
    const search = searchParams.get('search');
    
    if (category) setSelectedCategories([category]);
    if (zip) setZipCode(zip);
    if (cityParam) setCity(cityParam);
    if (search) setSearchTerm(search);
  }, [searchParams, zipCode, city]);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [services, searchTerm, selectedCategories, minCredits, maxCredits, sortBy, city, selectedServiceType]);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      let servicesData: Service[];
      
      // Use service ID search if provided
      const serviceId = searchParams.get('service_id');
      if (serviceId) {
        const service = await getServiceById(token, Number(serviceId));
        servicesData = service ? [service] : [];
      } else if (zipCode.trim()) {
        console.log('Filtering services by zip code:', zipCode);
        servicesData = await getServicesByZipCode(token, zipCode);
      } else {
        servicesData = await getAllServices(token);
      }

      setServices(servicesData);
      console.log('Services loaded:', servicesData.length);
    } catch (error: any) {
      console.error('Failed to load services:', error);
      setError(error.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.tags.some(tag => tag.toLowerCase().includes(term)) ||
        service.category.some(cat => cat.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(service =>
        service.category.some(cat => selectedCategories.includes(cat))
      );
    }

    // Credits filter
    filtered = filtered.filter(service =>
      service.credit_required >= minCredits && service.credit_required <= maxCredits
    );

    // City filter
    if (city.trim()) {
      filtered = filtered.filter(service => service.city && service.city.toLowerCase().includes(city.toLowerCase()));
    }

    // Service type filter
    if (selectedServiceType !== 'all') {
      filtered = filtered.filter(service => service.service_type === selectedServiceType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'credits-low':
          return a.credit_required - b.credit_required;
        case 'credits-high':
          return b.credit_required - a.credit_required;
        case 'rating':
          // Handle null/undefined ratings safely
          const ratingA = a.average_rating || 0;
          const ratingB = b.average_rating || 0;
          return ratingB - ratingA;
        default:
          return 0;
      }
    });

    setFilteredServices(filtered);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setMinCredits(0);
    setMaxCredits(50);
    setZipCode('');
    setCity('');
    setSelectedServiceType('all');
    setSearchParams({});
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="services-page">
          <div className="loading-state">
            <h2>🔍 Loading Services...</h2>
            <p>Finding amazing services for you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="services-page">
        {/* Page Header */}
        <div className="services-header">
          <div className="header-content">
            <h1>Discover Services</h1>
            <p>Find the help you need from our amazing community</p>
          </div>
          
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{services.length}</span>
              <span className="stat-label">Total Services</span>
            </div>
            <div className="stat">
              <span className="stat-number">{filteredServices.length}</span>
              <span className="stat-label">Showing</span>
            </div>
          </div>
        </div>

        <div className="services-container">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filters-header">
              <h3>🔍 Filters</h3>
              <button onClick={clearFilters} className="clear-filters">
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="filter-group">
              <label>search by...</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="name, description, or tags..."
                className="search-input"
              />
            </div>

            {/* Zip Code */}
            <div className="filter-group">
              {/* <label>Location (Zip Code)</label> */}
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="zip code"
                className="zip-input"
              />
            </div>

            {/* City */}
            <div className='filter-group'>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder='city'
                className='city-input'
              />
            </div>

            {/* Categories */}
            <div className="filter-group">
              <label>Categories</label>
              <div className="categories-filter">
                {CATEGORIES.map(category => (
                  <label key={category} className="category-filter-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Credits Range */}
            <div className="filter-group">
              <label>Credit Range</label>
              <div className="credits-range">
                <input
                  type="number"
                  value={minCredits}
                  onChange={(e) => setMinCredits(parseInt(e.target.value) || 0)}
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  value={maxCredits}
                  onChange={(e) => setMaxCredits(parseInt(e.target.value) || 50)}
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Service Type Filter */}
            <div className="filter-group">
              <label>Service Type</label>
              <div className="service-type-filter">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="serviceType"
                    value="all"
                    checked={selectedServiceType === 'all'}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                  />
                  <span>All</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="serviceType"
                    value="in-person"
                    checked={selectedServiceType === 'in-person'}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                  />
                  <span>🏠 In-Person</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="serviceType"
                    value="virtual"
                    checked={selectedServiceType === 'virtual'}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                  />
                  <span>💻 Virtual</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="services-main">
            {/* Controls Bar */}
            <div className="services-controls">
              <div className="view-controls">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <span className="view-icon">⊞</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                >
                  <span className="view-icon">☰</span>
                </button>
                <button 
                  className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                  title="Map View"
                >
                  <span className="view-icon">🗺️</span>
                </button>
              </div>

              <div className="sort-controls">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="credits-low">Credits: Low to High</option>
                  <option value="credits-high">Credits: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="error-state">
                <p>⚠️ {error}</p>
                <button onClick={loadServices}>Try Again</button>
              </div>
            )}

            {/* Services Grid/List */}
            <div className="services-content">
              {viewMode === 'grid' && (
                <div className="services-grid grid">  
                  {filteredServices.map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      viewMode="grid"
                      showActions={true}
                      isOwner={false}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="services-grid list"> 
                  {filteredServices.map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      viewMode="list"
                      showActions={true}
                      isOwner={false}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'map' && (
                <MapView 
                  services={filteredServices} 
                  loading={loading} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}