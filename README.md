# Gmail API on Node.js

After turning on the [Gmail API](https://developers.google.com/gmail/api/quickstart/nodejs), download the `credentials.json` containing `client_id`, `client_secret` and `redirect_uris`

Install the Google API client library with `npm install googleapis@39 --save`

### OAuth2 client

With this authentication method, the user visits your application, signs in with their Google account, and provides your application with authorization against a set of scopes.

**Generate an authentication URL**

Create and authorise an access token `token.json` with specific [scope](https://developers.google.com/gmail/api/auth/scopes) (e.g. send only email), by creating a consent page URL:

``` js
const credentials = fs.readFile('credentials.json', ...)

const {
	client_secret,
	client_id,
	redirect_uris
} = JSON.parse(credentials).installed

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = oAuth2Client.generateAuthUrl({
	access_type: 'offline',
	scope: ['https://www.googleapis.com/auth/gmail.send'],
});
```
Once a user has given permissions on the consent page `authUrl`, Google will redirect the page to the redirect URL you have provided with a code query parameter `authorizationCode`

**Retrieve access token**

With the `authorizationCode` you can then obtain the access token `token.json`

``` js
oAuth2Client.getToken(authorizationCode, (err, token) => {
	fs.writeFile("token.json", JSON.stringify(token) ...
});
```

**Send email**

From this point you can run the Gmail API without any user interaction by first creating an `oAuth2Client` client with the use of `credentials.json` and then by adding the `token.json` to oAuth2Client

``` js
const token = fs.readFile('gmail-auth-tokens.json', ... )
oAuth2Client.setCredentials(JSON.parse(token))

const gmail = google.gmail({
	version: 'v1',
	oAuth2Client
});

gmail.users.messages.send({
	userId: 'me',
	resource: {raw: base64EncodedEmail}
}, (err,res) => {});
```

### Service <--> Service

In this model, your application talks directly to Google APIs using a Service Account. It's useful when you have a backend application that will talk directly to Google APIs from the backend.

Note: you have never tested this authentication.

### Reference

* [Google APIs Client for Node.js documentation](https://github.com/google/google-api-nodejs-client/#google-apis-nodejs-client)
* [Gmail API reference documentation](https://developers.google.com/gmail/api/v1/reference)

