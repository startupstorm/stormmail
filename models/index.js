"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
var config    = require('../app_config').config;
var sequelize = new Sequelize(config.pgDB);
var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    var num_points = (file.split(".").length - 1);
    var file_ext = file.split('.').slice(-1)[0];
    return (num_points === 1) && (file !== "index.js") && (file_ext === "js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;