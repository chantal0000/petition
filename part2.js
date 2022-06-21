// cookies
//server.js
// middleware to implement cookie parser
app.use(cookieParser());

//middleware to implement the tamper proof cookie session
const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/read-cookie", (req, res) => {
    console.log("in read cookie route");
    console.log("req.cookies", req.cookies);
    console.log("----------------------------");
    console.log("req.session", req.session);
    res.sendStatus(200);
});

app.get("/add-to-cookie", (req, res) => {
    console.log("in add to cookie route");
    console.log("cookie parser before value add", req.cookies);
    res.cookie("cohort", "cayenne");
    res.cookie("bootcampweek", 7);
    res.cookie("petitionIsFun", true);
    console.log("------------------------");
    console.log("cookie session before value add", req.sessions);
});
