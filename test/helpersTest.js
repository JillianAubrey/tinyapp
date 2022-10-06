const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
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
};

const testURLs = {
  'urlRandomID': {
    id: 'urlRandomID',
    longURL: 'http://www.google.com',
    userId: "userRandomID",
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
  'url2RandomID': {
    id: 'url2RandomID',
    longURL: 'http://www.google.com',
    userId: "user2RandomID",
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
  'url3RandomID': {
    id: 'url3RandomID',
    longURL: 'http://www.example.edu',
    userId: "userRandomID",
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
}

describe('getUserByEmail', function() {

});
describe('urlsForUser', function() {

});