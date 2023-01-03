'use strict';
import { Map } from "../models/index";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
          'Maps', 
          'BaseMap', 
          {
            type: Sequelize.JSON,
            defaultValue:'{}'
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
