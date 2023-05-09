'use strict';
import { Map } from "../models/index";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
          'Maps', 
          'isGsb', 
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
      )
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
