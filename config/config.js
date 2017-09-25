var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'xublog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/myblog'
  },

  test: {
    root: rootPath,
    app: {
      name: 'xublog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/xublog-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'xublog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/xublog-production'
  }
};

module.exports = config[env];
