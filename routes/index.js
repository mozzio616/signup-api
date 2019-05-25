const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(200);
  res.end();
});

module.exports = router;
