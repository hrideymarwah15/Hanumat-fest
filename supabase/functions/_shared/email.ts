// Email utilities using Resend
import { RESEND_API_KEY, FRONTEND_URL } from "./utils.ts";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Sports Fest <noreply@sportsfest.com>";

// HTML escape utility to prevent XSS/injection
function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Safe number formatting with validation
function formatAmount(amount: unknown): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  return amount.toFixed(2);
}

// Get current year dynamically
function getCurrentYear(): number {
  return new Date().getFullYear();
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

// Send email via Resend
export async function sendEmail(params: EmailParams): Promise<{ id: string }> {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to send email: ${response.status}`;
    try {
      // Read body once as text
      const bodyText = await response.text();
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(bodyText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Not valid JSON, use raw text as fallback
        if (bodyText) {
          errorMessage = `${errorMessage} - ${bodyText.substring(0, 200)}`;
        }
      }
    } catch {
      // Ignore body reading error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Email templates
export function getWelcomeEmailHtml(name: string): string {
  const safeName = escapeHtml(name);
  const year = getCurrentYear();
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Sports Fest ${year}!</h1>
        </div>
        <div class="content">
          <p>Hi ${safeName},</p>
          <p>Welcome to Sports Fest ${year}! Your account has been successfully created.</p>
          <p>You can now browse available sports and register for events.</p>
          <a href="${FRONTEND_URL}/sports" class="button">Browse Sports</a>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>Sports Fest ${year} | Your College Sports Event</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getRegistrationConfirmationHtml(
  name: string,
  sportName: string,
  registrationNumber: string,
  isWaitlist: boolean
): string {
  const safeName = escapeHtml(name);
  const safeSportName = escapeHtml(sportName);
  const safeRegNumber = escapeHtml(registrationNumber);
  const year = getCurrentYear();
  
  const statusMessage = isWaitlist
    ? "You have been added to the waitlist. We will notify you if a spot becomes available."
    : "Your registration is confirmed! Please complete the payment to secure your spot.";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Registration ${isWaitlist ? "Waitlisted" : "Confirmed"}</h1>
        </div>
        <div class="content">
          <p>Hi ${safeName},</p>
          <p>${statusMessage}</p>
          <div class="details">
            <p><strong>Sport:</strong> ${safeSportName}</p>
            <p><strong>Registration Number:</strong> ${safeRegNumber}</p>
          </div>
          <a href="${FRONTEND_URL}/registrations" class="button">View My Registrations</a>
        </div>
        <div class="footer">
          <p>Sports Fest ${year} | Your College Sports Event</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPaymentConfirmationHtml(
  name: string,
  sportName: string,
  registrationNumber: string,
  amount: number,
  receiptNumber: string
): string {
  const safeName = escapeHtml(name);
  const safeSportName = escapeHtml(sportName);
  const safeRegNumber = escapeHtml(registrationNumber);
  const safeReceiptNumber = escapeHtml(receiptNumber);
  const safeAmount = formatAmount(amount);
  const year = getCurrentYear();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .success { color: #16a34a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Successful!</h1>
        </div>
        <div class="content">
          <p>Hi ${safeName},</p>
          <p class="success">Your payment has been successfully processed. Your registration is now confirmed!</p>
          <div class="details">
            <p><strong>Sport:</strong> ${safeSportName}</p>
            <p><strong>Registration Number:</strong> ${safeRegNumber}</p>
            <p><strong>Amount Paid:</strong> ₹${safeAmount}</p>
            <p><strong>Receipt Number:</strong> ${safeReceiptNumber}</p>
          </div>
          <a href="${FRONTEND_URL}/registrations" class="button">View My Registrations</a>
        </div>
        <div class="footer">
          <p>Sports Fest ${year} | Your College Sports Event</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getWaitlistPromotionHtml(
  name: string,
  sportName: string
): string {
  const safeName = escapeHtml(name);
  const safeSportName = escapeHtml(sportName);
  const year = getCurrentYear();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Spot Available!</h1>
        </div>
        <div class="content">
          <p>Hi ${safeName},</p>
          <p>Great news! A spot has opened up for <strong>${safeSportName}</strong>.</p>
          <div class="urgent">
            <strong>Important:</strong> Please complete your payment within 24 hours to confirm your registration. Otherwise, the spot will be offered to the next person on the waitlist.
          </div>
          <a href="${FRONTEND_URL}/registrations" class="button">Complete Payment Now</a>
        </div>
        <div class="footer">
          <p>Sports Fest ${year} | Your College Sports Event</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getReminderEmailHtml(
  name: string,
  sportName: string,
  eventDate: string,
  venue: string
): string {
  const safeName = escapeHtml(name);
  const safeSportName = escapeHtml(sportName);
  const safeEventDate = escapeHtml(eventDate);
  const safeVenue = escapeHtml(venue);
  const year = getCurrentYear();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${safeName},</p>
          <p>This is a reminder that your event is starting soon!</p>
          <div class="details">
            <p><strong>Sport:</strong> ${safeSportName}</p>
            <p><strong>Date &amp; Time:</strong> ${safeEventDate}</p>
            <p><strong>Venue:</strong> ${safeVenue}</p>
          </div>
          <p>Please arrive at least 30 minutes before the event start time.</p>
        </div>
        <div class="footer">
          <p>Sports Fest ${year} | Your College Sports Event</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
