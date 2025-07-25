const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Register User
export const registerUser = async (data: {
    username: string;
    password: string;
    password2: string;
    email: string;
    // first_name: string;
    // last_name: string;
    city: string;
    state: string;
    zip_code: string;
    bio?: string; //optional
    skills?: string; //optional
}) => {
    const res = await fetch(`${BASE_URL}/accounts/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to register");
    }

    return await res.json();
};

// Login User
export const loginUser = async (data: {
    // email: string;
    username: string;
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
export const updateUserProfile = async (token: string, data: any) => {
    const res = await fetch(`${BASE_URL}/accounts/profile/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update profile');
    }

    return await res.json();
}