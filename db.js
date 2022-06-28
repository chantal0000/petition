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

module.exports.findSignature = (userId) => {
    const q = `SELECT * FROM signatures
WHERE user_id = $1`;
    const param = [userId];
    return db.query(q, param);
};

// gettting signature by id query wo signatureid =
module.exports.getSignitureId = (id) => {
    return db.query(`SELECT signature AS url FROM signatures WHERE id = $1`, [
        id,
    ]);
};
// get the total count of signatures
module.exports.countSignatures = () => {
    const q = `SELECT COUNT (id)
                     FROM signatures`;
    return db.query(q);
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
    LEFT OUTER JOIN user_profiles 
    ON users.id = user_profiles.user_id
    WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
};

//________________________PROFILE EDIT____________________________

// user's first and last name, email from users table
// age,city, url from user_profiles

module.exports.getUserInfo = (userId) => {
    const q = `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url
    FROM users
    LEFT OUTER JOIN user_profiles
    ON users.id = user_profiles.user_id
    WHERE users.id = $1;`;
    const param = [userId];
    return db.query(q, param);
};
// POST /edit - this happens when the user clicks the 'submit' button

// If user enters a new password - you'll need to run 2 queries!
// 1st query - updates users & should update 4 columns (first, last, email & password)
module.exports.editUsersInfoPassword = (
    first,
    last,
    email,
    password,
    user_id
) => {
    const q = `UPDATE users
SET first = $1, last = $2, email = $3, password = $4
WHERE id = $5`;
    const param = [first, last, email, password, user_id];
    return db.query(q, param);
};

// If user doesn't enter a new password - you'll still need to run 2 queries!
// 1st query - updates users & should update 3 columns (first, last & email)
module.exports.editUsersInfoNoPassword = (first, last, email, user_id) => {
    console.log(first, last, email, user_id);
    const q = `UPDATE users 
    SET first = $1, last = $2, email = $3
    WHERE id = $4`;
    const param = [first, last, email, user_id];
    return db.query(q, param);
};

// 2nd query - updates user_profiles (our UPSERT query!)

module.exports.upsertProfileInfo = (age, city, url, user_id) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $1, city = $2, url = $3`;
    const param = [age || null, city || null, url || null, user_id];
    return db.query(q, param);
};

//________________________DELETE SIGNATURE____________________________

module.exports.deleteSignature = (userId) => {
    const q = `DELETE FROM signatures WHERE user_id = $1`;
    const param = [userId];
    return db.query(q, param);
};
