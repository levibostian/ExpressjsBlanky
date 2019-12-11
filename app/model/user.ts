import uid2 from "uid2"
import { Sequelize, DataTypes } from "sequelize"
import { Model, SequelizeModel } from "./type"

export class UserSequelizeModel extends SequelizeModel {
  public id!: number
  public email!: string
  public accessToken?: string
  public passwordToken?: string
  public passwordTokenCreated?: Date
  public createdAt!: Date
  public updatedAt!: Date

  static initModel(sequelize: Sequelize): void {
    UserSequelizeModel.init(
      {
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        accessToken: { type: DataTypes.STRING, allowNull: true, unique: true },
        passwordToken: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true
        },
        passwordTokenCreated: {
          type: DataTypes.DATE,
          allowNull: true,
          unique: false
        }
      },
      {
        modelName: "User",
        sequelize: sequelize
      }
    )
  }

  static setupAssociations(): void {}

  getUser(): UserModel {
    return new UserModel(
      this.id,
      this.email,
      this.createdAt,
      this.updatedAt,
      this.accessToken,
      this.passwordToken,
      this.passwordTokenCreated
    )
  }
}

export interface UserPublic {
  id: number
}

export interface UserPrivate {
  id: number
  email: string
  accessToken?: string
  passwordToken?: string
}

export class UserModel implements Model<UserPublic> {
  constructor(
    public id: number,
    public email: string,
    public createdAt: Date,
    public updatedAt: Date,
    public accessToken?: string,
    public passwordToken?: string,
    public passwordTokenCreated?: Date
  ) {}

  static findUserOrCreateByEmail(emailAddress: string): Promise<[UserModel, boolean]> {
    return UserSequelizeModel.findCreateFind({
      where: {
        email: emailAddress.toLowerCase()
      },
      defaults: {
        passwordToken: uid2(255),
        passwordTokenCreated: new Date()
      }
    }).then(res => [res[0].getUser(), res[1]])
  }

  static findUserById(userId: number): Promise<UserModel | null> {
    return UserSequelizeModel.findOne({
      where: {
        id: userId
      }
    }).then(res => (res ? res.getUser() : null))
  }

  static findUserByAccessToken(accessToken: string): Promise<UserModel | null> {
    return UserSequelizeModel.findOne({
      where: {
        accessToken: accessToken
      }
    }).then(res => (res ? res.getUser() : null))
  }

  static findByPasswordlessToken(token: string): Promise<UserModel | null> {
    return UserSequelizeModel.findOne({
      where: {
        passwordToken: token
      }
    }).then(res => (res ? res.getUser() : null))
  }

  static create(email: string): Promise<UserModel> {
    return UserSequelizeModel.create({
      email: email.toLowerCase(),
      passwordToken: uid2(255),
      passwordTokenCreated: new Date()
    }).then(res => res.getUser())
  }

  static findByEmail(emailAddress: string): Promise<UserModel | null> {
    return UserSequelizeModel.findOne({
      where: {
        email: emailAddress.toLowerCase()
      }
    }).then(res => (res ? res.getUser() : null))
  }

  findOrCreateSelf(): Promise<UserModel> {
    return UserSequelizeModel.findCreateFind({
      where: {
        email: this.email.toLowerCase()
      },
      defaults: {
        accessToken: this.accessToken,
        passwordToken: this.passwordToken,
        passwordTokenCreated: this.passwordTokenCreated,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }).then(res => res[0].getUser())
  }

  private update(update: Object): Promise<UserModel> {
    return UserSequelizeModel.update(update, {
      where: {
        id: this.id
      },
      returning: true
    }).then(res => res[1][0].getUser())
  }

  async delete(): Promise<void> {
    await UserSequelizeModel.destroy({
      where: {
        id: this.id
      }
    }).then()
  }

  newPasswordToken(): Promise<UserModel> {
    return this.update({
      passwordToken: uid2(255),
      passwordTokenCreated: new Date()
    })
  }

  newAccessToken(): Promise<UserModel> {
    return this.update({
      accessToken: uid2(255)
    })
  }

  publicRepresentation(): UserPublic {
    return {
      id: this.id
    }
  }

  privateRepresentation(): UserPrivate {
    return {
      id: this.id,
      email: this.email,
      accessToken: this.accessToken,
      passwordToken: this.passwordToken
    }
  }
}
