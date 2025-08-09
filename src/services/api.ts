const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://timebanking-backend.onrender.com'; // deployed backend

// const BASE_URL = 'http://localhost:8000' // local backend

// Register
export const registerUser = async (data: {
    email: string,
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    bio?: string;
    skills?: string;
    interests?: string[];
}) => {
    const res = await fetch(`${BASE_URL}/accounts/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Network error' }));
        
        if (res.status === 400) {
            // Common backend errors
            if (errorData.email && errorData.email[0].includes('already exists')) {
                throw new Error('This email is already registered. Try logging in instead.');
            } else if (errorData.non_field_errors) {
                throw new Error(errorData.non_field_errors[0]);
            } else if (errorData.password) {
                throw new Error(`Password: ${errorData.password[0]}`);
            } else {
                throw new Error('Registration failed. Please check your information.');
            }
        } else if (res.status >= 500) {
            throw new Error('Server error. Please try again later.');
        } else {
            throw new Error('Registration failed. Please try again.');
        }
    }

    return await res.json();
};

// Login
export const loginUser = async (data: {
    email: string;
    password: string;
}) => {
    const res = await fetch(`${BASE_URL}/accounts/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        if (res.status === 400 || res.status === 401) {
            throw new Error('Invalid email or password');
        } else if (res.status >= 500) {
            throw new Error('Server error. Please try again later.');
        } else {
            throw new Error('Login failed. Please try again.');
        }
    }

    return await res.json();
};

// Get Profile
export const getUserProfile = async (token: string) => {
    const res = await fetch(`${BASE_URL}/accounts/profile/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error('Session expired. Please log in again.');
        } else if (res.status >= 500) {
            throw new Error('Server error. Please try again later.');
        } else {
            throw new Error('Failed to load profile');
        }
    }

    return await res.json();
};

// Update Profile
export const updateUserProfile = async (token: string, formData: FormData) => {
    const res = await fetch(`${BASE_URL}/accounts/profile/`, {
        method: "PATCH",
        headers: {
            "Authorization": `Token ${token}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Profile update failed: ${JSON.stringify(errorData)}`);
    }

    return await res.json();
};

// Logout
export const logoutUser = async (token: string) => {
    try {
        const res = await fetch(`${BASE_URL}/accounts/logout/`, {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": 'application/json',
            }
        });

        if (!res.ok) {
            throw new Error('Logout failed');
        }

        return await res.json();
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Service Types
export interface Service {
  id: number;
  name: string;
  category: string[];
  service_type: string;
  description: string;
  zip_code: string;
  city: string;
  tags: string[];
  credit_required: number;
  created_at: string;
  is_available: boolean;
  average_rating: number;
  total_sessions: number;
  remaining_sessions: number;
  owner: number;
  owner_email: string;
  latitude: number;
  longitude: number;
  customer_reviews: string[];
}

export interface CreateServiceData {
  name: string;
  category: string[];
  service_type: string;
  description: string;
  tags: string[];
  credit_required: number;
  total_sessions?: number;
  zip_code: string;
  city: string;
  is_available: boolean;
  latitude: number;
  longitude: number;
}

// Get all services
export const getAllServices = async (token: string): Promise<Service[]> => {
  try {
    const res = await fetch(`${BASE_URL}/services/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to get services');
    }

    return await res.json();
  } catch (error) {
    console.error('Get all services error:', error);
    throw error;
  }
};

// Get service by ID
export const getServiceById = async (token: string, serviceId: number) => {
    try {
        const res = await fetch(`${BASE_URL}/services/${serviceId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Service not found');
            } else if (res.status === 401) {
                throw new Error('Session expired. Please log in again.')
            } else if (res.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error('Failed to load service');
            }
        }

        return await res.json();
    } catch (error) {
        console.error('Get service error:', error);
        throw error;
    }
};

// Create a service 
export const createService = async (token: string, serviceData: CreateServiceData) => {
    try {
        const res = await fetch(`${BASE_URL}/services/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify(serviceData),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));

            if (res.status === 400) {
                const errorMessages = [];
                for (const [field, messages] of Object.entries(errorData)) {
                    if (Array.isArray(messages)) {
                        errorMessages.push(`${field}: ${messages.join(', ')}`);
                    } else if (typeof messages === 'string') {
                        errorMessages.push(`${field}: ${messages}`);
                    }
                }
                throw new Error(errorMessages.join('. ') || 'Invalid service data');
            } else if (res.status === 401) {
                throw new Error('Session expired. Please log in again.');
            } else if (res.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error('Failed to create service');
            }
        }

        return await res.json();
    } catch (error) {
        console.error('Create service error:', error);
        throw error;
    }
};

// Update a service
export const updateService = async (token: string, serviceId: number, serviceData: Partial<CreateServiceData>) => {
    try {
        const res = await fetch(`${BASE_URL}/services/${serviceId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify(serviceData),
        });

        if (!res.ok) {
            if (res.status === 400) {
                throw new Error('Invalid service data');
            } else if (res.status === 401) {
                throw new Error('Session expired. Please log in again.');
            } else if (res.status === 403) {
                throw new Error('You can only edit your own services');
            } else if (res.status === 404) {
                throw new Error('Service not found');
            } else if (res.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error('Failed to update service');
            }
        }
        
        return await res.json();
    } catch (error) {
        console.error('Update service error:', error);
        throw error;
    }
};

// Delete a service 
export const deleteService = async (token: string, serviceId: number) => {
    try {
        const res = await fetch(`${BASE_URL}/services/${serviceId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Session expired. Please log in again.');
            } else if (res.status === 403) {
                throw new Error('You can only delete your own services');
            } else if (res.status === 404) {
                throw new Error('Service not found');
            } else if (res.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error('Failed to delete service');
            }
        }

        return { message: 'Service deleted successfully' };
    } catch (error) {
        console.error('Delete service error:', error);
        throw error;
    }
};

// Get user's own services (my services)
export const getMyServices = async (token: string, userEmail: string): Promise<Service[]> => {
  try {    
    // Get user profile to get the ID
    const userProfile = await getUserProfile(token);    
    const myServices = await getServicesByOwner(token, userProfile.id);
    
    return myServices;
  } catch (error) {
    console.error('Get my services error:', error);
    throw error;
  }
};

// Get services by zip code 
export const getServicesByZipCode = async (token: string, zipCode: string): Promise<Service[]> => {
  try {
    const res = await fetch(`${BASE_URL}/services/?zip_code=${zipCode}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error('Session expired. Please log in again.');
        } else if (res.status >= 500) {
            throw new Error('Server error. Please try again later.');
        } else {
            throw new Error('Failed to load services for this zip code');
        }
    }

      return await res.json();
  } catch (error) {
      console.error('Get services by zip code error:', error);
      throw error;
  }
};

// BOOKINGS

export interface Booking {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  booked_at: string;
  completed_at: string | null;
  customer_review?: string | null;
  customer_rating?: number | null;
  service_name: string;
  owner_first_name: string;
  owner_email: string;
  customer_first_name: string;
  customer_email: string;
}

export interface CreateBookingRequest {
  service_id: number;
}

// Get all bookings
export const getBookings = async (token: string, queryParams: string): Promise<Booking[]> => {
  try {    
    const res = await fetch(`${BASE_URL}/bookings/?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to get bookings: ${res.status}`);
    }
    
    const bookings = await res.json();
    return bookings;
  } catch (error) {
    console.error('Get bookings error:', error);
    throw error;
  }
}

// Create a booking
export const createBooking = async (token: string, serviceId: number) => {
  try {    
    const res = await fetch(`${BASE_URL}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ service_id: serviceId }),
    });

    if (!res.ok) {
      // Get the actual error details from backend
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      
      if (res.status === 400) {
        // Handle validation errors
        const errorMessages = [];
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            errorMessages.push(`${field}: ${messages}`);
          }
        }
        throw new Error(errorMessages.join('. ') || 'Invalid booking data');
      } else if (res.status === 401) {
        throw new Error('Session expired. Please log in again.');
      } else if (res.status === 403) {
        throw new Error('Permission denied. You cannot book this service.');
      } else if (res.status === 404) {
        throw new Error('Service not found.');
      } else if (res.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`HTTP ${res.status}: ${errorData.detail || errorData.message || 'Failed to create booking'}`);
      }
    }

    const booking = await res.json();
    return booking;
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (token: string, bookingId: number): Promise<Booking> => {
    try {
        const res = await fetch(`${BASE_URL}/bookings/${bookingId}/mark_cancelled/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Session expired. Please log in again.');
            } else if (res.status === 404) {
                throw new Error('Booking not found');
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || 'Failed to cancel booking');
            }
        }

        return await res.json();
    } catch (error) {
        console.error('Cancel booking error:', error);
        throw error;
    }
};

// Confirm a booking (for service providers)
export const confirmBooking = async (token: string, bookingId: number): Promise<Booking> => {
    try {
        const res = await fetch(`${BASE_URL}/bookings/${bookingId}/mark_confirmed/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Session expired. Please log in again.');
            } else if (res.status === 404) {
                throw new Error('Booking not found');
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || 'Failed to confirm booking');
            }
        }

        return await res.json();
    } catch (error) {
        console.error('Confirm booking error:', error);
        throw error;
    }
};

// Complete a booking (for service providers)
export const completeBooking = async (token: string, bookingId: number): Promise<Booking> => {
    try {
        const res = await fetch(`${BASE_URL}/bookings/${bookingId}/mark_completed/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Session expired. Please log in again.');
            } else if (res.status === 404) {
                throw new Error('Booking not found');
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || 'Failed to complete booking');
            }
        }

        return await res.json();
    } catch (error) {
        console.error('Complete booking error:', error);
        throw error;
    }
};

// Get services by user AND zip code 
// export const getServicesByUserAndZip = async (token: string, userId: number, zipCode: string) => {
//     try {
//         const res = await fetch(`${BASE_URL}/services/?owner_id=${userId}&zip_code=${zipCode}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Token ${token}`,
//             },
//         });

//         if (!res.ok) {
//             if (res.status === 401) {
//                 throw new Error('Session expired. Please log in again.');
//             } else if (res.status >= 500) {
//                 throw new Error('Server error. Please try again later.');
//             } else {
//                 throw new Error('Failed to load filtered services');
//             }
//         }

//         return await res.json();
//     } catch (error) {
//         console.error('Get services by user and zip error:', error);
//         throw error;
//     }
// };

// Get services by owner
export const getServicesByOwner = async (token: string, ownerId: number): Promise<Service[]> => {
  try {    
    const res = await fetch(`${BASE_URL}/services/?owner_id=${ownerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Session expired. Please log in again.');
      } else if (res.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to get services by owner');
      }
    }

    const services = await res.json();
    return services;
  } catch (error) {
    console.error('Get services by owner error:', error);
    throw error;
  }
};

// Add reviews
export const completeBookingWithReview = async (token: string, bookingId: number, rating: number, review?: string) => {
  try {
    // mark booking as completed using backend endpoint
    console.log('🎯 Step 1: Marking booking as completed...');
    const completedBooking = await completeBooking(token, bookingId);
    console.log('✅ Step 1 completed:', completedBooking);

    // add review and rating
    console.log('🎯 Step 2: Adding review and rating...');
    const reviewBody: any = { 
      customer_rating: rating,
    };
    
    if (review && review.trim()) {
      reviewBody.customer_review = review.trim();
    }

    console.log('🎯 Sending review PATCH request:', reviewBody);

    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(reviewBody),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      console.log('Error response data:', errorData);
      throw new Error(`Failed to add review: ${errorData.detail || errorData.message || 'Unknown error'}`);
    }

    const updatedBooking = await res.json();
    
    return updatedBooking;
  } catch (error) {
    console.error('Complete booking with review error:', error);
    throw error;
  }
};

