// Import libraries
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
dotenv.config();

// Import user model
const {User} = require("../models/UserModel");

// ----- encryption and decryption -------

let encAlgorithm = 'aes-256-cbc';
let encPrivateKey = crypto.scryptSync(process.env.ENC_KEY, "SpecialSalt", 32);
let encIV = crypto.scryptSync(process.env.ENC_IV, "SpecialSalt", 16);
let cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
let decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);

// Convert string into encrypted string
function encryptString(data) {
    cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
    return cipher.update(data, "utf8", "hex") + cipher.final("hex");
}

// Return encrypted data to plaintext string
function decryptString(data){
    decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);
    return decipher.update(data, "hex", "utf8") + decipher.final("utf8");
}

// Decrypt encrypted Object returning to a regular javascript object
function decryptObject(data){
    return JSON.parse(decryptString(data));
}

// ----- Hashing and Salting functionality ------
// Salt rounds 
const saltRounds = 10;

// Function to add salt and hash given string
async function hashString(stringToHash){
    let saltToAdd = await bcrypt.genSalt(saltRounds);

    return await bcrypt.hash(stringToHash, saltToAdd);
}

// compares unhashed data with hashed data and returns boolean
async function validateHashedData(unhashedData, storedHashedData){
    return await bcrypt.compare(unhashedData, storedHashedData);
}

// ------ JWT functionality ------

// Generate JWT 
function generateJWT(payloadObj){
    return jwt.sign(payloadObj, process.env.JWT_SECRET, {expiresIn: "7d"});
}

// Encrypt payload and generate user specific JWT
async function generateUserJWT(userDetails){
    let encryptedUserData = encryptString(JSON.stringify(userDetails));

    return generateJWT({data: encryptedUserData});
}

// Veryify userJWT and return new validated JWT
async function verifyUserJWT(userJWT){
    let userJwtVerified = jwt.verify(userJWT, process.env.JWT_SECRET, {complete: true});
    let decryptedJwtPayload = decryptString(userJwtVerified.payload.data);
    let userData = JSON.parse(decryptedJwtPayload);
    let targetUser = await User.findById(userData.userID).exec();

    if (targetUser.username === userData.username && targetUser.email === userData.email){
        return generateJWT({data: userJwtVerified.payload.data});
    } else {
        throw new Error({message: "Invalid User Token"})
    }
}


module.exports = {
    encryptString, 
    decryptString, 
    decryptObject,
    hashString,
    validateHashedData,
    generateJWT,
    generateUserJWT,
    verifyUserJWT
}