'use strict'

const random = function(char, digit) {

  return new Promise(function(resolve) {
    const cl = char.length;
    let r = "";
    for(let i=0; i<digit; i++) {
      r += char[Math.floor(Math.random()*cl)];
    }
    resolve(r);
  })
}

module.exports = random;
