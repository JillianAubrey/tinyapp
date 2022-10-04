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
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//POST
app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

//Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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