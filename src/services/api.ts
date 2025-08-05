// const BASE_URL = import.meta.env.VITE_BACKEND_URL; // deployed backend

const BASE_URL = 'http://localhost:8000' // local backend

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

// Change password


// Service Types
export interface Service {
    id: number;
    name: string;
    category: string[];
    description: string;
    tags: string[];
    credit_required: number;
    created_at: string;
    is_available: boolean;
    average_rating: number;
    total_sessions: number;
    remaining_sessions: number;
    owner: number;
    owner_email: string;
}

export interface CreateServiceData {
    name: string;
    category: string[];
    description: string;
    tags: string[];
    credit_required: number;
    total_sessions?: number;
    // is_available?: boolean;
}

// Get all services
export const getAllServices = async (token: string) => {
    try {
        const res = await fetch(`${BASE_URL}/services/`, {
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
                throw new Error('Failed to load services');
            }
        }

        return await res.json();
    } catch (error) {
        console.error('Get services error:', error);
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
        console.log('🔍 Getting my services for email:', userEmail);
        
        const allServices = await getAllServices(token);
        const myServices = allServices.filter((service: Service) => service.owner_email === userEmail);
        
        console.log('✅ Found', myServices.length, 'services for user');
        return myServices;
    } catch (error) {
        console.error('Get my services error:', error);
        throw error;
    }
};

// Get services by zip code 
export const getServicesByZipCode = async (token: string, zipCode: string) => {
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
  customer_review: string | null;
  customer_rating: number | null;
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
export const getBookings = async (token: string): Promise<Booking[]> => {
  try {
    const res = await fetch(`${BASE_URL}/bookings/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Session expired. Please log in again.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Failed to load bookings');
      }
    }

    return await res.json();
  } catch (error) {
    console.error('Get bookings error:', error);
    throw error;
  }
}

// Create a booking
export const createBooking = async (token: string, serviceId: number): Promise<Booking> => {
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
            if (res.status === 401) {
                throw new Error('Session expired. Please log in again.');
            } else if (res.status === 400) {
                const errorData = await res.json().catch(() => ({}));
                // Handle specific booking errors
                if (errorData.detail?.includes('credits')) {
                    throw new Error('Insufficient credits to book this service');
                } else if (errorData.detail?.includes('sessions')) {
                    throw new Error('No sessions available for this service');
                } else {
                    throw new Error(errorData.detail || 'Unable to book this service');
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || 'Failed to create booking');
            }
        }

        return await res.json();
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