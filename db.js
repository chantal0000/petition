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
// add the information that the signer put in to the databank petition
module.exports.addSigniture = (first, last, signature) => {
    console.log("[db] first", first, "last", last, "signature", signature);
    const q = `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`;
    const param = [first, last, signature];
    return db.query(q, param);
};
// get all information from the table signatures(that is inside the databank petition)
module.exports.getSigniture = () => {
    return db.query(`SELECT * FROM signatures`);
};
// gettting signature by id query wo signatureid =
module.exports.getSignitureId = (id) => {
    return db.query(`SELECT signature AS url FROM signatures WHERE id = $1`, [
        id,
    ]);
};
// get the count of signatures
module.exports.countSignatures = () => {
    return db.query(`SELECT COUNT(id) FROM signatures`);
};
