import { useState } from 'react';
import { login } from '../services/yourApiFunctions';
import { User, AuthResponse } from '../services/type'; // Import AuthResponse

interface UseLoginResult {
    loading: boolean;
    error: string | null;
    loginUser: (email: string, password: string) => Promise<AuthResponse | null>; // Trả về Promise<AuthResponse | null>
    clearError: () => void;
}

const useLogin = (): UseLoginResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginUser = async (email: string, password: string): Promise<AuthResponse | null> => { // Trả về Promise<AuthResponse | null>
        setLoading(true);
        setError(null);

        try {
            const userData = { email, password };
            const authResponse: AuthResponse = await login(userData);  // Lưu trữ AuthResponse
            setLoading(false);
            return authResponse; // Trả về AuthResponse

        } catch (error: any) {
            setLoading(false);
            setError(error.message || 'Login failed');
            return null;
        }
    };

    const clearError = () => {
        setError(null);
    };

    return { loading, error, loginUser, clearError };
};

export default useLogin;