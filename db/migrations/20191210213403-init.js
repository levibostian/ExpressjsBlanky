"use strict"

module.exports = {
  up: (queryInterface, Sequelize) => {
    const createUserTable = queryInterface.createTable("User", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      accessToken: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      passwordToken: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      passwordTokenCreated: {
        type: Sequelize.DATE,
        allowNull: true,
        unique: false
      }
    })

    const createFcmTokenTable = queryInterface.createTable("FcmToken", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      }
    })

    return createUserTable.then(createFcmTokenTable)
  },
  down: (queryInterface, Sequelize) => {
    const queries = []

    queries.push(queryInterface.dropTable("User"))
    queries.push(queryInterface.dropTable("FcmToken"))

    return Promise.all(queries)
  }
}
