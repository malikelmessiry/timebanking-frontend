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


