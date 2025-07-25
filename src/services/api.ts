const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const registerUser = async (data: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
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

    return res.json();
};