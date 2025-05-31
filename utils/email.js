const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP transport
// Only create real transporter if credentials exist
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail", // or any other email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// For development/demo purposes, we can use a test account instead of real credentials
let testAccount = null;
let testTransporter = null;

// Setup test account if needed
async function setupTestAccount() {
  if (!testAccount) {
    // Generate test SMTP service account
    testAccount = await nodemailer.createTestAccount();

    // Create a test SMTP transporter
    testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("Created test email account:", testAccount.user);
  }
}

// Send ticket confirmation email
async function sendTicketConfirmation(ticket, flight) {
  try {
    // Use test account for demonstration if no real credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      await setupTestAccount();
    }

    const currentTransporter = testTransporter || transporter;

    const departureDate = new Date(flight.departure_time);
    const arrivalDate = new Date(flight.arrival_time);

    // Email content
    const mailOptions = {
      from: '"HappyFlights" <noreply@happyflights.com>',
      to: ticket.passenger_email,
      subject: `Your Flight Ticket Confirmation - ${flight.flight_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px;">
          <div style="text-align: center; background-color: #0d6efd; color: white; padding: 15px; border-radius: 5px;">
            <h1 style="margin: 0;">Flight Ticket Confirmation</h1>
          </div>
          
          <div style="padding: 20px 0;">
            <p>Dear ${ticket.passenger_name} ${ticket.passenger_surname},</p>
            <p>Thank you for booking with HappyFlights. Your flight has been confirmed!</p>
            
            <div style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Ticket Information</h3>
              <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
              <p><strong>Passenger:</strong> ${ticket.passenger_name} ${
        ticket.passenger_surname
      }</p>
              <p><strong>Seat:</strong> ${
                ticket.seat_number || "Automatically assigned at check-in"
              }</p>
            </div>
            
            <div style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Flight Details</h3>
              <p><strong>Flight Number:</strong> ${flight.flight_id}</p>
              <p><strong>From:</strong> ${flight.from_city}</p>
              <p><strong>To:</strong> ${flight.to_city}</p>
              <p><strong>Departure:</strong> ${departureDate.toLocaleString()}</p>
              <p><strong>Arrival:</strong> ${arrivalDate.toLocaleString()}</p>
            </div>
            
            <p><strong>Important:</strong> Please arrive at the airport at least 2 hours before your departure time.</p>
            <p>You can view your ticket anytime by visiting <a href="http://localhost:3000/confirmation/${
              ticket.ticket_id
            }">your ticket page</a>.</p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777;">
            <p>Thank you for choosing HappyFlights!</p>
          </div>
        </div>
      `,
    };

    // Send email
    const info = await currentTransporter.sendMail(mailOptions);

    // Log URL for ethereal test emails
    if (testTransporter) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return {
        success: true,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendTicketConfirmation,
};
