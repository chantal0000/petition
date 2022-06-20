DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
       id SERIAL PRIMARY KEY,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       signature VARCHAR NOT NULL CHECK (signature != '')
   );

--    INSERT the user's signature and name
-- SELECT first and last names of every signer
-- SELECT to get a total number of signers