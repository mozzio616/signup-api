'use strict'

const fs = require('fs');

const tokencache = function(email, otcode, retry) {

  const output = [ otcode, retry ];

  try {
    fs.writeFileSync('/tmp/' + email + '.json', JSON.stringify(output));
    return true;
  } catch(err) {
    console.log(err);
    return false;
  }

}

module.exports = tokencache;
