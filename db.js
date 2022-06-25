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

// before: `postgres:${username}:${password}@localhost:5432/${database}`
// heroku: process.env.DATABASE_URL || ...
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);
// add the information that the signer put in to the databank petition

module.exports.addSigniture = (signature, user_id) => {
    console.log("signature", signature, "user_id", user_id);
    const q = `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`;
    const param = [signature, user_id];
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
// get the total count of signatures
module.exports.countSignatures = () => {
    return db.query(`SELECT COUNT(id)
                     FROM signatures`);
};

module.exports.addUser = (first, last, email, password) => {
    const q = `INSERT INTO users (first, last, email, password) 
               VALUES ($1, $2, $3, $4) 
               RETURNING id, first, last`;
    const param = [first, last, email, password];
    return db.query(q, param);
};

// login user

module.exports.login = (email) => {
    const q = `SELECT password, id 
               FROM users 
               WHERE email = $1`;
    const param = [email];
    return db.query(q, param);
};

module.exports.newProfile = (age, city, user_id, url) => {
    const q = `INSERT INTO user_profiles (age, city, user_id, url) 
               VALUES ($1, $2, $3, $4) 
               RETURNING id, age, city, user_id, url`;
    const param = [age, city, user_id, url];
    return db.query(q, param);
};

//___signers page____

module.exports.getSignersInput = () => {
    return db.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users
LEFT OUTER JOIN user_profiles 
on users.id = user_profiles.user_id`);
};

//-- get the city
module.exports.getCity = (city) => {
    return db.query(
        `
    SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
    FROM users
    LEFT OUTER JOIN user_profiles ON users.id = user_profiles.user_id
    JOIN signatures ON signatures.user_id = users.id
    WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
};
