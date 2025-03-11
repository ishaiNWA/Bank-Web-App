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
