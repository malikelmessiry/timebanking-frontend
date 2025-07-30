import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/api";
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
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/auth');
                    return;
                }

                const profile = await getUserProfile(token);
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
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token || !formData) return;

            // Create FormData for file upload
            const updateData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    updateData.append(key, value.toString());
                }
            });

            if (avatarFile) {
                updateData.append('avatar', avatarFile);
            }

            const updatedProfile = await updateUserProfile(token, updateData);
            setUser(updatedProfile);
            setEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
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

    

}
