const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Packwell Plastic Industries" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Packwell Plastic Industries',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Packwell Plastic Industries!</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for registering with us. We're excited to have you as our customer!</p>
        <p>You can now browse our wide range of plastic products and place orders.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <br>
        <p>Best regards,<br>Packwell Plastic Industries Team</p>
      </div>
    `
  }),

  orderConfirmation: (orderNumber, userName, items, totalAmount) => ({
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmed!</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for your order. We have received your order and will process it shortly.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
        <h3>Order Items:</h3>
        <ul>
          ${items.map(item => `<li>${item.name} x ${item.quantity} - ₹${item.price}</li>`).join('')}
        </ul>
        <p>We will send you another email when your order is shipped.</p>
        <br>
        <p>Best regards,<br>Packwell Plastic Industries Team</p>
      </div>
    `
  }),

  orderShipped: (orderNumber, userName, trackingNumber) => ({
    subject: `Your Order Has Been Shipped - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Order Shipped!</h2>
        <p>Dear ${userName},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p>You can track your package using the tracking number above.</p>
        <br>
        <p>Best regards,<br>Packwell Plastic Industries Team</p>
      </div>
    `
  }),

  orderDelivered: (orderNumber, userName) => ({
    subject: `Order Delivered - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Order Delivered!</h2>
        <p>Dear ${userName},</p>
        <p>Your order has been successfully delivered.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p>We hope you're satisfied with your purchase. Please consider leaving a review to help other customers.</p>
        <br>
        <p>Best regards,<br>Packwell Plastic Industries Team</p>
      </div>
    `
  }),

  passwordReset: (userName, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Dear ${userName},</p>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>
        <p><a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Packwell Plastic Industries Team</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
