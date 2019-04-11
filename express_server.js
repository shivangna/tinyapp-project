
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

//stores and accesses the users in the app
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//makes POST request body human readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});


//renders the URLs
app.get("/urls", (req, res) => {
  let templateVars = {user_id: req.cookies["user_id"], urls: urlDatabase };
  //since views ia Express convention, it automatically looks under views for template files, therefore directory (views) and .ejs in extension do not need to be specified
  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// renders the page with the form that allows a user to input a longURL and send that data to API via a POST request
app.get("/urls/new", (req, res) => {
  let templateVars = { userInfo: users[req.cookies["user_id"]],  user_id: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
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

// user gives short URL which gets redirected to its long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//route handles POST requests when user visits urls/new and also handles POST requests from the form. Sends that to the body parser
app.post("/urls", (req, res) => {
  var shortURLgenerated = generaterandomString();
  urlDatabase[shortURLgenerated] = req.body.longURL;  // Log the POST request body to the console
  console.log(urlDatabase);
  res.redirect("/urls/" + shortURLgenerated);         // Respond with 'Ok' (we will replace this)
});


//handles delete requests
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL // obtains the shorturl to delete
  delete urlDatabase[urlToDelete];
  console.log(urlDatabase);
  res.redirect("/urls");         // after deleted, redirects user to the index page
});




//short URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase};
  res.render("urls_show", templateVars);
});



//route handles POST requests to /login. Sets cookie named username to the value submitted
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookies["user_id"];
  res.redirect("/urls");
});


//login
app.get("/login", (req, res) => {
  res.render("user_login")
});


//handles the logout page and deletes the cookies
app.post("/logout", (req, res) => {
  //const username = req.body.username;
  res.clearCookie('username');
  res.redirect("/urls");
});


//user registration page, renders the page
app.get("/register", (req, res) => {
  res.render("user_registration");
});


//adds the new user received from the page to global users object
app.post("/register", (req, res) => {
  //const username = req.body.username;
  const user_email = req.body.email;
  const user_password = req.body.password;
  const user_id = generaterandomString();
  if (user_email == false || user_password == false) {
    res.status(400).send("enter both username and password");
  } else if (searchUserProperties(user_email, "email") === true) {
    res.status(400).send("email already in use");
  } else {
    users[user_id] = {'id': user_id, 'email': user_email, 'password' : user_password}
    res.cookie('user_id', user_id);
    res.redirect("/urls");
  }
});



//this email checks if given email for registration already exists in user object
function searchUserProperties (propertyToSearch, property) {
  for (var userids in users) {
    if (propertyToSearch === users[userids][property]) {
      return true;
    }
  }
}


//pass the objects based on the user ID.
function returnUserInfo (searchUser) {
  return users[searchUser];
}



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


