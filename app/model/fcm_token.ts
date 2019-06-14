import uid2 from "uid2"
import { Sequelize, DataTypes, BelongsTo } from "sequelize"
import { Model, SequelizeModel } from "./type"
import { UserSequelizeModel } from "./user"

export class FcmTokenSequelizeModel extends SequelizeModel {
  public id!: number
  public token!: string
  public user_id!: number

  static initModel(sequelize: Sequelize) {
    FcmTokenSequelizeModel.init(
      {
        token: { type: DataTypes.STRING, allowNull: false, unique: true },
      },
      {
        modelName: "fcm_token",
        sequelize: sequelize,
      }
    )
  }

  static setupAssociations() {
    FcmTokenSequelizeModel.belongsTo(UserSequelizeModel, {
      as: "user",
      foreignKey: "user_id",
      onDelete: "CASCADE", // delete fcm token if user ever deleted.
    })
  }

  getModel(): FcmTokenModel {
    return new FcmTokenModel(this.id, this.token, this.user_id)
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
        user_id: userId,
      },
      order: [["id", "ASC"]],
    }).then(results =>
      results.map(fcmSequelizeModel => fcmSequelizeModel.getModel())
    )
  }

  static create(userId: number, token: string): Promise<FcmTokenModel> {
    return FcmTokenSequelizeModel.create(
      {
        token: token,
        user_id: userId,
      },
      {
        include: [
          {
            model: UserSequelizeModel,
            as: "user",
          },
        ],
      }
    ).then(res => res.getModel())
  }

  findOrCreateSelf(): Promise<FcmTokenModel> {
    return FcmTokenSequelizeModel.findCreateFind({
      where: {
        token: this.token,
        user_id: this.userId,
      },
    }).then(res => res[0].getModel())
  }

  async delete() {
    await FcmTokenSequelizeModel.destroy({
      where: {
        id: this.id,
      },
    }).then()
  }

  publicRepresentation(): FcmTokenPublic {
    return {
      id: this.id,
      token: this.token,
    }
  }
}
