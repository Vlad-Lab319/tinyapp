const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { findUserByEmail, generateRandomString, findShortUrlInUrlDatabase, urlsForUser } = require('./helpers');
const { urlDatabase, users } = require('./data/dummyData');


app.set("view engine", "ejs");

/*
// Middleware
*/

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// Makes cookie readable / parses
app.use(
  cookieSession({
    name: "session",
    keys: ["Some funny stuff to test this feature", "booobooobooo"],
  })
);

/*
// General routes
*/

// Main page redirections
app.get("/", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.redirect('/login');
  }
  
  return res.redirect('/urls');
});

// Display all links pairs in user's account
app.get("/urls", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  const urlsToDisplay = urlsForUser(userID, urlDatabase);
  const templateVars = {
    user,
    urls: urlsToDisplay
  };
  res.render("urls_index", templateVars);
});

// New links pair form
app.get("/urls/new", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    res.redirect('/login');
    return null;
  }

  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

// Show certain pair details
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.redirect('/urls');
  }

  if (!findShortUrlInUrlDatabase(shortURL, urlDatabase)) {
    return res.status(403).send("Such shortURL is not found in your account");
  }

  const templateVars = {
    user,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL
  };

  res.render("urls_show", templateVars);
});

// Add new set of links
app.post("/urls", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.status(403).send("Only registred users can create short urls!");
  }

  let shortURLGenerated = generateRandomString();
  urlDatabase[shortURLGenerated] = {
    longURL: req.body.longURL,
    userID: userID
  };

  res.redirect(`/urls/${shortURLGenerated}`);
});

// Update long link
app.post("/urls/:shortURL", (req, res) => {

  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.status(403).send("Only registred users can edit urls!");
  }

  const shortURL = req.params.shortURL;

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Users can edit only their own urls!");
  }

  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;

  res.redirect('/urls');
});

// Redirecting to long URL
app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  if (!findShortUrlInUrlDatabase(shortURL, urlDatabase)) {
    return res.status(403).send("Such shortURL is not found");
    
  }
  
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Delete from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (!user) {
    return res.status(403).send("Only registred users can delete urls!");
  }

  const shortURL = req.params.shortURL;

  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Users can delete only their own urls!");
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

/*
// LOGIN / LOGOUT
*/

// Login form
app.get('/login', (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user
  };
  res.render('user_login', templateVars);
});

// Logout
app.post("/logout", (req, res) => {
  delete req.session.userId;
  res.redirect('/urls/');
});

// POST / Login
app.post("/login", (req, res) => {

  const email = req.body.email;
  
  const user = findUserByEmail(email, users);
  
  if (!user) {
    return res.status(403).send("User with such e-mail is not found");
  }

  const password = req.body.password;
  const checkPassword = bcrypt.compareSync(password, user.password);

  if (!checkPassword) {
    return res.status(403).send("Password does not mutch");
  }

  req.session.userId = user.id;
  res.redirect('/urls/');
});

/*
// REGISTER
*/

// Register form
app.get('/register', (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];

  if (user) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user
  };
  res.render('user_reg', templateVars);
});

// POST / register
app.post('/register', (req, res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("E-mail and password cannot be blank");
  }

  const user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send("User with such e-mail already exists");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  req.session.userId = userID;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tinny app is listening on port ${PORT}!`);
});