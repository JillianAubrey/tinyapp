const express = require('express');
const app = express();
const PORT = 8080; // default port is 8080
const cookieSession = require('cookie-session');
const { response } = require('express');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

app.use(methodOverride('_method'));
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

///URL Database///////////

class URL {
  constructor(longURL, userId) {
    this.id = generateRandomString(6);
    this.longURL = longURL;
    this.userId = userId;
    this.timesVisited = 0;
    this.uniqueVisitors = 0;
    this.visits = [];
  }
  addVisit(visitorId) {
    this.timesVisited++;
    if (this._firstTimeVisitor(visitorId)) {
      this.uniqueVisitors++;
    }
    this.visits.push({
      visitorId,
      timeStamp: new Date(),
    });
  }
  _firstTimeVisitor(visitorId) {
    for (const visit of this.visits) {
      if (visitorId === visit.visitorId) {
        return false;
      }
    }
    return true;
  }
}

const urlDatabase = {
  addURL: function(longURL, userId) {
    const newURL = new URL(longURL, userId);
    this[newURL.id] = newURL;
    return newURL;
  }
};

//Populating urlDatabase with testing URLs
urlDatabase.addURL('http://www.lighthouselabs.ca', 'xjJM8f');
urlDatabase.addURL('http://www.google.com', 'sNgHlb');
urlDatabase.addURL('https://www.tsn.ca', 'xjJM8f');

///Users database//////////
const users = {
  'xjJM8f': {
    id: 'xjJM8f',
    email: 'user1@exampledomain.com',
    passwordHash: bcrypt.hashSync('test-password-1', 10),
  },
  'sNgHlb': {
    id: 'sNgHlb',
    email: 'user2@exampledomain.com',
    passwordHash: bcrypt.hashSync('test-password-2', 10),
  },
  'cwgK9w': {
    id: 'cwgK9w',
    email: 'admin@tinyapp.com',
    passwordHash: bcrypt.hashSync('admin-password', 10),
    admin: true,
  }
};

//HTTP routes /////////////////////
//GET
//admin only
app.get('/admin', (req, res) => {
  const user = users[req.session.user_id];
  if (!user || !user.admin) {
    return res.status(401).render('401');
  }
  const templateVars = {
    user,
  };
  res.render('admin_index', templateVars);
});

app.get('/admin/urls', (req, res) => {
  const user = users[req.session.user_id];
  if (!user || !user.admin) {
    return res.status(401).render('401');
  }
  const {addURL, ...urls} = urlDatabase;
  const templateVars = {
    user,
    urls,
  };
  res.render('urls_index', templateVars);
});

app.get('/admin/users', (req, res) => {
  const user = users[req.session.user_id];
  if (!user || !user.admin) {
    return res.status(401).render('401');
  }
  const templateVars = {
    user,
    users,
  };
  res.render('users_index', templateVars);
});

//any user
app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).end('Must be logged in to view urls.');
  }
  const urls = urlsForUser(user, urlDatabase);
  res.json(urls);
});

app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user,
    urls: urlsForUser(user, urlDatabase),
  };
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
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).render('404');
  }
  const user = users[req.session.user_id];
  if (!user || url.userId !== user.id && !user.admin) {
    return res.status(401).render('401');
  }
  const visitorId = req.session.visitor_id;
  const templateVars = {
    url,
    user,
    visitorId,
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).render('404');
  }
  let visitor_id = req.session.visitor_id;
  if (!visitor_id) {
    visitor_id = generateRandomString(6);
    req.session.visitor_id = visitor_id;
  }
  const { longURL } = url;
  url.addVisit(visitor_id);
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect('/');
  }
  const templateVars = {
    user: '',
    errorMessage: '',
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect('/');
  }
  const templateVars = {
    user: '',
    errorMessage: '',
  };
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
  const url = urlDatabase.addURL(req.body.longURL, user.id);
  res.redirect(`/urls/${url.id}`);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const templateVars = {
      user: '',
      errorMessage: 'Please provide an email and password',
    };
    return res.status(400).render('login', templateVars);
  }
  const user = getUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    const templateVars = {
      user: '',
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
      user: '',
      errorMessage: 'Please provide an email and password',
    };
    return res.status(400).render('register', templateVars);
  }
  if (getUserByEmail(email, users)) {
    const templateVars = {
      user: '',
      errorMessage: 'There is already an account with that email address',
    };
    return res.status(400).render('register', templateVars);
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const id = generateRandomString(6);
  users[id] =  { id, email, passwordHash };
  req.session.user_id = id;
  res.redirect('/urls');
});

//PUT
//admin-only
app.put('/users/:id/promote', (req, res) => {
  const { id } = req.params;
  const user = users[req.session.user_id];
  if (!user || !user.admin) {
    res.status(401).end('Access denied.\n');
  }
  users[id].admin = true;
  res.redirect('/admin/users');
});

//all users
app.put('/urls/:id', (req, res) => {
  const { id } = req.params;
  const url = urlDatabase[id];
  const user = users[req.session.user_id];
  if (!url) {
    res.status(404).end('That url id does not exist.\n');
  }
  if (!user) {
    res.status(401).end('Cannot edit urls without being logged in.\n');
  }
  if (url.userId !== user.id && !user.admin) {
    res.status(401).end('Cannot edit urls created by other accounts.\n');
  }
  urlDatabase[id].longURL = req.body.newURL;
  res.redirect(`/urls/${id}`);
});

//DELETE
//admin-only
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = users[req.session.user_id];
  if (!user || !user.admin) {
    res.status(401).end('Access denied.\n');
  }
  //deleting all urls associated with user
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === id) {
      delete urlDatabase[urlId];
    }
  }
  //deleting user
  delete users[id];
  res.redirect('/admin/users');
});
//all users
app.delete('/urls/:id', (req, res) => {
  const { id } = req.params;
  const url = urlDatabase[id];
  const user = users[req.session.user_id];
  if (!url) {
    res.status(404).end('That url id does not exist.\n');
  }
  if (!user) {
    res.status(401).end('Cannot edit urls without being logged in.\n');
  }
  if (url.userId !== user.id && !user.admin) {
    res.status(401).end('Cannot edit urls created by other accounts.\n');
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

//Server Listen
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});