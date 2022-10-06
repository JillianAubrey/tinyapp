const express = require('express');
const app = express();
const PORT = 8080; // default port is 8080
const cookieSession = require('cookie-session');
const { response } = require('express');
const bcrypt = require("bcryptjs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  keys: [
    '1nL6okiCse1QDBahrghl9wRNdyZUflcK4U2p4E6OHRrRfib2de',
    'uFq5eh8UnUv5gUgAZS3ghXxgjzxWu4CG77KUBXUBbPc6on4zVM',
    'cvcNRUVNnPdILZBPvaHpp5t8Os7Ju5b9FlkkgL3AUporbMgOSl',
    'TJY6rwxSqVEb45rlmj9kHReQQV9Spb9yQ6ciHjCFzjwLMcVL2T',
    'nhjIeKnZftLedWc9K2OARpR7sgILSBwSuyk3F2avYAqRYF68wj',
    'kxwtS5uShNwMFxEd7YEZopWkeYBBV2DURHMBFQSkIAN30W0eKq',
  ]
}));
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': {
    id: 'b2xVn2',
    longURL:'http://www.lighthouselabs.ca',
    userId: 'xjJM8f',
    timesUsed: 0,
    visits: [],
  },
  '9sm5xK': {
    id: '9sm5xK',
    longURL:'http://www.google.com',
    userId: 'xjJM8f',
    timesUsed: 0,
    visits: [],
  },
  'b6UTxQ': {
    id: 'b6UTxQ',
    longURL: "https://www.tsn.ca",
    userId: "sNgHlb",
    timesUsed: 0,
    visits: [],
  }
};

const users = {
  xjJM8f: {
    id: 'xjJM8f',
    email: 'user1@exampledomain.com',
    passwordHash: '$2a$10$zuxAdN0sN81oh624QVWJY.fZrxx/daGvmdRQ8U6mt6DIRXJfV9pRK',
    //test-password-1
  },
  sNgHlb: {
    id: 'sNgHlb',
    email: 'user2@exampledomain.com',
    passwordHash: '$2a$10$nGxgVREppXzWPbvsp89fKejXBwaWpxuQSJY/VyXPXy6vxwVBjJVnm',
    //test-password-2
  }
};

//GET
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).end('Must be logged in to view urls.');
  }
  const urls = urlsForUser(user);
  res.json(urls);
});

app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user,
    urls: urlsForUser(user),
  };
  console.log(templateVars.urls);
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = {
    user,
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  const urlObj = urlDatabase[req.params.id];
  if (!urlObj) {
    return res.status(404).render('404');
  }
  if (!user || urlObj.userId !== user.id) {
    return res.status(401).render('401');
  }
  const templateVars = {
    urlObj,
    user: users[req.session.user_id],
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  req.session.visitor_id = "some value";
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).render('404');
  }
  const { longURL } = url;
  url.timesUsed ++;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    errorMessage: '',
  };
  if (templateVars.user) {
    return res.redirect('/');
  }
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    errorMessage: '',
  };
  if (templateVars.user) {
    return res.redirect('/');
  }
  res.render('login', templateVars);
});

app.get('/:invalidPath', (req, res) => {
  return res.status(404).render('404');
});

//POST
app.post('/urls', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).end('Cannot generate shortened URL without being logged in.\n');
  }
  const id = generateRandomString(6);
  urlDatabase[id] = {
    id,
    longURL: req.body.longURL,
    userId: user.id,
    timesUsed: 0,
    visits: [],
  };
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  const url = urlDatabase[id];
  const user = users[req.session.user_id];
  if (!url) {
    res.status(404).end('That url id does not exist.\n');
  }
  if (!user) {
    res.status(401).end('Cannot edit urls without being logged in.\n');
  }
  if (url.userId !== user.id) {
    res.status(401).end('Cannot edit urls created by other accounts.\n');
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => {
  const { id } = req.params;
  const url = urlDatabase[id];
  const user = users[req.session.user_id];
  if (!url) {
    res.status(404).end('That url id does not exist.\n');
  }
  if (!user) {
    res.status(401).end('Cannot edit urls without being logged in.\n');
  }
  if (url.userId !== user.id) {
    res.status(401).end('Cannot edit urls created by other accounts.\n');
  }
  urlDatabase[id].longURL = req.body.newURL;
  res.redirect(`/urls/${id}`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const templateVars = {
      user: null,
      errorMessage: 'Please provide an email and password',
    };
    return res.status(400).render('login', templateVars);
  }
  const user = getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    const templateVars = {
      user: null,
      errorMessage: 'That email and password combination did not match any accounts',
    };
    return res.status(400).render('login', templateVars);
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const templateVars = {
      user: null,
      errorMessage: 'Please provide an email and password',
    };
    return res.status(400).render('register', templateVars);
  }
  if (getUserByEmail(email)) {
    const templateVars = {
      user: null,
      errorMessage: 'There is already an account with that email address',
    };
    return res.status(400).render('register', templateVars);
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const id = generateRandomString(6);
  users[id] =  { id, email, passwordHash };
  req.session.user_id = id;
  res.redirect('/urls');
  console.log(users);
});


//Listen
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

//Functions
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

const getUserByEmail = function(email) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

const urlsForUser = function(user) {
  const userURLs = {};
  if (!user) {
    return null;
  }
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === user.id) {
      userURLs[urlId] = urlDatabase[urlId];
    }
  }
  if (Object.keys(userURLs).length === 0) {
    return null;
  }
  return userURLs;
};