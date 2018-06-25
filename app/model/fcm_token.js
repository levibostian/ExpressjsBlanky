/* @flow */

import uid2 from 'uid2'
import {sequelize, models, Sequelize} from './index'
import {TestData, SequelizeModel} from './def'
import {User} from './user'

export default (sequelize: Object, DataTypes: Object): Object => {
  return new FcmTokenSequelizeModel(sequelize, DataTypes).define()
}

export const FcmTokenSequelizeModel: FcmTokenSequelizeModel = class FcmTokenSequelizeModel extends SequelizeModel {
  constructor(sequelize: Object) {
    super(sequelize,
      FcmToken.tableName, {
        token: {type: Sequelize.STRING, allowNull: false, unique: true}
      }, null, (model: Object) => {
        model.belongsTo(models.User) // creates user_id foreign key in model.
      })
  }
}

export const FcmToken: FcmToken = class FcmToken {
  instance: Object

  id: number
  token: string
  user_id: number

  static tableName: string = "FcmToken"

  constructor(instance: {id?: number, token: string, user_id: number}) {
    this.instance = instance
    this.id = instance.id || 1
    this.token = instance.token
    this.user_id = instance.user_id
  }

  static _model(): Object {
    return models.FcmToken
  }

  static findByUserId(userId: number): Promise<Array<FcmToken>> {
    return FcmToken._model().findAll({
      where: {
        user_id: userId
      }
    }).then((instances: Array<Object>): Promise<Array<FcmToken>> => {
      return Promise.resolve(instances.map((instance: Object): FcmToken => {
        return new FcmToken(instance)
      }))
    })
  }

  static testToken(userId: number = 1): FcmToken {
    return new FcmToken({
      token: uid2(255),
      user_id: userId
    })
  }

  static create(userId: number, token: string): Promise<FcmToken> {
    return FcmToken._model().create({
      user_id: userId,
      token: token
    }).then((instance: Object): Promise<FcmToken> => {
      return Promise.resolve(new FcmToken(instance))
    })
  }

  testData(user: ?TestData<User>): TestData<FcmToken> {
    return new TestData(
      FcmToken._model(),
      (user) ? [user] : [],
      this
    )
  }

  destroy(): Promise<void> {
    return this.instance.destroy()
  }

}
