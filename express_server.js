// express_server.js is server for TinyApp project
// load the things we need

const express =require("express");
const bodyParser =require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const app = express();

// set env verable for PORT
require("dotenv").config();

const PORT = process.env.PORT || 8080;

// set up bodyParser to handle "POST" request
app.use(bodyParser.urlencoded({extended: true}));

// set up the cookie name as "user_id"
app.use(cookieSession({
  name: 'session',
  keys: ["user_id"]
}));

// set the view engine to ejs
app.set("view engine", "ejs");

// home page "get" router
app.get("/", (req, res)=>{
  let templateVars ={
    urls: urlDatabase,
    PORT: PORT
  };
  res.render("home", templateVars);
});

//urls presonal account page "get" router, when "user_id" missing, render to login_reminder page
app.get("/urls", (req, res)=>{
  let userID =req.session.user_id;
  console.log(userID);
  if(userID){
    let templateVars ={
      urls: urlDatabase,
      ID:userID,
      PORT: PORT,
      email: users[userID].email
    };
    res.render("urls_index", templateVars);
  }else{
    let templateVars ={
      PORT: PORT,
      StatusCode:400
    };
    res.render("login_reminder", templateVars);
  }
});

//adding new urls page "get" router, when "user_id" missing, render to login_reminder page
app.get("/urls/new", (req,res)=>{
  let userID =req.session.user_id;
  if(userID){
    let templateVars ={
      PORT:PORT
    };
    res.render("urls_new", templateVars)
  }else{
    let templateVars ={
      PORT: PORT,
      StatusCode:400
    };
    res.render("login_reminder", templateVars);
  }
});

 /*"poat" request for create new short url for login user and redirect to
personal account page, when "user_id" missing,render to login_reminder page*/
app.post("/urls", (req, res)=>{
  let userID =req.session.user_id;
  let longUrl=req.body.longURL;
  let shortUrl =generateRandomString();
  if(!urlDatabase[userID]) {
    urlDatabase[userID] = {[shortUrl]:longUrl};
  }else{
    urlDatabase[userID][shortUrl]= longUrl;
  }
  res.redirect(`http://localhost:${PORT}/urls`);
});


//function for generate random short url
function generateRandomString(){
  let result = '';
  let chars ="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

//urls update page for login user "get" requst router, login user only can update their own short urls
app.get("/urls/:surl", (req, res)=>{
  let userID =req.session.user_id;
  let sUrl = req.params.surl;
  let test =urlCheck(userID, sUrl);

  if(test){
    let templaterVars ={
      shortURL: sUrl,
      longURL: urlDatabase[userID][sUrl],
      PORT:PORT
    };
    res.render("urls_show", templaterVars);
  }else{
    let templateVars = {
      PORT: PORT,
      StatusCode: 403
    };
    res.render("login_reminder", templateVars);
  }
});

// function used to check which urls belong to which user
function urlCheck(ID, surl){

  if(urlDatabase[ID]){
    if(urlDatabase[ID][surl]){
      return true;
    }
  }
  return false;
};

//"post" request for delete urls by their owner
app.post("/urls/:id/delete", (req, res)=>{
  let userID =req.session.user_id;
  delete urlDatabase[userID][req.params.id]
  res.redirect(`http://localhost:${PORT}/urls`);
});

// "post" request for update urls by their owner
app.post("/urls/:id/update", (req, res)=>{
  let userID =req.session.user_id;
  let longUrl=req.body;
  urlDatabase[userID][req.params.id]=longUrl.longURL;
  // console.log(urlDatabase);
  res.redirect(`http://localhost:${PORT}/urls`);
});

//login and logout page rounder and check does user already logged
app.get("/login", (req, res)=>{
  let userID = req.session.user_id;

  if(userID){
    // console.log(users[ID]);
    // console.log(users);
    let templateVars ={
      PORT:PORT,
      user:users[userID]
    };
    res.render("login", templateVars);
  }else{
    let templateVars ={
      PORT:PORT,
      user:""
    };
    res.render("login", templateVars);
  }
});

//login page "post" request router, check does email and password match or not alse reset id to cookie
app.post("/login", (req, res)=>{
  let Em=req.body.UserEmail;
  let Pw =req.body.UserPassword;

  for(let key in users){
    if(users[key].email===Em){
      if(bcrypt.compareSync(Pw,users[key].password)){
        req.session.user_id=key;
        res.redirect(`http://localhost:${PORT}/urls`);
        return;
      }
    }
  }
  res.sendStatus(403);
});

// handle logout request and clean up the cookie
app.post("/logout", (req, res)=>{
  req.session = null;
  res.redirect(`http://localhost:${PORT}/login`);
});

// handle register page "get" request and render to register page
app.get("/register", (req, res)=>{
  let templateVars ={PORT:PORT};
  res.render("get_register", templateVars);
});

// handle register post request and check does identical email register more than once, and sign up id to cookie
app.post("/register", (req, res)=>{
  let userID = generateUserID();
  let Pw = req.body.password;
  let Em = req.body.email;
  let test = registionCheck(Pw,Em);
  // console.log(test);
  if(test!==200){
    res.sendStatus(test);
  }else{
    let newUser={
      id:userID,
      email:Em,
      password:bcrypt.hashSync(Pw,10)
    };
    req.session.user_id=userID;
    // res.cookie("user_id", useID);
    users[userID]=newUser;
    // console.log(users);
    res.redirect(`http://localhost:${PORT}/urls`);
  }
  // console.log(users);
});

// function for check does same email exist in database
function registionCheck(Pw,Em){
  if(!(Pw && Em)){return 400;}
  if(Pw && Em){
    for(let key in users){
      if(users[key].email===Em){ return 400;}
    }
  }
  return 200;
};

// function for generate userid
function generateUserID(){
  let result = '';
  let chars ="0123456789";
  for (var i = 3; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

//url database
let urlDatabase = {
  "123":{"b2xVn2": "http://www.lighthouselabs.ca"},
  "345":{"9sm5xK": "http://www.google.com"}
   };

//user database
const users = {
  "123": {
    id: "123",
    email: "user@example.com",
    password: "$2a$10$qYExkuicKUP3.Q.R615tSedMCTu1M8MY0vl.zofu4a5cLqNVNgqb6"
  },
 "345": {
    id: "345",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


// make connection for server
app.listen(PORT, ()=>{
  console.log(`The server for TinyApp is on!!`);
});