import React, { useState } from 'react';
import useLogin from '../../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

// import { User, AuthResponse } from '../../services/type';  // Import User và AuthResponse

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
    const { loading, error, loginUser, clearError } = useLogin();
    const navigate = useNavigate();

    
    if (!isOpen) return null;

    // Function để validate từng field
    const validateEmail = (email: string): string => {
        if (!email.trim()) {
            return 'Vui lòng nhập email';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Email không đúng định dạng (ví dụ: user@example.com)';
        }
        return '';
    };

    const validatePassword = (password: string): string => {
        if (!password.trim()) {
            return 'Vui lòng nhập mật khẩu';
        }
        if (password.length < 6) {
            return 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        return '';
    };

    // Function để format error message từ server
    const getErrorMessage = (error: any): string => {
        if (typeof error === 'string') {
            return error;
        }
        
        if (error?.response?.data?.message) {
            return error.response.data.message;
        }
        
        if (error?.response?.data?.error) {
            return error.response.data.error;
        }
        
        if (error?.message) {
            return error.message;
        }
        
        if (error?.response?.status) {
            switch (error.response.status) {
                case 400:
                    return '❌ Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại email và mật khẩu.';
                case 401:
                    return '❌ Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.';
                case 403:
                    return '❌ Tài khoản của bạn đã bị khóa. Liên hệ quản trị viên để được hỗ trợ.';
                case 404:
                    return '❌ Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.';
                case 422:
                    return '❌ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đăng nhập.';
                case 429:
                    return '⏰ Quá nhiều lần thử đăng nhập. Vui lòng chờ vài phút và thử lại.';
                case 500:
                    return '🔧 Lỗi hệ thống. Vui lòng thử lại sau ít phút.';
                case 503:
                    return '🔧 Dịch vụ tạm thời bảo trì. Vui lòng thử lại sau.';
                default:
                    return `❌ Đã xảy ra lỗi (${error.response.status}). Vui lòng thử lại.`;
            }
        }
        
        return '❌ Có lỗi không xác định. Vui lòng kiểm tra kết nối mạng và thử lại.';
    };

    // Function để validate form realtime
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        
        // Clear previous errors
        setFieldErrors(prev => ({ ...prev, email: '' }));
        setLocalError('');
        setSuccessMessage('');
        
        // Validate email realtime (chỉ khi user đã nhập xong)
        if (value && value.length > 0) {
            const error = validateEmail(value);
            if (!error && value.includes('@')) {
                setFieldErrors(prev => ({ ...prev, email: '✅ Email hợp lệ' }));
            }
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        
        // Clear previous errors
        setFieldErrors(prev => ({ ...prev, password: '' }));
        setLocalError('');
        setSuccessMessage('');
        
        // Validate password realtime
        if (value && value.length > 0) {
            if (value.length >= 6) {
                setFieldErrors(prev => ({ ...prev, password: '✅ Mật khẩu hợp lệ' }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Ngăn event bubbling
        
        setLocalError('');
        setSuccessMessage('');
        clearError();

        // Validate form trước khi submit
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError || passwordError) {
            setFieldErrors({
                email: emailError ? `❌ ${emailError}` : '',
                password: passwordError ? `❌ ${passwordError}` : ''
            });
            setLocalError('❌ Vui lòng sửa các lỗi trên trước khi tiếp tục');
            return; // Dừng lại, không gọi API
        }

        // Set success validation
        setFieldErrors({
            email: '✅ Email hợp lệ',
            password: '✅ Mật khẩu hợp lệ'
        });

        try {
            const authResponse = await loginUser(email, password);    
            
            
            if (authResponse && authResponse.token) {
                // Hiển thị thông báo thành công
                setSuccessMessage('✅ Đăng nhập thành công! Đang chuyển hướng...');
                setFieldErrors({ email: '', password: '' });
                
                // Xử lý đăng nhập thành công
                localStorage.setItem('token', authResponse.token);
                localStorage.setItem('user', JSON.stringify(authResponse.user));
                
                // Delay để user thấy thông báo thành công
                setTimeout(() => {
                    // Reset form
                    setEmail('');
                    setPassword('');
                    setLocalError('');
                    setSuccessMessage('');
                    setFieldErrors({ email: '', password: '' });
                    onClose();
                    // Chuyển hướng
                    window.location.href = "/";
                }, 1500);
            } else {
                // Nếu loginUser trả về null/undefined nhưng không throw error
                setLocalError('❌ Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
                setSuccessMessage('');
                setFieldErrors({ 
                    email: '❌ Kiểm tra lại email', 
                    password: '❌ Kiểm tra lại mật khẩu' 
                });
                // KHÔNG đóng modal
            }
        } catch (err) {
            console.error("Login Failed - Error caught:", err); // Debug log
            
            // Ngăn chặn mọi hành vi mặc định có thể gây reload trang
            if (e && e.preventDefault) e.preventDefault();
            if (e && e.stopPropagation) e.stopPropagation();
            
            const errorMessage = getErrorMessage(err);
            setLocalError(errorMessage);
            setSuccessMessage('');
            
            // Highlight các field bị lỗi
            setFieldErrors({ 
                email: '❌ Email hoặc mật khẩu không chính xác', 
                password: '❌ Email hoặc mật khẩu không chính xác' 
            });
            
            // QUAN TRỌNG: KHÔNG đóng modal, KHÔNG reload trang
            // Modal sẽ vẫn mở để user có thể sửa lại thông tin
        }
    };

    // Lấy error message để hiển thị
    const displayError = localError || (error ? getErrorMessage(error) : '');

    const handleClose = () => {
        setLocalError('');
        setSuccessMessage('');
        setFieldErrors({ email: '', password: '' });
        clearError();
        onClose();
    };

    const handleSwitchToRegister = () => {
        setLocalError('');
        setSuccessMessage('');
        setFieldErrors({ email: '', password: '' });
        clearError();
        onSwitchToRegister();
    };

    // Ngăn chặn modal đóng khi click vào overlay nếu đang có lỗi
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !displayError) {
            handleClose();
        } else if (displayError) {
            // console.log('Modal close blocked due to error state'); // Debug log
        }
    };

    return (
        <div id="loginModal" className="fixed inset-0 z-50 overflow-y-auto" onClick={handleOverlayClick}>
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl leading-6 font-bold text-gray-900">Đăng nhập</h3>
                                    <button 
                                        onClick={handleClose} 
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                        aria-label="Đóng modal"
                                    >
                                        <svg 
                                            className="w-6 h-6" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M6 18L18 6M6 6l12 12" 
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <form onSubmit={handleSubmit}>
                                        {/* Success Message */}
                                        {successMessage && (
                                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-green-800 font-medium">
                                                            {successMessage}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Error Message */}
                                        {displayError && !successMessage && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-red-800 font-medium">
                                                            {displayError}
                                                        </p>
                                                    </div>
                                                    <div className="ml-auto pl-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLocalError('');
                                                                setFieldErrors({ email: '', password: '' });
                                                                clearError();
                                                            }}
                                                            className="inline-flex text-red-400 hover:text-red-600"
                                                        >
                                                            <span className="sr-only">Đóng</span>
                                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                                    fieldErrors.email.includes('❌') 
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                        : fieldErrors.email.includes('✅')
                                                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                }`}
                                                placeholder="Nhập email của bạn"
                                                value={email}
                                                onChange={handleEmailChange}
                                                required
                                            />
                                            {fieldErrors.email && (
                                                <p className={`mt-1 text-xs ${
                                                    fieldErrors.email.includes('❌') ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {fieldErrors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Mật khẩu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                id="password"
                                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                                    fieldErrors.password.includes('❌') 
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                                        : fieldErrors.password.includes('✅')
                                                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                }`}
                                                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                                value={password}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                            {fieldErrors.password && (
                                                <p className={`mt-1 text-xs ${
                                                    fieldErrors.password.includes('❌') ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {fieldErrors.password}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <input
                                                    id="remember-me"
                                                    name="remember-me"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Ghi nhớ đăng nhập</label>
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                                                    successMessage 
                                                        ? 'bg-green-600 hover:bg-green-700' 
                                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                                }`}
                                                disabled={loading || !!successMessage}
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Đang đăng nhập...
                                                    </>
                                                ) : 'Đăng nhập'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <p className="text-sm text-gray-500 text-center">
                            Chưa có tài khoản?
                            <button onClick={handleSwitchToRegister} className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                                Đăng ký ngay
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;