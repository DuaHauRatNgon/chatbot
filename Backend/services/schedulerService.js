const cron = require('node-cron');
const dailyQuotesService = require('./dailyQuotesService');

class SchedulerService {
    constructor() {
        this.jobs = new Map();
        this.isRunning = false;
    }

    // Khởi động scheduler
    start() {
        if (this.isRunning) {
            console.log('Scheduler is already running');
            return;
        }

        console.log('🚀 Starting Daily Quotes Scheduler...');

        // Job gửi quotes hàng ngày lúc 8:00 sáng
        const dailyQuotesJob = cron.schedule('0 8 * * *', async () => {
            console.log('📧 Starting daily quotes sending process...');
            try {
                const result = await dailyQuotesService.sendDailyQuotesToAllUsers();
                console.log('✅ Daily quotes sending completed:', result);
            } catch (error) {
                console.error('❌ Error in daily quotes job:', error);
            }
        }, {
            scheduled: false,
            timezone: "Asia/Ho_Chi_Minh"
        });

        // Job backup gửi quotes lúc 9:00 sáng (nếu job đầu thất bại)
        const backupQuotesJob = cron.schedule('0 9 * * *', async () => {
            console.log('📧 Starting backup daily quotes sending process...');
            try {
                const result = await dailyQuotesService.sendDailyQuotesToAllUsers();
                console.log('✅ Backup daily quotes sending completed:', result);
            } catch (error) {
                console.error('❌ Error in backup daily quotes job:', error);
            }
        }, {
            scheduled: false,
            timezone: "Asia/Ho_Chi_Minh"
        });

        // Job cleanup logs cũ (chạy hàng tuần)
        const cleanupJob = cron.schedule('0 0 * * 0', async () => {
            console.log('🧹 Starting cleanup process...');
            try {
                // Có thể thêm logic cleanup ở đây
                console.log('✅ Cleanup completed');
            } catch (error) {
                console.error('❌ Error in cleanup job:', error);
            }
        }, {
            scheduled: false,
            timezone: "Asia/Ho_Chi_Minh"
        });

        // Lưu các jobs
        this.jobs.set('dailyQuotes', dailyQuotesJob);
        this.jobs.set('backupQuotes', backupQuotesJob);
        this.jobs.set('cleanup', cleanupJob);

        // Khởi động các jobs
        dailyQuotesJob.start();
        backupQuotesJob.start();
        cleanupJob.start();

        this.isRunning = true;
        console.log('✅ Scheduler started successfully');
        console.log('📅 Daily quotes will be sent at 8:00 AM (Vietnam time)');
        console.log('🔄 Backup sending at 9:00 AM (Vietnam time)');
        console.log('🧹 Cleanup runs every Sunday at midnight');
    }

    // Dừng scheduler
    stop() {
        if (!this.isRunning) {
            console.log('Scheduler is not running');
            return;
        }

        console.log('🛑 Stopping Scheduler...');
        
        this.jobs.forEach((job, name) => {
            job.stop();
            console.log(`✅ Stopped job: ${name}`);
        });

        this.jobs.clear();
        this.isRunning = false;
        console.log('✅ Scheduler stopped successfully');
    }

    // Restart scheduler
    restart() {
        console.log('🔄 Restarting Scheduler...');
        this.stop();
        setTimeout(() => {
            this.start();
        }, 1000);
    }

    // Lấy trạng thái scheduler
    getStatus() {
        return {
            isRunning: this.isRunning,
            jobs: Array.from(this.jobs.keys()),
            nextRuns: this.getNextRuns()
        };
    }

    // Lấy thời gian chạy tiếp theo của các jobs
    getNextRuns() {
        const nextRuns = {};
        this.jobs.forEach((job, name) => {
            if (job.running) {
                nextRuns[name] = 'Running';
            } else {
                nextRuns[name] = 'Scheduled';
            }
        });
        return nextRuns;
    }

    // Chạy job ngay lập tức (cho testing)
    async runJobNow(jobName) {
        console.log(`🚀 Running ${jobName} job immediately...`);
        
        try {
            switch (jobName) {
                case 'dailyQuotes':
                    const result = await dailyQuotesService.sendDailyQuotesToAllUsers();
                    console.log('✅ Daily quotes job completed:', result);
                    return result;
                case 'backupQuotes':
                    const backupResult = await dailyQuotesService.sendDailyQuotesToAllUsers();
                    console.log('✅ Backup quotes job completed:', backupResult);
                    return backupResult;
                default:
                    throw new Error(`Unknown job: ${jobName}`);
            }
        } catch (error) {
            console.error(`❌ Error running ${jobName} job:`, error);
            throw error;
        }
    }

    // Thêm job tùy chỉnh
    addCustomJob(name, cronExpression, callback, timezone = "Asia/Ho_Chi_Minh") {
        if (this.jobs.has(name)) {
            throw new Error(`Job ${name} already exists`);
        }

        const job = cron.schedule(cronExpression, callback, {
            scheduled: false,
            timezone: timezone
        });

        this.jobs.set(name, job);
        job.start();
        
        console.log(`✅ Added custom job: ${name} with schedule: ${cronExpression}`);
        return job;
    }

    // Xóa job tùy chỉnh
    removeCustomJob(name) {
        if (!this.jobs.has(name)) {
            throw new Error(`Job ${name} does not exist`);
        }

        const job = this.jobs.get(name);
        job.stop();
        this.jobs.delete(name);
        
        console.log(`✅ Removed custom job: ${name}`);
    }
}

module.exports = new SchedulerService();
