const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: process.env.TRANSPORTER_HOST,

  port: process.env.TRANSPORTER_PORT,

  auth: {
    user: process.env.TRANSPORTER_USER,

    pass: process.env.TRANSPORTER_PASSWORD,
  },
  debug: true, // Add debug to see detailed logs
});

/*****************************************************************************/

/**
 * Sends an email using the configured transporter
 * 
 * @param {Object} mailOptions - The email configuration object
 * @param {string} mailOptions.to - Recipient email address
 * @param {string} mailOptions.subject - Email subject line
 * @param {string} mailOptions.text - Plain text content of the email
 * @param {Function} [successCallback=(info) => {}] - Optional callback function called on successful email delivery
 * @param {Function} [failureCallback=(error) => {}] - Optional callback function called if email delivery fails
 * @returns {Promise<void>} - A promise that resolves when the email sending process completes
 * 
 * @example
 * const mailOptions = {
 *   to: "user@example.com",
 *   subject: "Registration confirmation",
 *   text: "Your confirmation code is: 123456"
 * };
 * 
 * await sendMail(
 *   mailOptions,
 *   (info) => console.log("Email sent:", info.messageId),
 *   (error) => console.error("Failed to send email:", error)
 * );
 */
async function sendMail(
  mailOptions,
  successCallback = (info) => {},
  failureCallback = (error) => {}
) {
  mailOptions.from = process.env.TRANSPORTER_HOST;

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      failureCallback(error);
    } else {
      successCallback(info);
    }
  });
}

module.exports = sendMail;
