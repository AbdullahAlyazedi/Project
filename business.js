const persistence = require("./persistence.js")
const crypto = require("crypto")

// This function will return the type of user that attempted to log in.  If the username/password
// is incorrect the function returns undefined.
async function checkLogin(username, password) {
    //let user = await persistence.connectDatabase()
    //if (username == req.body.username && password == req.body.password)

    let details = await persistence.getUserDetails(username);

    if (details && details.UserName === username && details.Password === password) {
        return details.UserType;
        //return details.AccountType;
    }
    
    return undefined
}


async function startSession(data) {
    let uuid = crypto.randomUUID()
    let expiry = new Date(Date.now() + 1000 * 60 * 1)
    await persistence.saveSession(uuid, expiry, data)
    return {
        uuid: uuid,
        expiry: expiry
    }

}



async function getSessionData(key) {
    return await persistence.getSessionData(key)
}

async function deleteSession(key) {
    return await persistence.deleteSession(key)
}

async function registerUser(username, password){
    await persistence.registerUser(username, password)
}


module.exports = {
    registerUser,
    checkLogin,
    startSession,getSessionData, deleteSession
}