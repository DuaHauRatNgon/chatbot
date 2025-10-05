const { Quote } = require('./model/quote');

// Dữ liệu quotes mẫu
const sampleQuotes = [
    // Quotes động lực
    {
        content: "Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc là chìa khóa của thành công.",
        author: "Albert Schweitzer",
        category: "motivation",
        language: "vi"
    },
    {
        content: "Hôm nay là ngày tốt nhất để bắt đầu làm những gì bạn muốn làm.",
        author: "Unknown",
        category: "motivation",
        language: "vi"
    },
    {
        content: "Đừng bao giờ từ bỏ ước mơ chỉ vì thời gian thực hiện nó lâu hơn bạn nghĩ.",
        author: "Unknown",
        category: "motivation",
        language: "vi"
    },
    
    // Quotes thành công
    {
        content: "Thành công là tổng của những nỗ lực nhỏ được lặp lại ngày qua ngày.",
        author: "Robert Collier",
        category: "success",
        language: "vi"
    },
    {
        content: "Cách duy nhất để làm những việc tuyệt vời là yêu những gì bạn làm.",
        author: "Steve Jobs",
        category: "success",
        language: "vi"
    },
    
    // Quotes cuộc sống
    {
        content: "Cuộc sống là những gì xảy ra với bạn khi bạn đang bận làm những kế hoạch khác.",
        author: "John Lennon",
        category: "life",
        language: "vi"
    },
    {
        content: "Hãy sống như thể ngày mai bạn sẽ chết. Hãy học như thể bạn sẽ sống mãi mãi.",
        author: "Mahatma Gandhi",
        category: "life",
        language: "vi"
    },
    
    // Quotes tình yêu
    {
        content: "Tình yêu không phải là tìm kiếm người hoàn hảo, mà là học cách yêu một người không hoàn hảo một cách hoàn hảo.",
        author: "Unknown",
        category: "love",
        language: "vi"
    },
    
    // Quotes trí tuệ
    {
        content: "Trí tuệ không phải là sản phẩm của việc học mà là khả năng học suốt đời.",
        author: "Albert Einstein",
        category: "wisdom",
        language: "vi"
    },
    
    // Quotes cảm hứng
    {
        content: "Hãy là chính mình; tất cả những người khác đã có người làm rồi.",
        author: "Oscar Wilde",
        category: "inspiration",
        language: "vi"
    },
    
    // English quotes
    {
        content: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "success",
        language: "en"
    },
    {
        content: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        category: "life",
        language: "en"
    },
    {
        content: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "motivation",
        language: "en"
    },
    {
        content: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein",
        category: "wisdom",
        language: "en"
    },
    {
        content: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
        category: "inspiration",
        language: "en"
    }
];

async function seedQuotes() {
    try {
        console.log('Starting quotes seeding...');
        
        // Xóa tất cả quotes cũ (tùy chọn)
        // await Quote.deleteMany({});
        // console.log('🗑️ Cleared existing quotes');
        
        // Kiểm tra xem đã có quotes chưa
        const existingQuotes = await Quote.countDocuments();
        if (existingQuotes > 0) {
            console.log(`Found ${existingQuotes} existing quotes`);
            console.log('ℹSkipping seeding to avoid duplicates');
            return;
        }
        
        // Thêm quotes mới
        const insertedQuotes = await Quote.insertMany(sampleQuotes);
        console.log(`Successfully seeded ${insertedQuotes.length} quotes`);
        
        // Hiển thị thống kê
        const stats = await Quote.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        console.log('Quotes by category:');
        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} quotes`);
        });
        
        const languageStats = await Quote.aggregate([
            { $group: { _id: '$language', count: { $sum: 1 } } }
        ]);
        
        console.log('Quotes by language:');
        languageStats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} quotes`);
        });
        
    } catch (error) {
        console.error('Error seeding quotes:', error);
    }
}

// Chạy seeding nếu file được gọi trực tiếp
if (require.main === module) {
    require('dotenv').config();
    const mongoose = require('mongoose');
    
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot')
        .then(() => {
            console.log('Connected to MongoDB');
            return seedQuotes();
        })
        .then(() => {
            console.log('Seeding completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedQuotes, sampleQuotes };
