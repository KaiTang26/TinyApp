const express =require("express");
const bodyParser =require("body-parser");
const cookieParser =require("cookie-parser");
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())



// let username="Not Registered Yet!";

// let urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
//   };


app.set("view engine", "ejs");

app.get("/urls", (req, res)=>{
  let templateVars ={urls: urlDatabase,
                    PORT: PORT};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req,res)=>{
  // currentID =req.cookies["user_id"]
  let templateVars ={PORT:PORT};
  res.render("urls_new", templateVars)
});

app.post("/urls", (req, res)=>{
  let longUrl=req.body;
  let shortUrl =generateRandomString();
  urlDatabase[shortUrl]=longUrl.longURL;
  console.log(urlDatabase);
  res.redirect(`http://localhost:${PORT}/urls`);
});

function generateRandomString(){
  let result = '';
  let chars ="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

app.get("/urls/:id", (req, res)=>{
  let templaterVars ={shortURL: req.params.id,
                      longURL: urlDatabase[req.params.id],
                      link: `http://localhost:${PORT}/u/${req.params.id}`,
                      PORT:PORT};
  res.render("urls_show", templaterVars);
});


app.get("/u/:shortURL", (req, res)=>{
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res)=>{
  delete urlDatabase[req.params.id]
  res.redirect(`http://localhost:${PORT}/urls`);
});

app.post("/urls/:id/updata", (req, res)=>{
  let longUrl=req.body;
  urlDatabase[req.params.id]=longUrl.longURL;
  console.log(urlDatabase);
  res.redirect(`http://localhost:${PORT}/urls`);
});

app.get("/login", (req, res)=>{
  let currentID = req.cookies["user_id"];

  if(currentID){
    let templateVars ={PORT:PORT,
                     user:users[currentID]};
    res.render("login", templateVars);
  }else{
    let templateVars ={PORT:PORT,
                     user:users["000"]};
    res.render("login", templateVars);
  }

});

app.post("/login", (req, res)=>{
  let Em=req.body.UserEmail;
  let Pw=req.body.UserPassword;
  let test = registionCheck(Pw,Em);

  if (test===40 || test===20) {
    res.sendStatus(403);

  }else{
    res.cookie("user_id", test);
    res.redirect(`http://localhost:${PORT}/urls`);
  }

});

app.post("/logout", (req, res)=>{

  res.clearCookie("user_id");
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
  if(test!==20){
    res.sendStatus(400);
  }else{
    let newUer={id:useID,
              email:Em,
              password:Pw};
    res.cookie("user_id", useID);
    users[useID]=newUer;
    res.redirect(`http://localhost:${PORT}/urls`);
  }
  console.log(users);

});

function registionCheck(Pw,Em){


  if(!(Pw && Em)){ return 40; }

  if(Pw && Em){
    for(let key in users){
      if(users[key].password===Pw && users[key].email===Em){ return key;}
    }
  }

  return 20;

};


function generateUserID(){
  let result = '';
  let chars ="0123456789";
  for (var i = 3; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  };

const users = {
  "000": {
    id: "000",
    email: "",
    password: ""
  },

  "123": {
    id: "123",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
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