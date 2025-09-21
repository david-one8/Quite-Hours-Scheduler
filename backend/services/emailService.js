const nodemailer = require('nodemailer');
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendStudyReminder(userEmail, userName, studyTopic, studyTime, description) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `📚 Study Reminder - ${studyTopic} in 10 minutes!`,
      html: this.generateReminderHTML(userName, studyTopic, studyTime, description)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Reminder email sent to ${userEmail} for ${studyTopic}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Error sending email to ${userEmail}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  generateReminderHTML(userName, studyTopic, studyTime, description) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Study Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <div style="background-color: white; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">📚</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Study Time Reminder</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px; font-size: 24px;">Hello ${userName}! 👋</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
              This is a friendly reminder that your silent study session is starting in <strong style="color: #667eea;">10 minutes</strong>!
            </p>
            
            <!-- Study Details Card -->
            <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 25px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 20px; display: flex; align-items: center;">
                📖 Study Topic
              </h3>
              <p style="color: #4a5568; font-size: 18px; font-weight: 600; margin: 0 0 15px;">${studyTopic}</p>
              
              <h3 style="color: #2d3748; margin: 15px 0 10px; font-size: 16px; display: flex; align-items: center;">
                ⏰ Scheduled Time
              </h3>
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 15px;">${studyTime}</p>
              
              ${description ? `
              <h3 style="color: #2d3748; margin: 15px 0 10px; font-size: 16px; display: flex; align-items: center;">
                📝 Notes
              </h3>
              <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.5;">${description}</p>
              ` : ''}
            </div>
            
            <!-- Motivational Message -->
            <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="color: #2d3748; font-size: 16px; margin: 0; font-weight: 500;">
                🎯 Get ready to focus and make the most of your study session!
              </p>
            </div>
            
            <!-- Tips Section -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; font-size: 18px; margin: 0 0 15px;">💡 Quick Study Tips:</h3>
              <ul style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Turn off notifications on your devices</li>
                <li>Keep a water bottle nearby</li>
                <li>Have all your study materials ready</li>
                <li>Set a comfortable room temperature</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #edf2f7; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px; margin: 0 0 10px;">
              Good luck with your studies! 🌟
            </p>
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              Sent by Study Reminder System • ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
