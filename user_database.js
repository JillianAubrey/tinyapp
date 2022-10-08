const bcrypt = require('bcryptjs');

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

module.exports = users;

