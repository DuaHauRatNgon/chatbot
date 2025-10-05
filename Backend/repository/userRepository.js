
const User = require('../model/User'); // Giả sử bạn có model User

class UserRepository {

    async register(userData) {
        try {
            const { email, hashedPassword, name, age, gender, role } = userData;

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return {
                    success: false,
                    message: 'Tài khoản đã tồn tại',
                    user: userData
                };
            }
            // Tạo user mới
            const newUser = new User({
                email,
                hashedPassword,
                name,
                age,
                gender,
                role,
                createdAt: new Date()
            });

            // Lưu vào database
            const savedUser = await newUser.save();

            return {
                success: true,
                message: 'Đăng ký thành công',
                user: savedUser
            };

        } catch (error) {
            throw new Error(error.message || 'Lỗi khi đăng ký tài khoản');
        }
    }

    async login(email) {
        try {

            // Tìm user theo email
            const user = await User.findOne({email });
            if (!user) {
                return {
                    success: false,
                    message: 'Sai email',
                    user: null
                };
            }

            return {
                success: true,
                message: 'Đăng nhập thành công',
                user
            };

        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi đăng nhập',
            };
        }
    }

    async getUserById(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return null;
            }
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            return null;
        }
    }

    async getAllUsers() {
        try {
            const users = await User.find({}, { hashedPassword: 0 }); // Loại bỏ password
            return users;
        } catch (error) {
            console.error('Error getting all users:', error);
            return [];
        }
    }
}

module.exports = new UserRepository();