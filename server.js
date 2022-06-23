const express = require("express");
const app = express();
const db = require("./db");
//delete cookie-parser???
// const cookieParser = require("cookie-parser");
// middleware to implement the tamper proof cookie session
const cookieSession = require("cookie-session");
// setup HB EXPRESS
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// access to public folder
app.use(express.static("./public"));
// cookie-parser for parsing and eventual cookie
// app.use(cookieParser());
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

app.get("/", (req, res) => {
    res.redirect("petition");
});

// get the register template
app.get("/register", (req, res) => {
    res.render("register");
});
// app.post("register")
app.post("/register", (req, res) => {
    //call the bcrypt.hash function and pass it the password from req.body
});

app.get("/petition", (req, res) => {
    // has my user already signed the petition? -> check cookie
    if (req.session.signatureId) {
        // if yes redirect to thank you
        res.redirect("/thanks");
    } else {
        // if no:
        // The res.render() function is used to render a view and sends the rendered HTML string to the client.
        res.render("petition");
        // ?????
        // res.redirect("/signed");
    }
});

app.post("/petition", (req, res) => {
    // res.render("/signed");
    // db.addUser(req.body)
    db.addSigniture(req.body.first, req.body.last, req.body.signature)
        .then((results) => {
            req.session.signatureId = results.rows[0].id;
            console.log("omg it worked");
            // console.log("results", results.rows[0].id);
            // currently not showing up oben richtiger name
            res.redirect("/thanks");
        })
        .catch((err) => console.log("err", err));
});

app.get("/thanks", function (req, res) {
    // how many ppl signed
    //let signers = result.rows;
    // db.countSignatures().then((result) => {
    //     // req.session.countSignatures = results.rows[0].count;
    //     let numSign = result.rows;
    //     res.render("thanks", { title: "numSign", numSign });
    // });

    // falls nichts da zurück zu petition geleitet
    if (!req.session.signatureId) {
        return res.redirect("/petition");
    }
    db.getSignitureId(req.session.signatureId).then((results) => {
        // loggen rows, object, data url
        //console.log("results", results);
        // console.log(req.session);
        //console.log("results.rows[0].url:", results.rows);

        res.render("thanks", {
            data: {
                url: results.rows[0].url,
            },
        });
    });
    // von der datenbank die url holen, id geben hierfür
    // query schreiben in der Datenbank wo die id
    //console.log("req.session", req.session.signatureId);

    // getting img of the url / signature
    // db.getSignatures(req.body.signature)
    //     .then(() => {
    //         console.log("omg it worked");
    //         // currently not showing up oben richtiger name
    //         res.redirect("/thanks");
    //     })
    //     .catch((err) => console.log("err", err));
});
app.get("/signers", function (req, res) {
    if (!req.session.signatureId) {
        return res.redirect("/petition");
    }
    db.getSigniture()
        .then(function (result) {
            // console.log("result rows", result.rows);
            const signer = result.rows;
            //console.log(signer);

            res.render("signers", {
                title: "signer",
                signer,
            });
        })
        .catch(function (err) {
            console.log(err);
        });
});

//what is the logout route doing?
app.get("/logout", (req, res) => {
    req.session.signatureId = null;
    res.redirect("/petition");
});

//instead of using hard coded 8080 pick up from process.env.PORT
// check if PORT is provided IF NOT run on 8080
app.listen(process.env.PORT || 8080, () =>
    console.log("go got this petition stuff...")
);

//PORT=8080 node server.js
