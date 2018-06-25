/* @flow */

import uid2 from 'uid2'
import {sequelize, models, Sequelize} from './index'
import {TestData, SequelizeModel} from './def'

export default (sequelize: Object, DataTypes: Object): Object => {
  return new UserSequelizeModel(sequelize, DataTypes).define()
}

export const UserSequelizeModel: UserSequelizeModel = class UserSequelizeModel extends SequelizeModel {
  constructor(sequelize: Object) {
    super(sequelize,
      User.tableName, {
        email: {type: Sequelize.STRING, allowNull: false, unique: true},
        access_token: {type: Sequelize.STRING, allowNull: true, unique: true},
        password_token: {type: Sequelize.STRING, allowNull: true, unique: true},
        password_token_created: {type: Sequelize.DATE, allowNull: true, unique: false}
      }, null, (model: Object) => {
      })
  }
}

export const User: User = class User {
  instance: Object

  id: number
  email: string
  access_token: ?string
  password_token: string
  password_token_created: Date
  created_at: Date
  updated_at: Date

  static tableName: string = "User"

  constructor(instance: {id?: number, email: string, access_token: ?string, password_token: string, password_token_created: Date, created_at?: Date, updated_at?: Date}) {
    this.instance = instance
    this.id = instance.id || 1
    this.email = instance.email.toLowerCase()
    this.access_token = instance.access_token
    this.password_token = instance.password_token
    this.password_token_created = instance.password_token_created
    this.created_at = instance.created_at || new Date()
    this.updated_at = instance.updated_at || new Date()
  }

  static _model(): Object {
    return models.User
  }

  static findUserOrCreateByEmail(emailAddress: string): Promise<User> {
    return User._model().findCreateFind({
      where: {
        email: emailAddress.toLowerCase()
      },
      defaults: { // Used to create
        email: emailAddress.toLowerCase(),
        password_token: uid2(255),
        password_token_created: new Date()
      }
    }).then((result: Array<any>): Promise<User> => {
      const instance: Object = result[0].dataValues
      return Promise.resolve(new User(instance))
    })
  }

  static findUserById(userId: number): Promise<?User> {
    return User._model().findOne({
      where: {
        id: userId
      }
    }).then((instance: Object): Promise<?User> => {
      return Promise.resolve((instance) ? new User(instance) : null)
    })
  }

  static findUserByAccessToken(accessToken: string): Promise<?User> {
    return User._model().findOne({
      where: {
        access_token: accessToken
      }
    }).then((instance: Object): Promise<?User> => {
      return Promise.resolve((instance) ? new User(instance) : null)
    })
  }

  static findByPasswordlessToken(token: string): Promise<?User> {
    return User._model().findOne({
      where: {
        password_token: token
      }
    }).then((instance: Object): Promise<?User> => {
      return Promise.resolve((instance) ? new User(instance) : null)
    })
  }

  static create(email: string): Promise<User> {
    return User._model().create({
      email: email.toLowerCase(),
      password_token: uid2(255),
      password_token_created: new Date()
    }).then((instance: Object): Promise<User> => {
      return Promise.resolve(new User(instance))
    })
  }

  static findByEmail(emailAddress: string): Promise<?User> {
    return User._model().findOne({
      where: {
        email: emailAddress.toLowerCase()
      }
    }).then((instance: Object): Promise<?User> => {
      return Promise.resolve((instance) ? new User(instance) : null)
    })
  }

  static completeSignupState(passwordTokenCreated: Date = new Date()): User {
    return new User({
      email: `${uid2(20)}@${uid2(10)}.com`,
      access_token: uid2(255),
      password_token: uid2(255),
      password_token_created: passwordTokenCreated
    })
  }

  static newUserState(passwordTokenCreated: Date = new Date()): User {
    return new User({
      email: `${uid2(20)}@${uid2(10)}.com`,
      access_token: null,
      password_token: uid2(255),
      password_token_created: passwordTokenCreated
    })
  }

  testData(): TestData<User> {
    return new TestData(
      User._model(),
      [],
      this
    )
  }

  generateNewPasswordToken(): Promise<User> {
    return this.instance.update({
      password_token: uid2(255),
      password_token_created: new Date()
    }).then((instance: Object): Promise<User> => {
      return Promise.resolve(new User(instance))
    })
  }

  generateAccessToken(): Promise<User> {
    return this.instance.update({
      access_token: uid2(255)
    }).then((instance: Object): Promise<User> => {
      return Promise.resolve(new User(instance))
    })
  }

  getSafePublicData(): Object {
    return {
      id: this.id
    }
  }

  getPrivateData(): Object {
    return {
      id: this.id,
      email: this.email,
      access_token: this.access_token,
      password_token: this.password_token,
      password_token_created: this.password_token_created,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }

}
