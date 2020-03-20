const fs = require('fs');
const readline = require('readline');
const google = require('googleapis').google;

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const GMAIL_CREDENTIALS = '.gmail-tokens/gmail-credentials.json';
const GMAIL_AUTH_TOKEN = '.gmail-tokens/gmail-token.json';

const credentials = JSON.parse(fs.readFileSync(GMAIL_CREDENTIALS));
const token = JSON.parse(fs.readFileSync(GMAIL_AUTH_TOKEN));
const client_secret = credentials.installed.client_secret;
const client_id     = credentials.installed.client_id;
const redirect_urn = credentials.installed.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_urn);
oAuth2Client.setCredentials(token);

sendEmail('Me','someone@example.com','Hello World!','This is a dummy email. Test 123456.');
// getNewToken(oAuth2Client, oaut => console.log(oaut));

// API -----------------------------------------------------------------------------------------------------------------

// send email
function sendEmail(from, to, subject, body){

    var email_lines = [];
    email_lines.push('From: "' + from + '" <support@etdrisk.com>');
    email_lines.push('To: ' + to);
    email_lines.push('Content-type: text/html;charset=iso-8859-1');
    email_lines.push('MIME-Version: 1.0');
    email_lines.push('Subject: ' + subject);
    email_lines.push('');
    email_lines.push(body);

    var email = email_lines.join('\r\n').trim();

    var base64EncodedEmail = new Buffer(email).toString('base64');
    base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');

    let auth = oAuth2Client
    const gmail = google.gmail({
        version: 'v1',
        auth
    });

    gmail.users.messages.send({
        userId: 'me',
        resource: {raw: base64EncodedEmail}
    }, (err,res) => {
        if(err){
            console.log(err);
        }
        else{
            console.log(res);
        }
    });
}

// generate a new access token (requires user interation)
function getNewToken(oAuth2Client, callback) {
    
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(GMAIL_AUTH_TOKEN, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored as ', GMAIL_AUTH_TOKEN);
            });
            callback(oAuth2Client);
        });
    });
}