import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND);

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND API key not configured');
  }

  try {
    const data = await resend.emails.send({
      from: from || 'Maaaaaalek <hi@malekdarwish.com>', 
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// Example email templates
export const emailTemplates = {
  newCustomer: (customerName: string) => ({
    subject: 'Welcome to Our Platform',
    html: `
      <h1>Welcome ${customerName}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
    `,
  }),
  
  orderConfirmation: (orderNumber: string) => ({
    subject: `Order ${orderNumber} Confirmed`,
    html: `
      <h1>Order Confirmation</h1>
      <p>Your order ${orderNumber} has been confirmed and is being processed.</p>
    `,
  }),
};