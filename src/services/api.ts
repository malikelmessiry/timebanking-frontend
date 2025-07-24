const BASE_URL = "https://localhost:8000/api"; //change as needed

export const registerUser = async (data: { username: string; password: string }) => {
    const res = await fetch(`${BASE_URL}/register/`, {
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