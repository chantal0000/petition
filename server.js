const express = require("express");
const app = express();
const db = require("./db");
const cookieParser = require("cookie-parser");
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

//
app.get("/petition", function (req, res) {
    res.render("petition");
    // ?????
    // res.redirect("/signed");
});

app.post("/petition", (req, res) => {
    // res.render("/signed");
    // db.addUser(req.body)
    db.addUser(req.body.first, req.body.last, req.body.signature)
        .then(() => {
            console.log("omg it worked");
            // currently not showing up oben richtiger name
            res.render("./thanks");
        })
        .catch((err) => console.log("err", err));
});

app.get("/thanks", function (req, res) {
    res.render("thanks");
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

// app.post("/add-actor", (req, res) => {
//     console.log("running POST / add-actor");
//     db.addActor("Janelle Monáe", 36)
//         .then(() => {
//             console.log("yayy it worked, we added a new actor to the table");
//         })
//         .catch((err) => console.log("err in db.addActor:", err));
// });

app.listen(8080, () => console.log("go got this petition stuff..."));
