
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')
app.set("view engine", "ejs");
app.use(cookieParser())

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//makes POST request body human readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

// renders the page with the form that allows a user to input a longURL and send that data to API via a POST requuest
app.get("/urls/new", (req, res) => {
let templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//renders the URLs
app.get("/urls", (req, res) => {
  let templateVars = {username: req.cookies["username"], urls: urlDatabase };
  //since views ia Express convention, it automatically looks under views for template files, therefore directory (views) and .ejs in extension do not need to be specified
  res.render("urls_index", templateVars);
});

//handles delete requests
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL // obtains the shorturl to delete
  delete urlDatabase[urlToDelete];
  console.log(urlDatabase);
  res.redirect("/urls");         // after deleted, redirects user to the index page
});


//updates the long URL
app.post("/urls/:shortURL/", (req, res) => {
  const theShortURL = req.params.shortURL
  console.log(theShortURL)
  const UpdatedLongURL = req.body.longURL
  for (var urlKeyValues in urlDatabase) {
    if (urlKeyValues === theShortURL) {
      urlDatabase[urlKeyValues] = UpdatedLongURL;
    }};
  res.redirect("/urls");
});



//route handles POST requests when user visits urls/new and also handles POST requests from the form. Sends that to the body parser
app.post("/urls", (req, res) => {
  var shortURLgenerated = generaterandomString();
  urlDatabase[shortURLgenerated] = req.body.longURL;  // Log the POST request body to the console
  console.log(urlDatabase);
  res.redirect("/urls/" + shortURLgenerated);         // Respond with 'Ok' (we will replace this)
});



//short URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase};
  res.render("urls_show", templateVars);
});


// user gives short URL which gets redirected to its long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//route handles POST requests to /login. Sets cookie named username to the value submitted
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});


//handles the logout page and deletes the cookies
app.post("/logout", (req, res) => {
  //const username = req.body.username;
  res.clearCookie('username');
  res.redirect("/urls");
});



//generates random alphanumeric character that will serve as the shortURL
function generaterandomString() {
  var randomString = "";
  var possibleChars = "1234567890abcdefghijklmnopqrstuvqwxyzABCDEFGHIJKLMNOPQRSTUVWYZ";
  for (i = 0; i < 6; i++) {
    randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  };
  return randomString;
}



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


