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
}