"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "users",
      [
        {
          username: "Admin",
          password: "admin",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: "Jay",
          password: "jay",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: "Ray",
          password: "password",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", null, {});
  }
};
