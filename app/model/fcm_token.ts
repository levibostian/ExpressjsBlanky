import { Sequelize, DataTypes, Transaction } from "sequelize"
import { Model, SequelizeModel } from "./type"
import { UserSequelizeModel } from "./user"
import * as Result from "../type/result"
import { Logger } from "../logger"
import { Dependency, Di } from "../di"

export class FcmTokenSequelizeModel extends SequelizeModel {
  public id!: number
  public token!: string
  public userId!: number

  static initModel(sequelize: Sequelize): void {
    FcmTokenSequelizeModel.init(
      {
        token: { type: DataTypes.STRING, allowNull: false, unique: true }
      },
      {
        modelName: "FcmToken",
        sequelize: sequelize
      }
    )
  }

  static setupAssociations(): void {
    FcmTokenSequelizeModel.belongsTo(UserSequelizeModel, {
      as: "user",
      foreignKey: "userId",
      onDelete: "CASCADE" // delete fcm token if user ever deleted.
    })
  }

  getModel(): FcmTokenModel {
    return new FcmTokenModel(this.id, this.token, this.userId)
  }
}

export interface FcmTokenPublic {
  id: number
  token: string
}

export class FcmTokenModel implements Model<FcmTokenPublic> {
  constructor(public id: number, public token: string, public userId: number) {}

  static findByUserId(userId: number): Promise<FcmTokenModel[]> {
    return FcmTokenSequelizeModel.findAll({
      where: {
        userId: userId
      },
      order: [["id", "ASC"]]
    }).then((results) => results.map((fcmSequelizeModel) => fcmSequelizeModel.getModel()))
  }

  static async newCreate(userId: number, token: string): Promise<Result.Type<FcmTokenModel>> {
    const potentialError = new Error("Potential error")

    try {
      const createdModel = await FcmTokenSequelizeModel.create(
        {
          token: token,
          userId: userId
        },
        {
          include: [
            {
              model: UserSequelizeModel,
              as: "user"
            }
          ]
        }
      )

      return createdModel.getModel()
    } catch (error) {
      const logger: Logger = Di.inject(Dependency.Logger)

      /*
      Here is where my experiment comes together. I need to look at each of the stacktraces printed to the console to see what one produces one that I am happy with. 

      You will see that `potentialError` is the best!
      */

      logger.error(error)

      const newError = new Error(`SQL error!`)
      logger.error(newError)

      logger.error(potentialError)

      return newError
    }
  }

  static create(userId: number, token: string): Promise<FcmTokenModel> {
    return FcmTokenSequelizeModel.create(
      {
        token: token,
        userId: userId
      },
      {
        include: [
          {
            model: UserSequelizeModel,
            as: "user"
          }
        ]
      }
    ).then((res) => res.getModel())
  }

  findOrCreateSelf(transaction: Transaction): Promise<FcmTokenModel> {
    return FcmTokenSequelizeModel.findCreateFind({
      where: {
        token: this.token,
        userId: this.userId
      },
      transaction: transaction
    }).then((res) => res[0].getModel())
  }

  async delete(): Promise<void> {
    await FcmTokenSequelizeModel.destroy({
      where: {
        id: this.id
      }
    }).then()
  }

  publicRepresentation(): FcmTokenPublic {
    return {
      id: this.id,
      token: this.token
    }
  }
}
