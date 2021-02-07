const functions = require("firebase-functions");
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config = {
    apiKey: "AIzaSyAppN27Lh6bgusYJBm210O2Bt4f8uOIvKI",
    authDomain: "social-media-bb54f.firebaseapp.com",
    databaseURL: "https://social-media-bb54f-default-rtdb.firebaseio.com",
    projectId: "social-media-bb54f",
    storageBucket: "social-media-bb54f.appspot.com",
    messagingSenderId: "946702428296",
    appId: "1:946702428296:web:8bddba303b89f78939d73d",
    measurementId: "G-44X76KTWEY"
};


const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore()


app.get('/screams', (req,res) =>{
    db
    .collection('screams')
    .orderBy('createdAt','desc')
    .get()
    .then(data =>{
        let screams =[];
        data.forEach(doc =>{
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userhandle,
                createdAt: doc.data().createdAt
            });
        });
        return res.json(screams);
    })
    .catch((err) => console.error(err));
})


//create screams


app.post('/scream',(req,res) => {


    // if(req.method !== 'POST'){
    //     return res.status(400).json({error:'Method not allowed  '})
    // }
    const newScream ={
        body: req.body.body,
        userhandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
    .collection('screams')
    .add(newScream)
    .then(doc => {
        res.json({message: `document ${doc.id} created successfull`});
    })
    .catch(err => {
        res.status(500).json({error:'something went wrong'});
        console.log(err)
    })
})

const isEmail = (email) => {
    const regEx =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;;
    if(email.match(regEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

// SignUp route
app.post('/signup', (req,res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

let errors ={};
    if(isEmpty(newUser.email)){
        errors.email = 'must not be empty'
    } else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address'; 
    }

    if(isEmpty(newUser.password)) errors.password = 'Must not Empty';
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Password Must Match';
    if(isEmpty(newUser.handle)) errors.handle = 'Must not be Empty'

    if(Object.keys(errors).length > 0 ) return res.status(400).json(errors);

    //Validate data
    let token, userId;

    db.doc( `/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({handle:'this handle is already taken'})
        }else{
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email,newUser.password);

           
        }
    }).then((data) => {
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then((idToken) =>{
        token = idToken;
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId
        }
        return db.doc(`/user/${newUser.handle}`).set(userCredentials);
    })
    .then((data) => {
        return res.status(201).json({token})
    })
    .catch(err =>{
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({email: 'Email is already in use'});
        }else{

            return res.status(500).json({error: err.code})
        }
    })

})

// SignIn route

app.post('/login', (req,res) => {
    const  user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors= {};

    if(isEmpty(user.email)) errors.email = 'Must not be empty';
    if(isEmpty(user.password)) errors.password = 'Must not be Empty';

    if(Object.keys(errors).length > 0 ) return res.status(400).json(errors);

    firebase
    .auth()
    .signInWithEmailAndPassword(user.email,user.password)
    .then((data) =>{
        return data.user.getIdToken();
    })
    .then((token) =>{
        return res.json({token});
    })
    .catch(err => {
        console.error(err);
        if(err.code === 'auth/wrong-password'){
            return res.status(403).json({general: 'wrong credentials , Please try again '})
        }else return res.status(500).json({error: err.code})
    })
})

exports.api = functions.https.onRequest(app);