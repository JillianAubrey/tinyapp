const express = require("express");
const app = express();
const PORT = 8080; // default port is 8080
const cookieParser = require('cookie-parser')

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  xjJM8f: {
    id: 'xjJM8f',
    email: 'user1@exampledomain.com',
    password: 'test-password-1',
  },
  sNgHlb: {
    id: 'sNgHlb',
    email: 'user2@exampledomain.com',
    password: 'test-password-2',
  }
}

//GET
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    id, 
    longURL,
    user: users[req.cookies["user_id"]],
  };
  if (!longURL) {
    return res.status(404).render('404');
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.status(404).render('404');
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    errorMessage: '',
  };
  if (templateVars.user) {
    return res.redirect('/');
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    errorMessage: '',
  };
  if (templateVars.user) {
    return res.redirect('/');
  }
  res.render("login", templateVars);
});

app.get('/:invalidPath', (req, res) => {
  return res.status(404).render('404');
});

//POST
app.post("/urls", (req, res) => {
  const id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
  const { id } = req.params;
  urlDatabase[id] = req.body.newURL;
  res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const templateVars = {
      user: null,
      errorMessage: 'Please provide an email and password',
    }
    return res.status(400).render('login', templateVars);
  }
  const user = getUserByEmail(email);
  if(!user || user.password !== password) {
    const templateVars = {
      user: null,
      errorMessage: 'That email and password combination did not match any accounts',
    }
    return res.status(400).render('login', templateVars);
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const templateVars = {
      user: null,
      errorMessage: 'Please provide an email and password',
    }
    return res.status(400).render('register', templateVars);
  }
  if (getUserByEmail(email)) {
    const templateVars = {
      user: null,
      errorMessage: 'There is already an account with that email address',
    }
    return res.status(400).render('register', templateVars);
  }
  const id = generateRandomString(6);
  users[id] =  { id, email, password };
  res.cookie('user_id', id);
  res.redirect('/urls');
});


//Listen
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

//Functions
const generateRandomString = function(len) {
  let charCodes = [];
  do {
    //48 is charCode for 0 and 122 is z
    const randNum = randomBetween(48, 122);
    //ignores codes in the gaps between alphanumeric characters
    if ((randNum > 57 && randNum < 65) || (randNum > 90 && randNum < 97)) {
      continue;
    }
    charCodes.push(randNum);
  } while (charCodes.length < len);

  return String.fromCharCode(...charCodes);
};

const randomBetween = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getUserByEmail = function (email) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
}