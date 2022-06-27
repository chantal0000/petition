// SELECT * FROM actors;
// databases speak SQL
// ; <-- very important, means run this command
// * <-- means ALL
//curl -X GET localhost:8080/actors

// adding information to database POST

// set up new database (cayenne-petition or petition)

// three pages
// 1. petition page
// 2. thank you
// 3.

// do cookie logic last
// - GET Petition step one (skip until cookie is done)

// MIDDLEWARE

// if you are not logged in you are not supposed to go anywehere
// if you are logged in you should not be able to go to login
// use middleware so you dont have to write it in all get. individually
// MIDDLEWARE centralizes this

app.use((req, res, next) => {
    //IF YOU ARE NOT LOGGEDIN OR REGISTERED
    if (!req.session.userId && req.url != "/login" && req.url != "/register") {
        res.redirect("/register");
    } else {
        next();
    }
});
/// A VERSION
app.use("/whatever??", (req, res, next) => {
    //IF YOU ARE LOGGED IN / REGISTERED
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
});

// ROUTE MIDDLEWARE ALTERNATIVE TO A VERSION
//if they want to go where they want to go they have to logout
let requireLoggedOut;

// create spertate file
