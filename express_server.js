const express =require("express");
const bodyParser =require("body-parser");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  };


app.set("view engine", "ejs");

app.get("/urls", (req, res)=>{

  let templateVars ={urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req,res)=>{
  res.render("urls_new")
});

app.post("/urls", (req, res)=>{
  let longUrl=req.body;
  let shortUrl =generateRandomString();
  urlDatabase[shortUrl]=longUrl.longURL;
  console.log(urlDatabase);
  res.redirect(`http://localhost:${PORT}/urls/${shortUrl}`);
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
                      link: `http://localhost:${PORT}/u/${req.params.id}`};
  res.render("urls_show", templaterVars);
});


app.get("/u/:shortURL", (req, res)=>{
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

// make connection for server
app.listen(PORT, ()=>{
  console.log(`The server for TinyApp is on!!`);
});