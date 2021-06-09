const sgMail = require('@sendgrid/mail');

const SEND_GRID_API_KEY = process.env.SEND_GRID_API_KEY;
const GMAIL_EMAIL_SENDER = process.env.GMAIL_EMAIL_SENDER;

sgMail.setApiKey(SEND_GRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: GMAIL_EMAIL_SENDER,
    subject: 'Welcome | Task Manager',
    text: `Welcome to the Task Manager Application, ${name}! Please, let me know how you get along with the app.`,
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: GMAIL_EMAIL_SENDER,
    subject: 'Cancellation | Task Manager',
    text: `We are sad to see you go, ${name}! Please, let me know if we could have done something else better.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
