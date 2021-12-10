// Find user in database by email
const  findUserByEmail = function(email, database) {
  for (let userID in database) {
    let user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Random string generator
const generateRandomString = function() {
  let randomString =  Math.random().toString(36).replace(/\W+/, '').substr(0, 6);
  return randomString;
};

// Checks if such short URL exists
const findShortUrlInUrlDatabase = function(shortURL, database) {
  let urlDatabaseKeys = Object.keys(database);
  for (let urlToCheck of urlDatabaseKeys) {
    if (urlToCheck === shortURL) {
      return true;
    }
  }
  return false;
};

// URLs for display selector
const urlsForUser = function(id, database) {
  let urlsToDisplay = {};
  let urlDatabaseKeys = Object.keys(database);
  for (let url of urlDatabaseKeys) {
    
    if (database[url].userID === id) {
      urlsToDisplay[url] = {
        longURL: database[url].longURL,
        userID: database[url].userID
      };
    }
  }
  return urlsToDisplay;
};

module.exports = { findUserByEmail, generateRandomString, findShortUrlInUrlDatabase, urlsForUser };