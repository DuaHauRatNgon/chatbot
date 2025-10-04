import { useState } from 'react';
import { register } from '../services/yourApiFunctions';
import { User } from '../services/type';

interface UseRegisterResult {
    loading: boolean;
    error: string | null;
    registerUser: (name: string, email: string, password: string, age: number, gender: string) => Promise<User | null>;
    clearError: () => void;
}

const useRegister = (): UseRegisterResult => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const registerUser = async (
        name: string, 
        email: string, 
        password: string, 
        age: number, 
        gender: string
    ): Promise<User | null> => {
        setLoading(true);
        setError(null);

        try {
            const userData = { name, email, password, age, gender };
            const res = await register(userData); // res là toàn bộ JSON từ API

            setLoading(false);

            // Nếu server trả về lỗi
            if (res.success === false) {
                throw new Error(res.message || 'Registration failed');
            }

            return res.user; // chỉ trả user khi thành công
        } catch (error: any) {
            setLoading(false);
            const serverMessage =
                error.response?.data?.message ||
                error.message ||
                'Registration failed';
            setError(serverMessage);
            throw new Error(serverMessage); // 👈 ném lỗi để handleSubmit bắt
        }
    };


    const clearError = () => {
        setError(null);
    };

    return { loading, error, registerUser, clearError };
};

export default useRegister;