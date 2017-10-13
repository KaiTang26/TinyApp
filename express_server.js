const express =require("express");
const bodyParser =require("body-parser");
// const cookieParser =require("cookie-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser())

app.use(cookieSession({
  name: 'session',
  keys: ["user_id"]
}));


app.set("view engine", "ejs");

app.get("/", (req, res)=>{
  let templateVars ={urls: urlDatabase,
                       PORT: PORT};
  res.render("home", templateVars);
});


app.get("/urls", (req, res)=>{
  let ID =req.session.user_id;
  if(ID){
    let templateVars ={urls: urlDatabase,
                         ID:ID,
                       PORT: PORT};
    res.render("urls_index", templateVars);
  }else{
    let templateVars ={PORT: PORT,
                 StatusCode:400};
    res.render("login_reminder", templateVars);
  }
});


app.get("/urls/new", (req,res)=>{

  if(req.session.user_id){
    let templateVars ={PORT:PORT};
    res.render("urls_new", templateVars)
  }else{
    let templateVars ={PORT: PORT,
                 StatusCode:400};
    res.render("login_reminder", templateVars);
  }
});


app.post("/urls", (req, res)=>{
  let ID =req.session.user_id;
  console.log(ID);
  let longUrl=req.body.longURL;
  let shortUrl =generateRandomString();
  if(!urlDatabase[ID]) {
    urlDatabase[ID] = {[shortUrl]:longUrl};
  }else{
    urlDatabase[ID][shortUrl]= longUrl;
  }
  res.redirect(`http://localhost:${PORT}/urls`);
});



function generateRandomString(){
  let result = '';
  let chars ="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


app.get("/urls/:id", (req, res)=>{
  let ID =req.session.user_id;
  let par = req.params.id;
  let test =urlCheck(ID, par);

  if(test){
    let templaterVars ={shortURL: req.params.id,
                      longURL: urlDatabase[ID][req.params.id],
                      PORT:PORT};
  res.render("urls_show", templaterVars);
  }else{
    let templateVars ={PORT: PORT,
                 StatusCode:403};
    res.render("login_reminder", templateVars);
  }
});


function urlCheck(ID, par){

  for(let key in urlDatabase){
    if(key === ID){
      for(let su in urlDatabase[ID]){
        if(su===par){
          return true;
       }

      }
    }
  }

  return false;
};



app.post("/urls/:id/delete", (req, res)=>{
  let ID =req.session.user_id;
  delete urlDatabase[ID][req.params.id]
  res.redirect(`http://localhost:${PORT}/urls`);
});


app.post("/urls/:id/updata", (req, res)=>{
  let ID =req.session.user_id;
  let longUrl=req.body;
  urlDatabase[ID][req.params.id]=longUrl.longURL;
  console.log(urlDatabase);
  res.redirect(`http://localhost:${PORT}/urls`);
});


app.get("/login", (req, res)=>{
  let currentID = req.session.user_id;

  if(currentID){
    console.log(users[currentID]);
    console.log(users);
    let templateVars ={PORT:PORT,
                       user:users[currentID]};
    res.render("login", templateVars);
  }else{
    console.log("0",currentID);
    let templateVars ={PORT:PORT,
                       user:""};
    res.render("login", templateVars);
  }
});


app.post("/login", (req, res)=>{
  let Em=req.body.UserEmail;
  let Pw =req.body.UserPassword;
  console.log(Pw);

  for(let key in users){
    if(users[key].email===Em){
      console.log(users[key].password);
      console.log(Pw);
      if(bcrypt.compareSync(Pw,users[key].password)){
        req.session.user_id=key;
        // res.cookie("user_id", key);
        res.redirect(`http://localhost:${PORT}/urls`);
        return;
      }
    }
  }

  res.sendStatus(403);

});


app.post("/logout", (req, res)=>{
  req.session = null;
  // res.clearCookie("user_id");
  res.redirect(`http://localhost:${PORT}/login`);
  });


app.get("/register", (req, res)=>{
  let templateVars ={PORT:PORT};
  res.render("get_register", templateVars);
});


app.post("/register", (req, res)=>{
  let useID = generateUserID();
  let Pw = req.body.password;
  let Em = req.body.email;
  let test = registionCheck(Pw,Em);
  // console.log(test);
  if(test!==200){
    res.sendStatus(400);
  }else{
    let newUer={id:useID,
              email:Em,
              password:bcrypt.hashSync(Pw,10)};
    req.session.user_id=useID;
    // res.cookie("user_id", useID);
    users[useID]=newUer;
    console.log(users);
    res.redirect(`http://localhost:${PORT}/urls`);
  }
  // console.log(users);
});


function registionCheck(Pw,Em){
  if(!(Pw && Em)){ return 400; }
  if(Pw && Em){
    for(let key in users){
      if(users[key].email===Em){ return 400;}
    }
  }
  return 200;
};


function generateUserID(){
  let result = '';
  let chars ="0123456789";
  for (var i = 3; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


let urlDatabase = {
  "123":{"b2xVn2": "http://www.lighthouselabs.ca"},
  "345":{"9sm5xK": "http://www.google.com"}
   };


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

// console.log(bcrypt.hashSync("purple-monkey-dinosaur",10));


// make connection for server
app.listen(PORT, ()=>{
  console.log(`The server for TinyApp is on!!`);
});