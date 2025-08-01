const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Register User
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
    bio?: string; //optional
    skills?: string; //optional
    interests?: string[]; //optional, returns array
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
        let errorMessage = 'Registration failed: ';

        if (errorData.email) {
          errorMessage = 'This email is already registered. Try logging in instead.';
        } else if (errorData.password) {
          errorMessage = `Password error: ${errorData.password[0]}`;
        } else if (errorData.street) {
          errorMessage = 'Street address is required';
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else {
          errorMessage = 'Please complete all required fields';
        }

        throw new Error(errorMessage);
      }

      throw new Error('Registration failed. Please try again.');
    }

    return await res.json();
};

// Login User
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
        throw new Error('Login failed');
    }

    return await res.json();
};

// Get user profile (requires auth token)
export const getUserProfile = async (token: string) => {
    const res = await fetch(`${BASE_URL}/accounts/profile/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to get profile');
    }

    return await res.json();
};

// Update user profile (requires auth token)
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