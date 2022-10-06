//Functions /////////
const generateRandomString = function(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randStr = '';
  for (let i = 0; i < len; i ++) {
    const randNum = randomBetween(0, chars.length - 1);
    randStr += chars[randNum];
  }
  return randStr;
};

const randomBetween = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getUserByEmail = function(email, database) {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return;
};

const urlsForUser = function(user, database) {
  const userURLs = {};
  if (!user) {
    return;
  }
  for (const urlId in database) {
    if (database[urlId].userId === user.id) {
      userURLs[urlId] = database[urlId];
    }
  }
  if (Object.keys(userURLs).length === 0) {
    return;
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };