const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

// Dummy links database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


app.get("/", (req, res) => {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);

  res.send("Hello!");
});


// Add new links pair
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID];
  // console.log('New page user object:', user);

  if(!user) {
    res.redirect('/login');
    return null;
  }

  const templateVars = {
    // username: req.cookies["username"],
    user,
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

// Display all links pairs
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID];
  const templateVars = { 
    // username: req.cookies["username"],
    user,
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

// Show certain pair details
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID];
  const templateVars = { 
    // username: req.cookies["username"],
    user,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

// Add new set of links 
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURLGenerated = generateRandomString();
  console.log(shortURLGenerated);
  urlDatabase[shortURLGenerated] = req.body.longURL;
  res.redirect(`/urls/${shortURLGenerated}`);
});

// Update long link
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  // const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);

  res.redirect('/urls');
});


// Redirecting to long URL 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log(longURL);
  res.redirect(longURL);
});

// Delete from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// POST / Login endpoint
app.post("/login", (req, res) => {
  console.log('Login req body: ', req.body);  // Log the POST request body to the console

  const email = req.body.email;
  const password = req.body.password;
  
  const user = findUserByEmail(email);
  
  if (!user) {
    return res.status(403).send("User with such e-mail is not found");
  }

  if(user.password !== password) {
    return res.status(403).send("Password does not mutch");
  }

  const cookies = user.id;

  res.cookie('user_id', `${cookies}`);
  console.log('Cookies: ', cookies);
  res.redirect(`/urls/`);
});

// Logout view endpoint
app.post("/logout", (req, res) => {
  // const cookies = req.body.username;

  // res.clearCookie('username');
  res.clearCookie('user_id');

  // console.log('Cookies: ', cookies);
  res.redirect(`/urls/`);
});

// Register endpoint
app.get('/register', (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID];
  const templateVars = {
    // username: req.cookies["username"],
    user

    // ... any other vars
  };
  res.render('user_reg', templateVars);
});

// POST / register endpoint
app.post('/register', (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("E-mail and password cannot be blank");
  }

  const user = findUserByEmail(email);

  if(user) {
    return res.status(400).send("User with such e-mail already exists")
  }

  users[userID] = {
    id: userID,
    email: email,
    password: password
  }
  res.cookie('user_id', userID);
  console.log(users[userID]);
  res.redirect('/urls');
});

// Login view endpoint
app.get('/login', (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID];
  const templateVars = {
    // username: req.cookies["username"],
    user

    // ... any other vars
  };
  res.render('user_login', templateVars);
});


// Helper functions
// Random string generator
function generateRandomString() {
  let randomString =  Math.random().toString(36).replace(/\W+/, '').substr(0, 6);
  return randomString;
};

function findUserByEmail(email) {
  for(let userID in users) {
    let user = users[userID];
    if(user.email === email) {
      return user;
    }
  }
  return null;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});