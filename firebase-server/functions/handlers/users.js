const { db, admin } = require('../util/admin');

const config = require('../util/config');
const firebase = require('firebase');
firebase.initializeApp(config)

const { validateSignupData, validateLoginData, reduceUserDetails, validateAddFriend } = require('../util/validators');

//Sign up user
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) return res.status(400).json(errors);

    const noImg = 'no-img.png'

    //TODO: validate data
    let token, userId;
    db.doc(`/users/${userId}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: 'this handle is already taken' })
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken(true)
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                userId,
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                completed: 0,
                friends: []
            };
            return db.doc(`/users/${userId}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use' })
            } else {
                return res.status(500).json({ general: 'Something went wrong! Please try again' })
            }
        })
}

//Log in user
exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if (!valid) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken(true);
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error(err);
            return res.status(403).json({ general: 'Wrong credentials, please try again' })
        });
};

//Add completed count
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.uid}`)
        .update(userDetails)
        .then(() => {
            return res.json({ message: "Details added successfully" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
};

//Get own user details
exports.getAuthenticatedUser = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.user.uid}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db.collection('challenges').where('participantList', 'array-contains', req.user.handle).orderBy('createdAt', 'desc').get()
            }
        })
        .then(data => {
            userData.challenges = [];
            data.forEach(doc => {
                var noId = doc.data();
                noId.challengeId = doc.id;
                userData.challenges.push(noId);
            })
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

//Upload a profile image
exports.uploadImage = (req, res) => {
    const BusBoy = require("busboy");
    const path = require("path");
    const os = require("os");
    const fs = require("fs");

    const busboy = new BusBoy({ headers: req.headers });
    console.log(busboy, 'bussy')

    let imageToBeUploaded = {};
    let imageFileName;

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
            return res.status(400).json({ error: "Wrong file type submitted" });
        }
        const imageExtension = filename.split(".")[filename.split(".").length - 1];
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on("finish", () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    },
                },
            })
            .then(() => {
                // Append token to url
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db.doc(`/users/${req.user.uid}`).update({ imageUrl });
            })
            .then(() => {
                return res.json({ message: "image uploaded successfully" });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: "something went wrong" });
            });
    });
    busboy.end(req.rawBody);
};

//Add a friend
exports.addFriend = (req, res) => {
    var uid = req.body.uid;
    var friendUid = req.body.friendUid;
    const { valid, errors } = validateAddFriend(friendUid, uid);

    if (!uid || !friendUid) return null;
    if (!valid) return res.status(400).json(errors);

    db.collection('users').doc(uid).update({ friends: admin.firestore.FieldValue.arrayUnion(friendUid) })
        .then(() => {
            console.log('added 1 friend')
            return res.json(friendUid)
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err.code });
        })

    db.collection('users').doc(friendUid).update({ friends: admin.firestore.FieldValue.arrayUnion(uid) })
        .then(() => {
            console.log('added 1 friend')
            return res.json(friendUid)
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err.code });
        })
}

//Get a friend
exports.getFriend = (req, res) => {
    let friendData = {};
    db.doc(`/users/${req.params.friendUid}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Friend not found' })
            }
            friendData = doc.data();
            return res.json(friendData);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}

//Update completed
exports.updateCompleted = (req, res) => {
    var uid = req.body.uid;
    db.collection('users').doc(uid).update({
        completed: admin.firestore.FieldValue.increment(1)
    })
        .then(() => {
            return res.json(uid)
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err.code });
        })
}