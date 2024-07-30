// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');

const app = express();
const port = 3000;

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const client = twilio(accountSid, authToken);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.post('/send-sms', (req, res) => {
    const { mobileNumber, smsText } = req.body;

    // Ensure phone numbers are in the E.164 format (e.g., +1234567890)
    if (!/^(\+?\d{1,4}?)\d{7,15}$/.test(mobileNumber)) {
        return res.status(400).send('Invalid phone number format');
    }

    client.messages
        .create({
            body: smsText,
            from: process.env.TWILIO_FROM_NUMBER, 
            to: mobileNumber
        })
        .then(message => {
            console.log('Message SID:', message.sid);
            res.status(200).send('SMS sent successfully ✔');
        })
        .catch(error => {
            console.error('Twilio Error:', error);
            res.status(500).send('Failed to send SMS: ' + error.message);
        });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
