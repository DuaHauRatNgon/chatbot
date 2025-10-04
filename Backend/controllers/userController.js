const userService = require('../services/userService');

class UserController {
    
    async register(req, res) {
        try {
            const { email, password, name, age, gender, role } = req.body;

            // Validate required fields
            if (!email || !password || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, mật khẩu và tên là bắt buộc'
                });
            }

            // Validate email format
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email không hợp lệ'
                });
            }

            // Validate password length
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự'
                });
            }

            // Validate age if provided
            if (age && (age < 1 || age > 120)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tuổi không hợp lệ'
                });
            }

            // Validate gender if provided
            if (gender && !['male', 'female'].includes(gender)) {
                return res.status(400).json({
                    success: false,
                    message: 'Giới tính chỉ có thể là male hoặc female'
                });
            }

            const userData = { email, password, name, age, gender, role };
            const result = await userService.register(userData);

            if (result.success) {
                return res.status(201).json({
                    success: true,
                    message: result.message,
                    user: {
                        id: result.user._id,
                        email: result.user.email,
                        name: result.user.name,
                        age: result.user.age,
                        gender: result.user.gender,
                        createdAt: result.user.createdAt
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Lỗi register controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email và mật khẩu là bắt buộc'
                });
            }
            // Validate email format
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email không hợp lệ'
                });
            }

            const loginData = { email, password };
            const result = await userService.login(loginData);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    token: result.token,
                    user: {
                        id: result.user.user._id,
                        email: result.user.user.email,
                        name: result.user.user.name,
                        age: result.user.user.age,
                        gender: result.user.user.gender
                    }
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Lỗi login controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }

    // Method để lấy thông tin user hiện tại (protected route)
    async getCurrentUser(req, res) {
        try {
            // Thông tin user sẽ được lấy từ middleware xác thực JWT
            const user = req.user;

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin user thành công',
                user: {
                    id: user.userId,
                    email: user.email,
                    age: user.age,
                    gender: user.gender
                }
            });

        } catch (error) {
            console.error('Lỗi getCurrentUser controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
}

module.exports = new UserController();