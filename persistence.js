const mongodb = require('mongodb')

let client = undefined
let db = undefined
let users = undefined
let session = undefined

async function connectDatabase() {
    if (!client) {
        client = new mongodb.MongoClient('mongodb+srv://60087697:1%40Admin34!!@abdulla.ei0qkv0.mongodb.net/')
        await client.connect()
        db = client.db('Project')
        users = db.collection('UserAccounts')
        session = db.collection('SessionData')
    }
}

async function getUserDetails(username) {
    await connectDatabase()
    let result  = await users.find({UserName: username})
    let resultData = await result.toArray()
    if (resultData.length > 0) {
        return resultData[0];
    } else {
        return null; // or you can return an object with default values
    }

}

async function saveSession(uuid, expiry, data) {
    await connectDatabase()
    await session.insertOne({
        SessionKey : uuid,
        Expiry : expiry,
        Data : data
    })

}

async function getSessionData(key) {
    await connectDatabase()
    let result = await session.find({SessionKey : key})
    let resultData = await result.toArray()
    return resultData[0]

}

async function deleteSession(key) {
    
    await session.deleteOne({SessionKey : key})
}

async function registerUser(username, password) {
    await connectDatabase();
    await users.insertOne({ UserName: username, Password: password });
}


module.exports = {
    registerUser,
    getUserDetails,
    saveSession, getSessionData, 
    deleteSession
}