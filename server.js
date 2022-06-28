const express = require("express");
const app = express();
const db = require("./db");
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");
//____________SET UP HANDLEBARS________________//
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// access to public folder
app.use(express.static("./public"));

//express.urlencoded for parsing your form POST request
app.use(
    express.urlencoded({
        extended: false,
    })
);

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;
// middleware to implement the tamper proof cookie session
app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14, // keeps cookie for this amout of time
    })
);

app.use((req, res, next) => {
    console.log("--------------------------");
    console.log(req.url);
    console.log(req.method);
    console.log(req.session);
    console.log("--------------------------");
    next();
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

// get the register template
app.get("/register", (req, res) => {
    if (req.session.signatureId) {
        return res.redirect("/thanks");
    } else if (req.session.user_id) {
        return res.redirect("/petition");
    }
    res.render("register", {
        title: "Register",
    });
});
// app.post("register")
app.post("/register", (req, res) => {
    // call the bcrypt.hash function and pass it the password from req.body
    bcrypt
        .hash(req.body.password)
        .then((hash) => {
            db.addUser(req.body.first, req.body.last, req.body.email, hash)
                .then((results) => {
                    req.session.user_id = results.rows[0].id;
                    req.session.login = true;
                    //redirect to profile page
                    res.redirect("/profile");
                })
                .catch((err) => {
                    res.render("register", {
                        title: "Register",
                        error: true,
                    });
                });
        })
        .catch((err) => {
            console.log("err /register", err);
        });
    // call a function to insert the hashed password that bcrypt.hash returned plus the first, last, and
    // email from req.body into the database and create a new user
    // after the query, put the newly created user's id into the session so that the user is logged in.
    // Any time you want to check to see if a user is logged in you can check to see if req.session.userId exists
});

app.get("/login", (req, res) => {
    if (!req.session.user_id) {
        res.render("login", {
            title: "login",
        });
    } else {
        res.redirect("/petition");
    }
});

app.post("/login", (req, res) => {
    db.login(req.body.email)
        .then((results) => {
            //console.log(results.rows[0].password);
            if (results.rows[0]) {
                return bcrypt
                    .compare(req.body.password, results.rows[0].password)
                    .then(function (pwCompare) {
                        if (pwCompare) {
                            req.session.login = true;
                            req.session.user_id = results.rows[0].id;

                            db.findSignature(req.session.user_id)
                                .then((results) => {
                                    if (results.rows[0]) {
                                        req.session.signed = true;
                                        req.session.signatureId =
                                            results.rows[0].id;
                                        res.redirect("/thanks");
                                    } else {
                                        res.redirect("/petition");
                                    }
                                })
                                .catch((err) => {
                                    console.log("error sig", err);
                                });
                        } else {
                            res.render("login", {
                                title: "login",
                                error: true,
                            });
                        }
                    });
            } else {
                res.render("login", {
                    title: "login",
                    error: true,
                });
            }
        })
        .catch((err) => {
            console.log("err in login", err);
            res.render("login", {
                title: "Login",
                error: true,
            });
        });
});

///_____PROFILE_____///

app.get("/profile", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/register");
    }
    res.render("profile", {
        title: "Profile",
    });
});

function isInputEmpty(obj) {
    for (let key in obj) {
        if (obj[key].trim().length != 0) {
            return false;
        }
    }
    return true;
}
app.post("/profile", (req, res) => {
    // check to see that the user entered data into at least one of the fields.
    // if they are empty:
    if (isInputEmpty(req.body)) {
        //we keep going but we dont add somthing in the Db.
        //return;
        return res.redirect("/petition");
    }
    // if they are not empty:

    console.log("req.body.url.trim().length ", req.body.url.trim().length);

    let url = req.body.url.trim().length != 0 ? req.body.url.trim() : null;
    const age = req.body.age || null;
    const city = req.body.city || null;

    //newProfile = (age, city, user_id, url)
    db.newProfile(age, city, req.session.user_id, url)
        .then((results) => {
            res.redirect("petition");
        })
        .catch((err) => {
            console.log("error in [db]newProfile");
            res.render("profile", {
                title: "Profile",
                error: true,
            });
        });
});

///____SIGN-PETITION____///

app.get("/petition", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/register");
    } else if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            title: "Petition",
        });
    }
});

app.post("/petition", (req, res) => {
    db.addSigniture(req.body.signature, req.session.user_id)
        .then((results) => {
            req.session.signatureId = results.rows[0].id;
            req.session.signed = true;
            console.log("omg it worked");
            // console.log("results", results.rows[0].id);
            // currently not showing up oben richtiger name
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error in [db]addSigniture", err);
            res.render("petition", {
                title: "Petition",
                error: true,
            });
        });
});
// AB HIER COOKIES CHECKEN
app.get("/thanks", function (req, res) {
    if (!req.session.signatureId) {
        return res.redirect("/petition");
    }
    db.getSignitureId(req.session.signatureId).then((results) => {
        const signatureURL = results.rows[0].url;
        db.countSignatures().then((results) => {
            const numSign = results.rows[0].count;
            res.render("thanks", {
                data: {
                    url: signatureURL,
                    numSign,
                },
            });
        });
    });
});

// DELETE SIGNATURE
app.post("/thanks", (req, res) => {
    db.deleteSignature(req.session.signatureId)
        .then((results) => {
            req.session.signed = false;
            req.session.signatureId = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in delete sign", err);
        });
});

//____SIGNERS-PAGE__________
// getting all of users and user-profiles info on the page
app.get("/signers", function (req, res) {
    if (!req.session.signatureId) {
        return res.redirect("/petition");
    }
    db.getSignersInput(
        req.body.first,
        req.body.last,
        req.body.age,
        req.body.city,
        req.body.url
    ).then((results) => {
        let signer = results.rows;
        res.render("signers", {
            title: "signer",
            signer,
        });
    });
});

//______SIGNERS/:CITY

app.get("/signers/:city", (req, res) => {
    let city = req.params.city;
    // db get signers by city
    console.log("req.params", req.params.city);
    db.getCity(city)
        .then((results) => {
            const resultCity = results.rows;
            res.render("signers", {
                title: "signers",
                signer: resultCity,
                city: resultCity[0].city,
            });
        })
        .catch((err) => console.log("err", err));
});

///______EDIT-PROFILE_______

app.get("/edit", (req, res) => {
    if (req.session.user_id) {
        db.getUserInfo(req.session.user_id)
            .then((results) => {
                res.render("edit", {
                    title: "Edit",
                    userInfo: results.rows[0],
                });
            })

            .catch((err) => {
                console.log("error getUserInfo", err);
            });
    } else {
        return res.redirect("/register");
    }
});

// notes from class
app.post("/edit", (req, res) => {
    if (req.body.password === "") {
        db.editUsersInfoNoPassword(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.user_id
        )
            .then(() => {
                db.upsertProfileInfo(
                    req.body.age,
                    req.body.city,
                    req.body.url,
                    req.session.user_id
                )
                    .then(() => {
                        res.redirect("/thanks");
                    })
                    .catch((err) => {
                        console.log("error in upsertProfileInfo NoPW", err);
                    });
            })
            .catch((err) => {
                console.log("error in EDIT NO PW", err);
            });
    } else {
        bcrypt
            .hash(req.body.password)
            .then((hash) => {
                db.editUsersInfoPassword(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash,
                    req.session.user_id
                )
                    .then(() => {
                        db.upsertProfileInfo(
                            req.body.age,
                            req.body.city,
                            req.body.url,
                            req.session.user_id
                        )
                            .then(() => {
                                res.redirect("/thanks");
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                    })
                    .catch((err) => {
                        res.render("edit", {
                            title: "edit",
                            error: true,
                        });
                    });
            })
            .catch((err) => {
                console.log("err /register", err);
            });
    }
});

// LOGOUT
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

//instead of using hard coded 8080 pick up from process.env.PORT
// check if PORT is provided IF NOT run on 8080
app.listen(process.env.PORT || 8080, () =>
    console.log("go got this petition stuff...")
);

//PORT=8080 node server.js
