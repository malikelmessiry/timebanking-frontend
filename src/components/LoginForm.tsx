import React, { useState } from 'react';
import { validateLoginData } from '../utilities/validation';

interface LoginFormProps {
    onSubmit: (data: { email: string; password: string }) => Promise<void>;
    switchToSignUp?: () => void;
}

export default function LoginForm({ onSubmit, switchToSignUp }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setIsLoading(true);

        const formData = { email, password };

        // Frontend validation
        const validation = validateLoginData(formData);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            setIsLoading(false);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error: any) {
            console.error('Login error:', error);
            setErrors([error.message]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="error-messages">
                    {errors.map((error, index) => (
                        <div key={index} className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    ))}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {switchToSignUp && (
                <p>
                    Don't have an account?{' '}
                    <button type="button" onClick={switchToSignUp} className="link-button">
                        Sign up here
                    </button>
                </p>
            )}
        </form>
    );
}
