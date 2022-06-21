const spicedPg = require("spiced-pg");
// below we have information that we need for out db connection
// which db do we talk to?
const database = "petition"; // insert name of database
// which user is running our queries?
const username = "postgres";
const password = "postgres";
// spicedPg requires information
// 1. which database are we talking to? 2. :which user 3. :password 4. where is it running (which port)
// 5.
const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);

// actors example:
// module.exports.getActors = () =>{
//     return db.query(`SELECT * FROM actors`)
// }

// module.exports.addActor = (actorName, actorAge) => {
//     console.log("[db]actorName", actorName, "[db]actorAge", actorAge);
//     const q = `INSERT INTO actors (name, age)
//    VALUES ($1, $2)`;
// const param = [actorName, actorAge];
// return db.query(q, param);
// };

module.exports.addUser = (first, last, signature) => {
    console.log(
        "[db] first Name",
        first,
        "last Name",
        last,
        "signature",
        signature
    );
    const q = `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`;
    const param = [first, last, signature];
    return db.query(q, param);
};

module.exports.getUser = () => {
    return db.query(`SELECT * FROM signatures`);
};
// gettting signature by id query wo signatureid =

module.exports.getSignitureId = (id) => {
    return db.query(`SELECT signature AS url FROM signatures WHERE id = $1`, [
        id,
    ]);
};

// module.exports.getSignatures = () => {
//     return db.query(`SELECT signature FROM signatures`);
// };
