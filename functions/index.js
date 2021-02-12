const functions = require("firebase-functions");
const app = require('express')();

const FBAuth = require('./util/fbAuth')

const {getAllScreams,postOneScream} = require('./handlers/screams');
const {signUp, login} = require('./handlers/users');



//Screms Routes
app.get('/screams', getAllScreams);
app.post('/scream',FBAuth,postOneScream)

// users route
app.post('/signup', signUp)
app.post('/login', login)






exports.api = functions.https.onRequest(app);