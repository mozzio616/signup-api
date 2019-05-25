'use strict'

const router = require('express').Router();
const fs = require('fs');
const rp = require('request-promise');

// Load Custome Module
const random = require(__dirname + '/../modules/random.js');
const tokencache = require(__dirname + '/../modules/tokencache.js');

// Sendgrid Config
const sg_url = 'https://api.sendgrid.com/v3/mail/send';
const sg_apikey = process.env.SG_API_KEY;

// Slack Config
const webhook_url = process.env.WEBHOOK_URL;

// One-Time Token Setting
const char = '0123456789';
const digit = 6;
const retry_limit = 5;

// Verify Token API
router.get("/:email", (req, res) => {

  const email = req.params.email;
  const token = req.query.token;
  const cache_path = '/tmp/' + email + '.json';

  // Initialize
  let msg = '';

  // Common Header
  res.set('Content-Type', 'application/json');

  // Parameter Validation
  if (email === undefined || token === undefined) {

    res.status(400);
    msg = 'Missing Required Parameter(s)';

  } else {


    // Check Cache Existence
    try {

      fs.statSync(cache_path);
      const cachedata = JSON.parse(fs.readFileSync(cache_path, 'utf8'));

      // Verify Token
      if (token === cachedata[0]) {

        // Delete Cache File
        try {

          fs.unlinkSync(cache_path);
          res.status(200);
          msg = 'Verified';

        } catch (err) {

          res.status(500);
          msg = 'Cache Clear Error';

        }

      // Invalid Token
      } else {

        let retry = cachedata[1];

        // Check Retry Times
        if (retry < retry_limit - 1) {

          retry++;
          const cache = tokencache(email, cachedata[0], retry);

          if (cache) {

            res.status(400);
            msg = 'Invalid Token';

          } else {

            res.status(500);
            msg = 'Cache Overwrite Error';

          }

        // Retry Limit Over
        } else {

          try {

            fs.unlinkSync(cache_path);
            res.status(400);
            msg = 'Retry Limit Over';

          } catch (err) {

            res.status(500);
            msg = 'Cache Clear Error';

          }

        }

      }

    // No Cache Exist
    } catch (error) {

      if (error.code === 'ENOENT') {

        res.status(404);
        msg = 'Unknown Email';

      } else {

        res.status(500);
        const msg = 'Read Cache Error';

      }

    }

  }

  res.send(JSON.stringify({message: msg}, null, 4));

});


// Get Token API
router.post('/:email', (req, res) => {

  const email = req.params.email;
  const channel = req.body.channel;

  // Initialize
  let options = { method: 'POST' };
  let msg = '';

  // Common Header
  res.set('Content-Type', 'application/json');

  // Check Media
  if (email === undefined) {

    res.status(400);
    msg = 'Missing Email Address';
    res.send(JSON.stringify({message: msg}, null, 4));

  } else {

    // Generate One-Time Token
    random(char, digit)

      .then(function(token) {

        // Token Cache
        const cache = tokencache(email, token, 0);
        if (cache) {

          // Notification
          const notice = token;

          if (channel === undefined) {

            let content = require(__dirname + '/../templates/email.json');
            content.personalizations[0].to[0].email = email;
            content.content[0].value = notice;
            options.json = content;
            options.url = sg_url;
            options.headers = { Authorization: 'Bearer ' + sg_apikey };

          } else  {

            options.json = { channel: channel, text: notice, link_names: 1 };
            options.url = webhook_url;

          }

          rp(options)

            .then(function(body) {

              res.status(201);
              msg = 'Token sent to your email or slack';
              res.send(JSON.stringify({message: msg}, null, 4));

            })
            .catch(function(err) {

              console.log(err.message);
              res.status(500);
              msg = 'Notification Error';
              res.send(JSON.stringify({message: msg}, null, 4));

            })

        } else {

          res.status(500);
          msg = 'Token Cache Error';
          res.send(JSON.stringify({message: msg}, null, 4));

        }

      })

      .catch(function(err) {

        res.status(500);
        msg = 'Token Generate Error';
        res.send(JSON.stringify({message: msg}, null, 4));
 
      })

  }

});

module.exports = router;
