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
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

// Display all links pairs
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

// Show certain pair details
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
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

// Login feature
app.post("/login", (req, res) => {
  console.log('Login req body: ', req.body);  // Log the POST request body to the console
  const cookies = req.body.username;

  res.cookie('username', `${cookies}`);
  console.log('Cookies: ', cookies);
  res.redirect(`/urls/`);
});

// Logout endpoint
app.post("/logout", (req, res) => {
  // const cookies = req.body.username;

  res.clearCookie('username');
  // console.log('Cookies: ', cookies);
  res.redirect(`/urls/`);
});

// Register endpoint
app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render('user_reg', templateVars);
});

// POST / register endpoint
app.post('/register', (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[userID] = {
    id: userID,
    email: email,
    password: password
  }
  res.cookie('user_id', userID);
  console.log(users[userID]);
  res.redirect('/urls');
});

// Random string generator
function generateRandomString() {
  let randomString =  Math.random().toString(36).replace(/\W+/, '').substr(0, 6);
  return randomString;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




// const templateVars = {
//   username: req.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);
