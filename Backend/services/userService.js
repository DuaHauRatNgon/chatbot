const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repository/userRepository");
const emailService = require("./emailService");

class UserService {
  async register(userData) {
    try {
      const { email, password, name, age, gender, role } = userData;
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = await userRepository.register({
        email,
        hashedPassword,
        name,
        age,
        gender,
        role,
      });

      // Nếu đăng ký thành công, gửi email chào mừng
      if (result.success && result.user) {
        try {
          await emailService.sendWelcomeEmail(result.user.email, result.user.name);
          console.log(`Welcome email sent to ${result.user.email}`);
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Không throw error để không ảnh hưởng đến quá trình đăng ký
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: "Lỗi server",
        user: null,
      };
    }
  }

  async login(loginData) {
    try {
      const { email, password } = loginData;

      const result = await userRepository.login(email);
      if (!result.success) {
        return result;
      }
      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(
        password,
        result.user.hashedPassword
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Sai mật khẩu",
          user: result,
        };
      }
      // Tạo JWT token
      const token = jwt.sign(
        {
          userId: result.user._id,
          email: result.user.email,
          age: result.user.age,
          gender: result.user.gender,
          role: result.user.role,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "30d" }
      );
      delete result.user.hashedPassword;
      return {
        success: true,
        message: "Đăng nhập thành công",
        token,
        user: result,
      };
    } catch (error) {
      throw new Error(error.message || "Lỗi khi đăng nhập");
    }
  }
}

module.exports = new UserService();
