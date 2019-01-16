'use strict';

const user = require('./users-model.js');


module.exports = (req, res, next) => {

  try {

    let [authType, authString] = req.headers.authorization.split(/\s+/);

    // BASIC Auth  ... Authorization:Basic ZnJlZDpzYW1wbGU=

    switch(authType.toLowerCase()) {
    case 'basic':
      return _authBasic(authString);
    case 'bearer':
      return _authBearer(authString);
    default:
      return _authError();
    }

  } catch(e) {
    return _authError();
  }

  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString,'base64'); // <Buffer 01 02...>
    let bufferString = base64Buffer.toString(); // john:mysecret
    let [username,password] = bufferString.split(':'); // variables username="john" and password="mysecret"
    let auth = {username,password}; // {username:"john", password:"mysecret"}

    return user.authenticateBasic(auth)
      .then( user => _authenticate(user) );
  }

  function _authenticate(user) {
    if ( user ) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }

  function _authBearer(str){
    return user.authenticateToken(str)
    .then(user=> _authenticate(user) 
    .catch(next));
  }

  function _authError() {
    next({status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/Password'});
  }



};

