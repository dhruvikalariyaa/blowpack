const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
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
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env file');
      return { success: false, error: 'Email configuration missing' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"blowpack Plastic Industries" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to blowpack Plastic Industries',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to blowpack Plastic Industries!</h2>
        <p>Dear ${userName},</p>
        <p>Thank you for registering with us. We're excited to have you as our customer!</p>
        <p>You can now browse our wide range of plastic products and place orders.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <br>
        <p>Best regards,<br>blowpack Plastic Industries Team</p>
      </div>
    `
  }),

  orderConfirmation: (orderNumber, userName, items, totalAmount) => ({
    subject: `🎉 Order Confirmation - ${orderNumber} | blowpack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">blowpack Plastic Industries</h1>
            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #10b981; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                ✅ Order Confirmed!
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Thank You for Your Order!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${userName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">We have successfully received your order and it's being prepared for processing. You'll receive another email once your order is shipped.</p>

            <!-- Order Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📋 Order Details</h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Order Number:</span>
                <span style="color: #1f2937; font-weight: 700; font-size: 18px;">${orderNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Total Amount:</span>
                <span style="color: #059669; font-weight: 700; font-size: 20px;">₹${totalAmount}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #6b7280; font-weight: 600;">Order Date:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <!-- Order Items -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">🛍️ Order Items</h3>
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${items.map((item, index) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; ${index !== items.length - 1 ? 'border-bottom: 1px solid #f3f4f6;' : ''}">
                    <div>
                      <div style="color: #1f2937; font-weight: 600; font-size: 16px;">${item.name}</div>
                      <div style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="color: #059669; font-weight: 700; font-size: 16px;">₹${item.price * item.quantity}</div>
                      <div style="color: #6b7280; font-size: 14px;">₹${item.price} each</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📬 What's Next?</h4>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>We'll process your order within 1-2 business days</li>
                <li>You'll receive a shipping notification with tracking details</li>
                <li>Your order will be delivered within 3-5 business days</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Need help? Contact our support team</p>
              <p style="color: #1f2937; margin: 0; font-weight: 600;">📞 +91 9876543210 | 📧 support@blowpackplastic.com</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 blowpack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderConfirmed: (orderNumber, userName) => ({
    subject: `✅ Order Confirmed - ${orderNumber} | blowpack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">blowpack Plastic Industries</h1>
            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #2563eb; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                ✅ Order Confirmed!
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Great News!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${userName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Your order has been confirmed and is now being prepared for processing. Our team will start working on your order immediately.</p>

            <!-- Order Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📋 Order Details</h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Order Number:</span>
                <span style="color: #1f2937; font-weight: 700; font-size: 18px;">${orderNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #6b7280; font-weight: 600;">Confirmed Date:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📬 What's Next?</h4>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>We'll start processing your order within 24 hours</li>
                <li>You'll receive a processing notification once we begin</li>
                <li>Your order will be shipped within 2-3 business days</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help? Contact Us</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 9876543210</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #1f2937; font-weight: 600;">support@blowpackplastic.com</div>
                </div>
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                <div>📍 Address: 123 Industrial Area, Ahmedabad, Gujarat - 380001</div>
                <div>🕒 Business Hours: Mon-Sat 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 blowpack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderProcessing: (orderNumber, userName) => ({
    subject: `🔄 Order Processing - ${orderNumber} | blowpack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Processing</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">blowpack Plastic Industries</h1>
            <p style="color: #e9d5ff; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #7c3aed; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                🔄 Order Processing!
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">We're Working on Your Order!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${userName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Great news! Your order is now being processed and prepared for shipment. Our team is carefully handling your items with the utmost care.</p>

            <!-- Order Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📋 Order Details</h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Order Number:</span>
                <span style="color: #1f2937; font-weight: 700; font-size: 18px;">${orderNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #6b7280; font-weight: 600;">Processing Started:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <!-- Processing Steps -->
            <div style="background-color: #faf5ff; border-left: 4px solid #7c3aed; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 16px;">🔄 What We're Doing:</h4>
              <ul style="color: #7c3aed; margin: 0; padding-left: 20px;">
                <li>Quality checking all items</li>
                <li>Carefully packaging your order</li>
                <li>Preparing shipping labels</li>
                <li>Coordinating with our logistics team</li>
              </ul>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📬 What's Next?</h4>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>You'll receive a shipping notification with tracking details</li>
                <li>Your order will be dispatched within 24-48 hours</li>
                <li>Expected delivery: 3-5 business days</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help? Contact Us</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 9876543210</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #1f2937; font-weight: 600;">support@blowpackplastic.com</div>
                </div>
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                <div>📍 Address: 123 Industrial Area, Ahmedabad, Gujarat - 380001</div>
                <div>🕒 Business Hours: Mon-Sat 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 blowpack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderShipped: (orderNumber, userName, trackingNumber) => ({
    subject: `🚚 Order Shipped - ${orderNumber} | blowpack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">blowpack Plastic Industries</h1>
            <p style="color: #dcfce7; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #16a34a; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                🚚 Order Shipped!
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Your Order is On the Way!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${userName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Excellent news! Your order has been shipped and is now on its way to you. You can track your package using the tracking information below.</p>

            <!-- Order Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📋 Order Details</h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Order Number:</span>
                <span style="color: #1f2937; font-weight: 700; font-size: 18px;">${orderNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Tracking Number:</span>
                <span style="color: #16a34a; font-weight: 700; font-size: 18px;">${trackingNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #6b7280; font-weight: 600;">Shipped Date:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <!-- Tracking Info -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #16a34a; margin: 0 0 15px 0; font-size: 16px;">📦 Track Your Package:</h4>
              <div style="color: #16a34a; margin-bottom: 10px;">
                <strong>Tracking Number:</strong> ${trackingNumber}
              </div>
              <div style="color: #16a34a; margin-bottom: 10px;">
                <strong>Expected Delivery:</strong> 3-5 business days
              </div>
              <div style="color: #16a34a;">
                <strong>Carrier:</strong> Professional Logistics Partner
              </div>
            </div>

            <!-- Delivery Info -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📬 Delivery Information:</h4>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Your package will be delivered to the address provided during checkout</li>
                <li>Please ensure someone is available to receive the package</li>
                <li>If you're not available, the delivery partner will attempt delivery again</li>
                <li>You can contact the delivery partner directly using the tracking number</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help? Contact Us</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 9876543210</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #1f2937; font-weight: 600;">support@blowpackplastic.com</div>
                </div>
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                <div>📍 Address: 123 Industrial Area, Ahmedabad, Gujarat - 380001</div>
                <div>🕒 Business Hours: Mon-Sat 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 blowpack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderDelivered: (orderNumber, userName) => ({
    subject: `🎉 Order Delivered - ${orderNumber} | blowpack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">blowpack Plastic Industries</h1>
            <p style="color: #d1fae5; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #059669; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                🎉 Order Delivered!
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Your Order Has Arrived!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${userName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Fantastic news! Your order has been successfully delivered. We hope you're completely satisfied with your purchase and the quality of our plastic products.</p>

            <!-- Order Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📋 Order Details</h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Order Number:</span>
                <span style="color: #1f2937; font-weight: 700; font-size: 18px;">${orderNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #6b7280; font-weight: 600;">Delivered Date:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <!-- Review Request -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">⭐ We Value Your Feedback!</h4>
              <p style="color: #92400e; margin: 0 0 10px 0;">Your experience matters to us and helps other customers make informed decisions.</p>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Please rate your experience with our products</li>
                <li>Share your thoughts about product quality</li>
                <li>Help us improve our services</li>
                <li>Your review will be visible to other customers</li>
              </ul>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🛍️ What's Next?</h4>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Check all items for any damage or defects</li>
                <li>Contact us immediately if you have any concerns</li>
                <li>Consider leaving a review to help other customers</li>
                <li>Explore our latest products for future purchases</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help? Contact Us</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 9876543210</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #1f2937; font-weight: 600;">support@blowpackplastic.com</div>
                </div>
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                <div>📍 Address: 123 Industrial Area, Ahmedabad, Gujarat - 380001</div>
                <div>🕒 Business Hours: Mon-Sat 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 blowpack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderCompleted: (orderNumber, userName) => ({
    subject: `🏆 Order Completed - ${orderNumber} | blowpack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Completed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">blowpack Plastic Industries</h1>
            <p style="color: #fed7aa; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #ea580c; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                🏆 Order Completed!
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Thank You for Your Business!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${userName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Congratulations! Your order has been successfully completed and closed. We're thrilled that you chose blowpack Plastic Industries for your plastic product needs, and we hope you're completely satisfied with your purchase.</p>

            <!-- Order Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📋 Order Details</h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Order Number:</span>
                <span style="color: #1f2937; font-weight: 700; font-size: 18px;">${orderNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #6b7280; font-weight: 600;">Completed Date:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <!-- Thank You Message -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">🙏 We Appreciate Your Trust!</h4>
              <p style="color: #92400e; margin: 0 0 10px 0;">Your satisfaction is our priority, and we're committed to providing you with the highest quality plastic products.</p>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>We hope you're delighted with your purchase</li>
                <li>Your feedback helps us improve our services</li>
                <li>We look forward to serving you again</li>
                <li>Thank you for choosing blowpack Plastic Industries</li>
              </ul>
            </div>

            <!-- Future Purchases -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">🛍️ Ready for Your Next Order?</h4>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Explore our latest product catalog</li>
                <li>Check out our seasonal offers and discounts</li>
                <li>Follow us for product updates and news</li>
                <li>Contact us for custom plastic solutions</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help? Contact Us</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 9876543210</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #1f2937; font-weight: 600;">support@blowpackplastic.com</div>
                </div>
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                <div>📍 Address: 123 Industrial Area, Ahmedabad, Gujarat - 380001</div>
                <div>🕒 Business Hours: Mon-Sat 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 blowpack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderCancelled: (orderNumber, userName, reason) => ({
    subject: `Order Cancelled - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Order Cancelled</h2>
        <p>Dear ${userName},</p>
        <p>We regret to inform you that your order has been cancelled.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Reason:</strong> ${reason || 'Order cancelled by admin'}</p>
        <p>If you have any questions about this cancellation or would like to place a new order, please contact our support team.</p>
        <br>
        <p>Best regards,<br>blowpack Plastic Industries Team</p>
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
        <p>Best regards,<br>blowpack Plastic Industries Team</p>
      </div>
    `
  }),

  emailVerification: (userName, otp) => ({
    subject: '📧 Verify Your Email Address - blowpack Plastic Industries',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">blowpack Plastic Industries</h1>
            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #3b82f6; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                📧 Email Verification
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Verify Your Email Address</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${userName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for registering with blowpack Plastic Industries! To complete your account setup and ensure you receive important updates about your orders, please verify your email address using the verification code below.</p>

            <!-- OTP Code Card -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <h3 style="color: #ffffff; font-size: 20px; margin: 0 0 20px 0;">Your Verification Code</h3>
              <div style="background-color: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff;">${otp}</div>
              </div>
              <p style="color: #e0e7ff; margin: 0; font-size: 14px;">This code will expire in 10 minutes</p>
            </div>

            <!-- Instructions -->
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📝 How to Verify:</h4>
              <ol style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Go to your profile page in the app</li>
                <li>Click on "Verify Now" button</li>
                <li>Enter the 6-digit code shown above</li>
                <li>Click "Verify Email" to complete the process</li>
              </ol>
            </div>

            <!-- Security Note -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">🔒 Security Note:</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Never share this verification code with anyone</li>
                <li>Our team will never ask for your verification code</li>
                <li>If you didn't request this verification, please ignore this email</li>
                <li>The code will automatically expire after 10 minutes</li>
              </ul>
            </div>

            <!-- Benefits -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #065f46; margin: 0 0 15px 0; font-size: 16px;">✅ Benefits of Verified Email:</h4>
              <ul style="color: #065f46; margin: 0; padding-left: 20px;">
                <li>Receive order confirmations and updates</li>
                <li>Get shipping notifications and tracking details</li>
                <li>Access to exclusive offers and promotions</li>
                <li>Secure password reset functionality</li>
                <li>Important account security alerts</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Need help? Contact our support team</p>
              <p style="color: #1f2937; margin: 0; font-weight: 600;">📞 +91 9876543210 | 📧 support@blowpackplastic.com</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 blowpack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  newOrderNotification: (order, user, orderItems) => ({
    subject: `🚨 New Order Received - ${order.orderNumber} | blowpack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🚨 New Order Alert!</h1>
            <p style="color: #fecaca; margin: 5px 0 0 0; font-size: 16px;">blowpack Plastic Industries</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #dc2626; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                ⚡ Action Required
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">New Order Requires Processing</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">A new order has been placed and requires immediate attention from the admin team.</p>

            <!-- Order Summary Card -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
              <h3 style="color: #ffffff; font-size: 20px; margin: 0 0 20px 0;">📋 Order Summary</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                  <div style="color: #e0e7ff; font-size: 14px; margin-bottom: 5px;">Order Number</div>
                  <div style="color: #ffffff; font-size: 18px; font-weight: 700;">${order.orderNumber}</div>
                </div>
                <div>
                  <div style="color: #e0e7ff; font-size: 14px; margin-bottom: 5px;">Total Amount</div>
                  <div style="color: #ffffff; font-size: 18px; font-weight: 700;">₹${order.totalAmount}</div>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <div style="color: #e0e7ff; font-size: 14px; margin-bottom: 5px;">Order Date</div>
                  <div style="color: #ffffff; font-size: 16px; font-weight: 600;">${new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div>
                  <div style="color: #e0e7ff; font-size: 14px; margin-bottom: 5px;">Payment Method</div>
                  <div style="color: #ffffff; font-size: 16px; font-weight: 600;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">👤 Customer Information</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Customer Name</div>
                  <div style="color: #1f2937; font-size: 16px; font-weight: 600;">${user.name}</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #1f2937; font-size: 16px; font-weight: 600;">${user.email}</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #1f2937; font-size: 16px; font-weight: 600;">${user.phone || 'Not provided'}</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Order Time</div>
                  <div style="color: #1f2937; font-size: 16px; font-weight: 600;">${new Date(order.createdAt).toLocaleTimeString('en-IN')}</div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #0c4a6e; font-size: 20px; margin: 0 0 20px 0; text-align: center;">🚚 Shipping Address</h3>
              
              <div style="color: #0c4a6e; font-size: 16px; line-height: 1.6;">
                <div style="font-weight: 600; margin-bottom: 5px;">${order.shippingAddress.name}</div>
                <div style="margin-bottom: 5px;">${order.shippingAddress.address}</div>
                <div style="margin-bottom: 5px;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</div>
                <div style="font-weight: 600;">📞 ${order.shippingAddress.phone}</div>
              </div>
            </div>

            <!-- Order Items Table -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">🛍️ Order Items</h3>
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white;">
                      <th style="padding: 15px; text-align: left; font-weight: 600;">Product</th>
                      <th style="padding: 15px; text-align: center; font-weight: 600;">Qty</th>
                      <th style="padding: 15px; text-align: right; font-weight: 600;">Price</th>
                      <th style="padding: 15px; text-align: right; font-weight: 600;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItems.map((item, index) => `
                      <tr style="${index % 2 === 0 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;'}">
                        <td style="padding: 15px; color: #1f2937; font-weight: 600;">${item.name}</td>
                        <td style="padding: 15px; text-align: center; color: #4b5563;">${item.quantity}</td>
                        <td style="padding: 15px; text-align: right; color: #4b5563;">₹${item.price}</td>
                        <td style="padding: 15px; text-align: right; color: #059669; font-weight: 600;">₹${item.price * item.quantity}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr style="background-color: #f3f4f6; font-weight: bold;">
                      <td colspan="3" style="padding: 15px; text-align: right; color: #6b7280;">Subtotal:</td>
                      <td style="padding: 15px; text-align: right; color: #1f2937;">₹${order.subtotal}</td>
                    </tr>
                    <tr style="background-color: #f3f4f6; font-weight: bold;">
                      <td colspan="3" style="padding: 15px; text-align: right; color: #6b7280;">Shipping:</td>
                      <td style="padding: 15px; text-align: right; color: #1f2937;">${order.shippingCharges === 0 ? 'Free' : `₹${order.shippingCharges}`}</td>
                    </tr>
                    <tr style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; font-weight: bold;">
                      <td colspan="3" style="padding: 15px; text-align: right;">Total:</td>
                      <td style="padding: 15px; text-align: right;">₹${order.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            ${order.notes ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📝 Customer Notes:</h4>
                <p style="color: #92400e; margin: 0; font-style: italic;">"${order.notes}"</p>
              </div>
            ` : ''}

            <!-- Action Required -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
              <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 20px;">⚡ Action Required</h3>
              <p style="color: #fecaca; margin: 0 0 20px 0; font-size: 16px;">Please process this order as soon as possible. Customer has been notified of the order confirmation.</p>
              <a href="${process.env.FRONTEND_URL}/admin/orders" style="background-color: #ffffff; color: #dc2626; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">View Orders in Admin Panel</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 blowpack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">This is an automated notification from the blowpack Plastic Industries system.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderCompletedNotification: (order, user, orderItems) => ({
    subject: `Order Completed - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Order Completed Successfully!</h2>
        <p>Dear Team,</p>
        <p>An order has been successfully completed and closed by the admin.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
          <p><strong>Completed Date:</strong> ${new Date(order.completedAt).toLocaleDateString('en-IN')}</p>
          <p><strong>Completed Time:</strong> ${new Date(order.completedAt).toLocaleTimeString('en-IN')}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Customer Information</h3>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #e5e7eb;">
                <th style="padding: 10px; text-align: left; border: 1px solid #d1d5db;">Product</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #d1d5db;">Qty</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">Price</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #d1d5db;">${item.name}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #d1d5db;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">₹${item.price}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #e5e7eb; font-weight: bold;">
                <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">Subtotal:</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">₹${order.subtotal}</td>
              </tr>
              <tr style="background-color: #e5e7eb; font-weight: bold;">
                <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">Shipping:</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">${order.shippingCharges === 0 ? 'Free' : `₹${order.shippingCharges}`}</td>
              </tr>
              <tr style="background-color: #059669; color: white; font-weight: bold;">
                <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">Total:</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">₹${order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #065f46; margin: 0; font-weight: bold;">
            ✅ Order has been successfully completed and closed. Customer has been notified.
          </p>
        </div>

        <p>This order is now marked as completed in the system.</p>
        <p>Admin Panel: <a href="${process.env.FRONTEND_URL}/admin/orders" style="color: #2563eb;">View Orders</a></p>
        
        <br>
        <p>Best regards,<br>blowpack Plastic Industries System</p>
      </div>
    `
  }),

  // Contact Form Email Templates
  contactFormConfirmation: (contactData) => ({
    subject: `✅ Thank You for Contacting Us - ${contactData.subject} | Blow Pack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Blow Pack Plastic Industries</h1>
            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #10b981; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                ✅ Message Received!
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Thank You for Contacting Us!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${contactData.firstName} ${contactData.lastName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">We have successfully received your message and our team will get back to you within 24 hours. We appreciate your interest in our plastic products and services.</p>

            <!-- Message Details Card -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📋 Your Message Details</h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Subject:</span>
                <span style="color: #1f2937; font-weight: 600;">${contactData.subject}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 600;">Submitted:</span>
                <span style="color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              
              <div style="margin-top: 20px;">
                <div style="color: #6b7280; font-weight: 600; margin-bottom: 10px;">Your Message:</div>
                <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; color: #1f2937; line-height: 1.6;">
                  ${contactData.message}
                </div>
              </div>
            </div>

            <!-- What's Next -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📬 What Happens Next?</h4>
              <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Our team will review your message within 24 hours</li>
                <li>We'll respond to your inquiry via email or phone</li>
                <li>If you have urgent questions, feel free to call us directly</li>
                <li>We'll provide detailed information about our products and services</li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📞 Our Contact Information</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 95378 94448</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 97274 28583</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #1f2937; font-weight: 600;">blowpackplastic@gmail.com</div>
                </div>
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                <div>📍 Address: Gala no- 06, Pali industry estate, Wagdhara road, Near by jalaram temple, Dadra nagar, Dadra and Nagar Haveli, Gujarat, India</div>
                <div>🕒 Business Hours: Mon-Fri 9:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 Blow Pack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  contactFormAdminNotification: (contactData) => ({
    subject: `🚨 New Contact Form Submission - ${contactData.subject} | Blow Pack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🚨 New Contact Form Submission</h1>
            <p style="color: #fecaca; margin: 5px 0 0 0; font-size: 16px;">Blow Pack Plastic Industries</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #dc2626; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                ⚡ Action Required
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">New Customer Inquiry Received</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">A new contact form submission has been received and requires your attention. Please review the details below and respond to the customer promptly.</p>

            <!-- Contact Details Card -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
              <h3 style="color: #ffffff; font-size: 20px; margin: 0 0 20px 0;">📋 Contact Details</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                  <div style="color: #e0e7ff; font-size: 14px; margin-bottom: 5px;">Customer Name</div>
                  <div style="color: #ffffff; font-size: 18px; font-weight: 700;">${contactData.firstName} ${contactData.lastName}</div>
                </div>
                <div>
                  <div style="color: #e0e7ff; font-size: 14px; margin-bottom: 5px;">Subject</div>
                  <div style="color: #ffffff; font-size: 18px; font-weight: 700;">${contactData.subject}</div>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <div style="color: #e0e7ff; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #ffffff; font-size: 16px; font-weight: 600;">${contactData.email}</div>
                </div>
                <div>
                  <div style="color: #e0e7ff; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #ffffff; font-size: 16px; font-weight: 600;">${contactData.phone}</div>
                </div>
              </div>
            </div>

            <!-- Message Content -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center;">💬 Customer Message</h3>
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; color: #1f2937; line-height: 1.6; font-size: 16px;">
                ${contactData.message}
              </div>
            </div>

            <!-- Submission Info -->
            <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #0c4a6e; font-size: 20px; margin: 0 0 20px 0; text-align: center;">📅 Submission Information</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <div style="color: #0c4a6e; font-size: 14px; margin-bottom: 5px;">Submitted Date</div>
                  <div style="color: #0c4a6e; font-size: 16px; font-weight: 600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div>
                  <div style="color: #0c4a6e; font-size: 14px; margin-bottom: 5px;">Submitted Time</div>
                  <div style="color: #0c4a6e; font-size: 16px; font-weight: 600;">${new Date().toLocaleTimeString('en-IN')}</div>
                </div>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
              <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 20px;">⚡ Action Required</h3>
              <p style="color: #fecaca; margin: 0 0 20px 0; font-size: 16px;">Please respond to this customer inquiry within 24 hours to maintain excellent customer service.</p>
              <a href="${process.env.FRONTEND_URL}/admin/contacts" style="background-color: #ffffff; color: #dc2626; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">View in Admin Panel</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 Blow Pack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">This is an automated notification from the Blow Pack Plastic Industries system.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  contactFormResponse: (contactData, responseMessage, adminName) => ({
    subject: `Re: ${contactData.subject} - Response from Blow Pack Plastic Industries`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Response to Your Inquiry</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Blow Pack Plastic Industries</h1>
            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Quality Plastic Products</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #10b981; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-size: 18px; font-weight: 600;">
                📧 Response to Your Inquiry
              </div>
            </div>

            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Thank You for Your Inquiry!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${contactData.firstName} ${contactData.lastName}</strong>,</p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for contacting Blow Pack Plastic Industries. We have reviewed your inquiry and are pleased to provide you with the following response:</p>

            <!-- Original Message Reference -->
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">📋 Your Original Inquiry</h3>
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; color: #6b7280; font-style: italic;">
                <strong>Subject:</strong> ${contactData.subject}<br>
                <strong>Message:</strong> ${contactData.message}
              </div>
            </div>

            <!-- Response Message -->
            <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 15px 0;">💬 Our Response</h3>
              <div style="background-color: #ffffff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; color: #1f2937; line-height: 1.6; font-size: 16px;">
                ${responseMessage}
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #065f46; margin: 0 0 15px 0; font-size: 16px;">📞 Need Further Assistance?</h4>
              <ul style="color: #065f46; margin: 0; padding-left: 20px;">
                <li>If you have additional questions, please don't hesitate to contact us</li>
                <li>We're here to help with all your plastic product needs</li>
                <li>You can reach us directly via phone or email</li>
                <li>We look forward to serving you!</li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div style="text-align: center; margin: 40px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📞 Our Contact Information</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Phone</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 95378 94448</div>
                  <div style="color: #1f2937; font-weight: 600;">+91 97274 28583</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Email</div>
                  <div style="color: #1f2937; font-weight: 600;">blowpackplastic@gmail.com</div>
                </div>
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                <div>📍 Address: Gala no- 06, Pali industry estate, Wagdhara road, Near by jalaram temple, Dadra nagar, Dadra and Nagar Haveli, Gujarat, India</div>
                <div>🕒 Business Hours: Mon-Fri 9:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM</div>
              </div>
            </div>

            <!-- Admin Signature -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">Best regards,</p>
              <p style="color: #1f2937; font-weight: 600; margin: 0 0 5px 0;">${adminName}</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Blow Pack Plastic Industries Team</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 Blow Pack Plastic Industries. All rights reserved.</p>
            <p style="margin: 0;">Thank you for choosing us for your plastic product needs!</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
