// @flow

// These are classes used by individual models. I moved them into here because of circular dependencies.

// Used for tests to create test data in the database for tests.
export class TestData<Model> {
  model: Object
  dependencies: ?Array<TestData<any>>
  testData: Model
  constructor(model: Object, dependencies: ?Array<TestData<any>>, testData: Model) {
    this.model = model
    this.dependencies = dependencies
    this.testData = testData
  }
}

// Used for tables to define the schema for Sequelize to define the table and create it.
export class SequelizeModel {
  sequelize: Object
  tableName: string
  definition: Object
  options: ?Object
  associate: (model: Object) => void

  constructor(sequelize: Object, tableName: string, definition: Object, options: ?Object, associate: (model: Object) => void) {
    this.sequelize = sequelize
    this.tableName = tableName
    this.definition = definition
    this.options = options
    this.associate = associate
  }

  define(): Object {
    const model: Object = this.sequelize.define(this.tableName, this.definition, this.options)
    model.associate = this.associate
    return model
  }
}
