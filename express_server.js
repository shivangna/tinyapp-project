var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");


app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["TinyApp key"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//makes POST request body human readable
app.use(bodyParser.urlencoded({extended: true}));



const urlDatabase = {};

//stores and accesses the users in the app
const users = {};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls")
  } else {
  res.redirect("/login");
}});


//route handles POST requests to /login. Sets cookie named username to the value submitted
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const verifiedUserID = credentialVerify(userEmail, userPassword);
  if (verifiedUserID) {
    req.session.user_id = verifiedUserID;
    res.redirect("/urls");
  } else {
    res.status(403).send("please input the correct credentials")
  }
});

//renders the URLs
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {user_id: req.session.user_id, urlDatabase: urlDatabase, users: users};
  //since views ia Express convention, it automatically looks under views for template files, therefore directory (views) and .ejs in extension do not need to be specified
  res.render("urls_index", templateVars);
  } else {
    res.status(400).send("please log in at localhost:8080/login to access your URLs")
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// renders the page with the form that allows a user to input a longURL and send that data to API via a POST request
app.get("/urls/new", (req, res) => {
  let templateVars = { users: users,  user_id: req.session.user_id};
  if (req.session.user_id) {
  res.render("urls_new", templateVars);
} else res.redirect("/login")
});



//updates the long URL
app.post("/urls/:shortURL/", (req, res) => {
  const theShortURL = req.params.shortURL
  console.log(theShortURL)
  const UpdatedLongURL = req.body.longURL

  if (urlDatabase[theShortURL]['userID'] === req.session.user_id) {
  for (var urlKeyValues in urlDatabase) {
    if (urlKeyValues === theShortURL) {
      urlDatabase[urlKeyValues]['longURL'] = UpdatedLongURL;
    }}};
  res.redirect("/urls");
});

// user gives short URL which gets redirected to its long url
app.get("/u/:shortURL", (req, res) => {
  shortURLRedirect = req.params.shortURL
  res.redirect(urlDatabase[shortURLRedirect]['longURL']);
});

//route handles POST requests when user visits urls/new and also handles POST requests from the form. Sends that to the body parser
app.post("/urls", (req, res) => {
  var shortURLgenerated = generaterandomString();
  urlDatabase[shortURLgenerated] = {longURL: req.body.longURL, userID: req.session.user_id};  // Log the POST request body to the console
  console.log(urlDatabase);
  res.redirect("/urls/" + shortURLgenerated);         // Respond with 'Ok' (we will replace this)
});


//handles delete requests
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL // obtains the shorturl to delete
  if (urlDatabase[urlToDelete]['userID'] === req.session.user_id) {
  delete urlDatabase[urlToDelete];
  console.log(urlDatabase);
  }
  res.redirect("/urls");         // after deleted, redirects user to the index page
});


//short URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user_id: req.session.user_id, shortURL: req.params.shortURL, urlDatabase: urlDatabase, users: users};
  res.render("urls_show", templateVars);
});



//login
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
  res.render("user_login");
  }
});


//handles the logout page and deletes the cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//user registration page, renders the page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
  res.render("user_registration")
  };
});


//adds the new user received from the page to global users object
app.post("/register", (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password
  const hashedPassword = bcrypt.hashSync(user_password,10);
  if (user_email == false || user_password == false) {
    res.status(400).send("enter both username and password");
  } else if (searchUserProperties(user_email, "email") === true) {
    res.status(400).send("email already in use");
  } else {
    let idGenerated = generaterandomString();
    let hashedPassword = bcrypt.hashSync(req.body.password,10)
    users[idGenerated] = {'id': idGenerated, 'email': user_email, 'password' : hashedPassword}
    req.session.user_id;
    res.redirect("/urls");
  }
});







//All functions below


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




//verifies the email and password of the user
function credentialVerify(email, password) {
  for (let user in users) {
    let passwordToCompare = users[user]['password'];
    if (users[user]['email'] === email && (bcrypt.compareSync(password, passwordToCompare))) {
      const verifiedID = users[user]['id'];
      return verifiedID;
    }
  }
  return false;
};


function urlsForUser(id) {
  var specificUserObject = {};
  for (var key in urlDatabase) {
      var url = urlDatabase[key];
      if (url.userID === id) {
        specificUserObject[key] = {'longURL': url['longURL'], 'userID': url['userID']}
      }
    }
return specificUserObject
  }



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");


