var fs = require("fs");
var path = require("path");
var basename = path.basename(__filename);
var router = [];

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    router.push(require(path.join(__dirname, file)))
  });

module.exports = router;