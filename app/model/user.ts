import uid2 from "uid2"
import { Sequelize, DataTypes } from "sequelize"
import { Model, SequelizeModel } from "./type"

export class UserSequelizeModel extends SequelizeModel {
  public id!: number
  public email!: string
  public access_token?: string
  public password_token?: string
  public password_token_created?: Date
  public created_at!: Date
  public updated_at!: Date

  static initModel(sequelize: Sequelize) {
    UserSequelizeModel.init(
      {
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        access_token: { type: DataTypes.STRING, allowNull: true, unique: true },
        password_token: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        password_token_created: {
          type: DataTypes.DATE,
          allowNull: true,
          unique: false,
        },
      },
      {
        modelName: "user",
        sequelize: sequelize,
      }
    )
  }

  static setupAssociations() {}

  getUser(): UserModel {
    return new UserModel(
      this.id,
      this.email,
      this.created_at,
      this.updated_at,
      this.access_token,
      this.password_token,
      this.password_token_created
    )
  }
}

export interface UserPublic {
  id: number
}

export interface UserPrivate {
  id: number
  email: string
  access_token?: string
  password_token?: string
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

  static findUserOrCreateByEmail(emailAddress: string): Promise<UserModel> {
    return UserSequelizeModel.findCreateFind({
      where: {
        email: emailAddress.toLowerCase(),
      },
      defaults: {
        password_token: uid2(255),
        password_token_created: new Date(),
      },
    }).then(res => res[0].getUser())
  }

  static findUserById(userId: number): Promise<UserModel | null> {
    return UserSequelizeModel.findOne({
      where: {
        id: userId,
      },
    }).then(res => (res ? res.getUser() : null))
  }

  static findUserByAccessToken(accessToken: string): Promise<UserModel | null> {
    return UserSequelizeModel.findOne({
      where: {
        access_token: accessToken,
      },
    }).then(res => (res ? res.getUser() : null))
  }

  static findByPasswordlessToken(token: string): Promise<UserModel | null> {
    return UserSequelizeModel.findOne({
      where: {
        password_token: token,
      },
    }).then(res => (res ? res.getUser() : null))
  }

  static create(email: string): Promise<UserModel> {
    return UserSequelizeModel.create({
      email: email.toLowerCase(),
      password_token: uid2(255),
      password_token_created: new Date(),
    }).then(res => res.getUser())
  }

  static findByEmail(emailAddress: string): Promise<UserModel | null> {
    return UserSequelizeModel.findOne({
      where: {
        email: emailAddress.toLowerCase(),
      },
    }).then(res => (res ? res.getUser() : null))
  }

  findOrCreateSelf(): Promise<UserModel> {
    return UserSequelizeModel.findCreateFind({
      where: {
        email: this.email.toLowerCase(),
      },
      defaults: {
        access_token: this.accessToken,
        password_token: this.passwordToken,
        password_token_created: this.passwordTokenCreated,
        created_at: this.createdAt,
        updated_at: this.updatedAt,
      },
    }).then(res => res[0].getUser())
  }

  private update(update: Object): Promise<UserModel> {
    return UserSequelizeModel.update(update, {
      where: {
        id: this.id,
      },
      returning: true,
    }).then(res => res[1][0].getUser())
  }

  async delete() {
    await UserSequelizeModel.destroy({
      where: {
        id: this.id,
      },
    }).then()
  }

  newPasswordToken(): Promise<UserModel> {
    return this.update({
      password_token: uid2(255),
      password_token_created: new Date(),
    })
  }

  newAccessToken(): Promise<UserModel> {
    return this.update({
      access_token: uid2(255),
    })
  }

  publicRepresentation(): UserPublic {
    return {
      id: this.id,
    }
  }

  privateRepresentation(): UserPrivate {
    return {
      id: this.id,
      email: this.email,
      access_token: this.accessToken,
      password_token: this.passwordToken,
    }
  }
}
