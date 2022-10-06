const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const testURLs = {
  'urlRandomID': {
    id: 'urlRandomID',
    longURL: 'http://www.google.com',
    userId: 'userRandomID',
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
  'url2RandomID': {
    id: 'url2RandomID',
    longURL: 'http://www.google.com',
    userId: 'user2RandomID',
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
  'url3RandomID': {
    id: 'url3RandomID',
    longURL: 'http://www.example.edu',
    userId: 'userRandomID',
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined for an invalid email address', function() {
    const user = getUserByEmail('invalid@example.com', testUsers);
    assert.isUndefined(user);
  });
});
describe('urlsForUser', function() {
  it('should return all matching urls for a user when provided with a valid userId', function() {
    const userURLs = urlsForUser(testUsers.userRandomID, testURLs);
    const expectedUserURLs = {
      'urlRandomID': {
        id: 'urlRandomID',
        longURL: 'http://www.google.com',
        userId: 'userRandomID',
        timesVisited: 0,
        uniqueVisitors: 0,
        visits: [],
      },
      'url3RandomID': {
        id: 'url3RandomID',
        longURL: 'http://www.example.edu',
        userId: 'userRandomID',
        timesVisited: 0,
        uniqueVisitors: 0,
        visits: [],
      },
    };
    assert.deepEqual(userURLs, expectedUserURLs);
  });
  it('should return undefined for a user with no urls', function() {
    const user = {
      id: 'user3RandomID',
      email: 'user3@example.com',
      password: 'pssword-3'
    };
    const userURLs = urlsForUser(user, testURLs);
    assert.isUndefined(userURLs);
  });
});