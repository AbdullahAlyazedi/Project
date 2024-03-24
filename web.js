const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const business = require('./business.js')

let app = express()
 
const handlebars = require("express-handlebars")
app.set('views', __dirname+"/templates")
app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine())
app.use(bodyParser.urlencoded())
app.use(cookieParser())




app.get('/', (req, res) => {
    res.render('login',  {layout: undefined, message: req.query.message})
})

app.post('/', async (req,res) => {
    let username = req.body.username
    let password = req.body.password
    //let accountType = await business.checkLogin(req, username, password)
    
    /*if (userType)
    console.log("welcome")
    res.send('remove this!')*/
    if (username == "" || password == "") {
        res.redirect("/?message=Invalid Username/Password")
        return
    }
   
    let userType = await business.checkLogin(username, password)
    
    if(userType){
        console.log("yes it's there")
    }else{
        console.log("no it's not there")
    }
    
    // if (!userType) {
    //     res.redirect("/?message=Invalid Username/Password")
    //     return
    // }

    // if (!userType){
    //     res.redirect("/signup?message=Username not found. Please sign up.");

    // }

    if(!userType){
        res.redirect("/signup")
    }

    app.get('/signup', (req, res) => {
        res.render('signup', { layout: undefined })
    });
    
    
    app.post('/signup', async (req, res) => {
        let username = req.body.username
        let password = req.body.password
        try {
            await business.registerUser(username, password) 
            res.redirect('/login')
        } catch (error) {
            console.error('Error registering user:', error)
            res.status(500).send('Registration failed')
        }
    });



    //else {res.redirect("/signup?message=Username not found. Please sign up.");}

    let session = await business.startSession({
        UserName: username,
        UserType: userType

    })
    res.cookie('projectsession', session.uuid, {expires: session.expiry})

    if(userType == "administrator"){
        res.redirect("/administrator")
    }else if(userType == "member"){
        res.redirect("/member")
    }

})


app.get('/administrator', async (req, res) => {
    let sessionKey = req.cookies.projectsession
    if(!sessionKey){
        res.redirect("/?message=Not logged in")
        return
    }
    let sessionData = await business.getSessionData(sessionKey)
    if (!sessionData) {

        res.redirect("/?message=Not logged in")
        return
    }
    if(sessionData && sessionData.Data && sessionData.Data.UserType && sessionData.Data.UserType != 'administrator'){
        res.redirect("/message=Invalid UserType")
        return
    }

    res.render('administrator_landing', {layout: undefined, username: sessionData.Data.UserName})
})

app.get('/logout', async (req, res) => {
    await business.deleteSession(req.cookies.projectsession)
    res.cookie("projectsession","",{expires:new Date(Date.now())})
    res.redirect("/")
})

app.get('/member', async (req, res) => {
    let sessionKey = req.cookies.projectsession
    if (!sessionKey) {
        res.redirect("/?message=Not logged in")
        return
    }
    let sessionData = await business.getSessionData(sessionKey)
    if (!sessionData) {
        res.redirect("/?message=Not logged in")
        return
    }
    if (sessionData && sessionData.Data && sessionData.Data.UserType && sessionData.Data.UserType != 'member') {
        res.redirect("/?message=Invalid User Type")
        return
    }
    res.render('member_landing', {layout:undefined, username: sessionData.Data.UserName})
    
})


app.get('/feeding-sites', async (req, res) => {
    try {
        let feedingSites = await business.getFeedingSites()
        res.render('feeding_sites', { layout: undefined, feedingSites: feedingSites })
    } catch (error) {
        console.error('Error fetching feeding sites:', error)
        res.status(500).send('Failed to fetch feeding sites')
    }
});


app.listen(8000, () => { console.log("Running")})