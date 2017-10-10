const express =require("express");
const app = express();
require("dotenv").config();

const PORT =process.env.PORT || 8080;

app.set("view engine", "ejs");


// make connection for server
app.listen(PORT, ()=>{
  console.log(`The server for TinyApp is on!!`);
});