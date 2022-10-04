const express = require("express");
const app = express();
const PORT = 8080; // default port is 8080

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//GET
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (!longURL) {
    return res.status(404).render('404');
  }
  const templateVars = { id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.status(404).render('404');
  }
  res.redirect(longURL);
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
  const id = req.params.id;
  delete urlDatabase[id];
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