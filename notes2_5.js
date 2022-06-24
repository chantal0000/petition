// PART 2

// // cookies
// //server.js
// // middleware to implement cookie parser
// app.use(cookieParser());

// //middleware to implement the tamper proof cookie session
// const cookieSession = require("cookie-session");

// app.use(
//     cookieSession({
//         secret: `I'm always angry.`,
//         maxAge: 1000 * 60 * 60 * 24 * 14,
//     })
// );

// app.get("/read-cookie", (req, res) => {
//     console.log("in read cookie route");
//     console.log("req.cookies", req.cookies);
//     console.log("----------------------------");
//     console.log("req.session", req.session);
//     res.sendStatus(200);
// });

// app.get("/add-to-cookie", (req, res) => {
//     console.log("in add to cookie route");
//     console.log("cookie parser before value add", req.cookies);
//     res.cookie("cohort", "cayenne");
//     res.cookie("bootcampweek", 7);
//     res.cookie("petitionIsFun", true);
//     console.log("------------------------");
//     console.log("cookie session before value add", req.sessions);
// });

//--------------------------------------------------//

//PART 5

// adding a profile editing feature

// pw always blank!

//upsert to check if columns/ data exist
//EXAMPLE 1 / Update existing info

// BEFORE INGRID had only 3 oscars in table
// psql tv-and-films
// INSERT INTO actors (name, age, oscars)
// VALUES ('Ingrid Bergman', 67, 4)
// ON CONFLICT (name) // pass smth uniqe, in our case use --> id
// Do UPDATE SET age=67, oscars=4;

//EXAMPLE 2 / add data/ info missing (age)

// psql tv-and-films
// INSERT INTO actors (name, age, oscars)
// VALUES ('Lea Seydoux', 36, 0)
// ON CONFLICT (name)
// DO UPDATE SET
