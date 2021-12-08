const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// Add new link 
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURLGenerated = generateRandomString();
  console.log(shortURLGenerated);
  urlDatabase[shortURLGenerated] = req.body.longURL;
  res.redirect(`/urls/${shortURLGenerated}`);
});

// Update link
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  // const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  console.log(urlDatabase);

  res.redirect('/urls');
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

function generateRandomString() {
  let randomString =  Math.random().toString(36).replace(/\W+/, '').substr(0, 6);
  return randomString;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
