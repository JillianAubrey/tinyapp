const { generateRandomString } = require('./helpers');

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

module.exports = urlDatabase;