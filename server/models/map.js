"use strict";
module.exports = (sequelize, DataTypes) => {
  var Map = sequelize.define("Map", {
    name: DataTypes.STRING,
    map: DataTypes.JSON,
    BaseMap: DataTypes.JSON,
    validationRequested: DataTypes.BOOLEAN,
    sanity: DataTypes.BOOLEAN,
    isGsb: DataTypes.BOOLEAN
  }, {});
  Map.associate = function(models) {
    // associations can be defined here
  };
  return Map;
};