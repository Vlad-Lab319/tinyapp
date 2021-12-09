const  findUserByEmail = function(email, database) {
  for(let userID in database) {
    let user = database[userID];
    if(user.email === email) {
      return user;
    }
  }
  return null;
};

module.exports = { findUserByEmail };