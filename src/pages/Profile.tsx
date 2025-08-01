import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/api";
import { parseInterests } from "../utilities/validation"; // ✅ Add this import
import Navbar from '../components/Navbar';
import '../styles/Profile.css';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  skills: string;
  interests: string;
  time_credits: number;
  city: string;
  state: string;
  zip_code: string;
  avatar: string | null;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No auth token found, redirecting to auth');
          navigate('/auth');
          return;
        }

        console.log('Current URL:', window.location.href);
        console.log('API Base URL:', import.meta.env.VITE_BACKEND_URL);
        
        const profile = await getUserProfile(token);
        console.log('Profile loaded successfully:', profile);
        
        setUser(profile);
        setFormData(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        localStorage.removeItem('authToken');
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError('Please select a valid image file');
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must be less than 5MB');
        return;
      }

      setImageError(null);
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setUploadingImage(true);
      const token = localStorage.getItem('authToken');
      if (!token || !formData) return;

      // Create FormData for file upload
      const updateData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'avatar') {
          // Special handling for interests - convert to array
          if (key === 'interests') {
            const interestsArray = typeof value === 'string' 
              ? parseInterests(value)  // Convert string to array
              : value;                 // Already an array
            updateData.append(key, JSON.stringify(interestsArray)); // Send as JSON
          } else {
            updateData.append(key, value.toString());
          }
        }
      });

      // Add avatar file if selected
      if (avatarFile) {
        updateData.append('avatar', avatarFile);
      }

      const updatedProfile = await updateUserProfile(token, updateData);
      setUser(updatedProfile);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setImageError(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeAvatar = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const updateData = new FormData();
      updateData.append('avatar', ''); // Send empty string to remove

      const updatedProfile = await updateUserProfile(token, updateData);
      setUser(updatedProfile);
      setAvatarPreview(null);
      alert('Profile photo removed successfully!');
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      alert('Failed to remove profile photo.');
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('authToken');
      navigate('/auth');
  };

  const handleCancel = () => {
      setFormData(user || {});
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
  };

  if (loading) {
      return (
          <div>
              <Navbar />
              <div className="profile-page">
                  <p>Loading...</p>
              </div>
          </div>
      );
  }

  if (!user) {
      return (
          <div>
              <Navbar />
              <div className="profile-page">
                  <p>Failed to load profile</p>
              </div>
          </div>
      );
  }

  return (
    <div>
      <Navbar />
      <div className='profile-page'>
        <div className='profile-container'>
          <div className='profile-header'>
            <h1>Profile & Settings</h1>
            <div className='profile-actions'>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn-primary">Edit Profile</button>) : (
                <div className='edit-actions'>
                  <button onClick={handleSave} className="btn-primary">Save Changes</button>
                  <button onClick={handleCancel} className="btn-secondary">Cancel</button>
                </div>
              )}
            </div>
          </div>

          <div className='profile-content'>
            {/* Enhanced Avatar Section */}
            <div className='avatar-section'>
              <div className='avatar-container'>
                <img 
                  src={
                    avatarPreview || 
                    user.avatar || 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent((user.first_name || user.username || 'User').charAt(0))}&background=646cff&color=fff&size=150`
                  } 
                  alt="Profile" 
                  className='avatar-image'
                  onError={(e) => {
                    console.error('Avatar failed to load:', e.currentTarget.src);
                    // Fallback to a reliable placeholder
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((user.username || 'U').charAt(0))}&background=646cff&color=fff&size=150`;
                  }}
                />
                
                {editing && (
                  <div className='avatar-controls'>
                    <div className='avatar-upload'>
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className='avatar-input'
                        disabled={uploadingImage}
                      />
                      <label htmlFor="avatar" className='avatar-label'>
                        {uploadingImage ? 'Uploading...' : 'Change Photo'}
                      </label>
                    </div>
                    
                    {(user.avatar || avatarPreview) && (
                      <button 
                        onClick={removeAvatar}
                        className='remove-avatar-btn'
                        type="button"
                        disabled={uploadingImage}
                      >
                        Remove Photo
                      </button>
                    )}
                    
                    {imageError && (
                      <div className='image-error'>
                        {imageError}
                      </div>
                    )}
                    
                    <div className='avatar-guidelines'>
                      <small>
                        • Max file size: 5MB<br/>
                        • Supported formats: JPG, PNG, GIF<br/>
                        • Recommended: 300x300px or higher
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className='profile-info'>
              <div className='info-section'>
                <h2>Personal Information</h2>
                <div className='form-grid'>
                  <div className='form-group'>
                    <label>First Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <p>{user.first_name || 'Not provided'}</p>
                    )}
                  </div>

                  <div className='form-group'>
                    <label>Last Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <p>{user.last_name || 'Not provided'}</p>
                    )}
                  </div>

                  <div className='form-group'>
                    <label>Email</label>
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <p>{user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className='info-section'>
                <h2>Location</h2>
                <div className='form-grid'>
                  <div className='form-group'>
                    <label>City</label>
                    {editing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <p>{user.city || 'Not provided'}</p>
                    )}
                  </div>

                  <div className='form-group'>
                    <label>State</label>
                    {editing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <p>{user.state || 'Not provided'}</p>
                    )}
                  </div>

                  <div className='form-group'>
                    <label>Zip Code</label>
                    {editing ? (
                      <input
                        type="text"
                        name="zip_code"
                        value={formData.zip_code || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <p>{user.zip_code || 'Not provided'}</p>
                    )}
                  </div>

                  <div className='form-group'>
                    <label>Time Credits</label>
                    <p>{user.time_credits} hours</p>
                  </div>
                </div>
              </div>

              <div className='info-section'>
                <h2>About Me</h2>
                <div className='form-group'>
                  <label>Bio</label>
                  {editing ? (
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell others about yourself" />
                  ) : (
                    <p>{user.bio || 'No bio provided'}</p>
                  )}
                </div>

                <div className='form-group'>
                  <label>Skills</label>
                  {editing ? (
                    <>
                      <textarea
                        name="skills"
                        value={formData.skills || ''}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Describe your skills and abilities" />
                      <small className="hint">
                        💡 Describe your skills in your own words
                      </small>
                      <small className="example">
                        Example: I'm great at cooking Italian food and teaching math to kids
                      </small>
                    </>
                  ) : (
                    <p>{user.skills || 'No skills listed'}</p>
                  )}
                </div>

                <div className='form-group'>
                  <label>Interests</label>
                  {editing ? (
                    <>
                      <textarea
                        name="interests"
                        value={
                          Array.isArray(formData.interests) 
                            ? formData.interests.join(', ')  // Convert array to comma-separated string for editing
                            : (formData.interests || '')     // Handle if it's already a string
                        }
                        onChange={(e) => {
                          // Store as string in formData, will convert to array on save
                          setFormData(prev => ({ ...prev, interests: e.target.value }));
                        }}
                        rows={3}
                        placeholder="music, sports, reading, photography" />
                      <small className="hint">
                        📝 Enter your interests separated by commas
                      </small>
                      <small className="example">
                        Example: music, sports, reading, travel
                      </small>
                    </>
                  ) : (
                    <div className="interests-display">
                      {Array.isArray(user.interests) && user.interests.length > 0 ? (
                        <div className="interest-tags">
                          {user.interests.map((interest: string, index: number) => (
                            <span key={index} className="interest-tag">{interest}</span>
                          ))}
                        </div>
                      ) : (
                        <p>No interests listed</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className='account-actions'>
            <h2>Account Actions</h2>
            <div className='action-buttons'>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
              <button className="danger-btn">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
