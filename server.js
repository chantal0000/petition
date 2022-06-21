const express = require("express");
const app = express();
const db = require("./db");
const cookieParser = require("cookie-parser");
// middleware to implement the tamper proof cookie session
const cookieSession = require("cookie-session");
// setup HB EXPRESS
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// access to public folder
app.use(express.static("./public"));
// cookie-parser for parsing and eventual cookie
app.use(cookieParser());
//express.urlencoded for parsing your form POST request
app.use(
    express.urlencoded({
        extended: false,
    })
);
// middleware to implement the tamper proof cookie session
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

//
app.get("/petition", (req, res) => {
    // has my user already signed the petition? -> check cookie
    // if yes redirect to thank you
    // if no:

    // The res.render() function is used to render a view and sends the rendered HTML string to the client.
    res.render("petition");
    // ?????
    // res.redirect("/signed");
});

app.post("/petition", (req, res) => {
    // res.render("/signed");
    // db.addUser(req.body)
    db.addUser(req.body.first, req.body.last, req.body.signature)
        .then((results) => {
            req.session.signatureId = results.rows[0].id;
            console.log("omg it worked");
            console.log("results", results.rows[0].id);
            // currently not showing up oben richtiger name
            res.redirect("/thanks");
        })
        .catch((err) => console.log("err", err));
});

app.get("/thanks", function (req, res) {
    db.getSignitureId(req.session.signatureId).then((results) => {
        // loggen rows, object, data url
        //console.log("results", results);
        //WAS WILL ICH HIERMIT MACHEN?!
        // console.log("results.rows[0].url:", results.rows[0].url);
        req.session.signatureUrl = results.rows[0].url;
        res.render("thanks", {
            data: {
                url: req.session.signatureUrl,
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
    db.getUser()
        .then(function (result) {
            console.log("result rows", result.rows);
            const user = result.rows;
            console.log(user);

            res.render("signers", {
                title: "user",
                user,
            });
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.listen(8080, () => console.log("go got this petition stuff..."));
