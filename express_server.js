var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//renders the URLs
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  //since views ia Express convention, it automatically looks under views for template files, therefore directory (views) and .ejs in extension do not need to be specified
  res.render("urls_index", templateVars);
});

// renders the page with the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//currently response to obtain from urls/new to avoid POST error
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//renders information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase};
  res.render("urls_show", templateVars);
});



//generates random alphanumeric character
function generaterandomString() {
  var randomString = "";
  var possibleChars = "1234567890abcdefghijklmnopqrstuvqwxyz";
  for (i = 0; i < 6; i++) {
    randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  };
  return randomString;
}

console.log(generaterandomString())


