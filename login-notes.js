// hash is what we store in the database, not pw directly
// every string that is hashed produces a uniqe hash
// hash gets matched with typed in pw to see if it's correct

//________server.js_____________ ????
const bcrypt = require("bycriptjs");

exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

exports.compare = bcrypt.compare;

//________temp.js____________

const bcrypt = require("./bcrypt");

bcrypt
    .hash("letmein")
    .then(function (hash) {
        console.log(hash);
        return bcrypt.compare("letmein", hash);
    })
    .then(function (isCorrect) {
        if (isCorrect) {
            console.log("correct");
        } else {
            console.log("WRONG");
        }
    });

/////_______
// authorization based on authentication?
// if you are not loged in you cant do anything except register or login
//
