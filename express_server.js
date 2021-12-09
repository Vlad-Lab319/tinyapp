const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { findUserByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Makes cookie readable / parses
app.use(
  cookieSession({
    name: "session",
    keys: ["Some funny stuff to test this feature", "booobooobooo"],
  })
);

app.set("view engine", "ejs");

// Dummy links database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

// Dummy users database
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

// Add new links pair view endpoint
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  // console.log('New page user object:', user);

  if(!user) {
    res.redirect('/login');
    return null;
  }

  const templateVars = {
    // username: req.cookies["username"],
    user,
  };
  res.render("urls_new", templateVars);
});

// Display all links pairs
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    // return res.status(403).send("Login please!");
    res.redirect('/login');
    return null;
  }
  const user = users[userID];
  const urlsToDisplay = urlsForUser(userID);
  console.log('Filtered urls: ', urlsToDisplay);
  const templateVars = { 
    // username: req.cookies["username"],
    user,
    // urls: urlDatabase 
    urls: urlsToDisplay
  };
  res.render("urls_index", templateVars);
});

// Show certain pair details
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!findShortUrlInUrlDatabase(shortURL)) {
    return res.status(403).send("Such shortURL is not found");
    
  }

  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { 
    // username: req.cookies["username"],
    user,
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL 
  };
  res.render("urls_show", templateVars);
});

// Add new set of links 
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const userID = req.session.user_id;
  let shortURLGenerated = generateRandomString();
  console.log(shortURLGenerated);
  urlDatabase[shortURLGenerated] = {
    longURL: req.body.longURL,
    userID: userID
  };

  console.log(urlDatabase);

  res.redirect(`/urls/${shortURLGenerated}`);
});

// Update long link
app.post("/urls/:shortURL", (req, res) => {

  const userID = req.session.user_id;
  const user = users[userID];

  if(!user) {
    return res.status(403).send("Only registred users can edit urls!");
  }

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  // const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  console.log(urlDatabase);

  res.redirect('/urls');
});


// Redirecting to long URL 
app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  if (!findShortUrlInUrlDatabase(shortURL)) {
    return res.status(403).send("Such shortURL is not found");
    
  }
  
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(longURL);
  res.redirect(longURL);
});

// Delete from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if(!user) {
    return res.status(403).send("Only registred users can delete urls!");
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// POST / Login endpoint
app.post("/login", (req, res) => {
  console.log('Login req body: ', req.body);  // Log the POST request body to the console

  const email = req.body.email;
  
  const user = findUserByEmail(email, users);
  
  if (!user) {
    return res.status(403).send("User with such e-mail is not found");
  }

  const password = req.body.password;
  const checkPassword = bcrypt.compareSync(password, user.password);

  if(!checkPassword) {
    return res.status(403).send("Password does not mutch");
  }

  req.session.user_id = user.id;
  res.redirect('/urls/');
});

// Logout view endpoint
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect('/urls/');
});

// Register endpoint
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user
  };
  res.render('user_reg', templateVars);
});

// POST / register endpoint
app.post('/register', (req, res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("E-mail and password cannot be blank");
  }

  const user = findUserByEmail(email, users);

  if(user) {
    return res.status(400).send("User with such e-mail already exists")
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  }
  req.session.user_id = userID;
  console.log(users[userID]);
  res.redirect('/urls');
});

// Login view endpoint
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user
  };
  res.render('user_login', templateVars);
});


// Helper functions
// Random string generator
function generateRandomString() {
  let randomString =  Math.random().toString(36).replace(/\W+/, '').substr(0, 6);
  return randomString;
};

// function findUserByEmail(email) {
//   for(let userID in users) {
//     let user = users[userID];
//     if(user.email === email) {
//       return user;
//     }
//   }
//   return null;
// };




function findShortUrlInUrlDatabase(shortURL) {
  let urlDatabaseKeys = Object.keys(urlDatabase);
  for(let urlToCheck of urlDatabaseKeys) {
    if(urlToCheck === shortURL) {
      return true;
    }
  }
  return false;
};

function urlsForUser(id) {
  let urlsToDisplay = {};
  let urlDatabaseKeys = Object.keys(urlDatabase);
  console.log('URLs for user database keys: ', urlDatabaseKeys, 'id: ', id);
  for(let url of urlDatabaseKeys) {
    
    if(urlDatabase[url].userID === id) {
      console.log('urlDatabase[url].userID: ', urlDatabase[url].userID);
      urlsToDisplay[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      }
    }
  }
  console.log('Return from urlsForUser: ', urlsToDisplay);
  return urlsToDisplay;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});