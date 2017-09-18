/* @flow */

var uid2 = require('uid2')
var Promise = require('sequelize').Promise
var bcrypt = require('bcryptjs')

module.exports = (sequelize: Object, DataTypes: Object): Object => {
    const User: User = sequelize.define("User", {
        email: {type: DataTypes.STRING, allowNull: false, unique: true},
        first_name: {type: DataTypes.STRING, allowNull: false},
        password_hash: {type: DataTypes.STRING},
        salt: {type: DataTypes.STRING},
        temp_password_token: {type: DataTypes.STRING, unique: true}, // use as bearer auth when setting password
        access_token: {type: DataTypes.STRING, unique: true} // ONLY set and give back to user when they have FULLY created account!
    }, {
        defaultScope: {
            where: {
                deleted_at: null
            }
        }
    })

    // Sequelize specific function to create foreign keys.
    User.associate = (models): void => {
        User.belongsTo(models.SupportGroup) // creates support_group_id foreign key in User.
    }

    // Below are all class functions. Call via: `User.findUserByEmail('levi@levibostian.com').then(...)`
    User.findUserByEmail = (emailAddress: string): Promise<?User> => {
        return User.findOne({
            where: {
                email: emailAddress.toLowerCase()
            }
        })
    }
    User.findUserById = (userId: number): Promise<?User> => {
        return User.findOne({
            where: {
                id: userId
            }
        })
    }
    User.getPasswordHash = (password: string, salt: string): string => {
        return bcrypt.hashSync(password, salt)
    }
    User.findUserByTempAccessCodeToken = (tempAccessCodeToken: string): Promise<?User> => {
        return User.findOne({
            where: {
                temp_access_code_token: tempAccessCodeToken
            }
        })
    }
    User.findUserByAccessToken = (accessToken: string): Promise<?User> => {
        return User.findOne({
            where: {
                access_token: accessToken
            }
        })
    }
    User.createUser = (email: string, firstName: string): Promise<User> => {
        return User.create({
            email: email.toLowerCase(),
            first_name: firstName,
            temp_access_code_token: uid2(255)
        })
    }

    // Below are all instance methods. Call via an instance of `User`: `var user: User; user.hasSetPassword()`
    // What use to send back to user when they login. Contains all info about user but password stuff.
    User.prototype.getPrivateApiResponseUser = function(): User {
      return User.findOne({
        attributes: ['id', 'email', 'first_name', 'access_token', 'temp_password_token', 'temp_access_code_token', 'temp_answer_bio_question_token', 'support_group_id', 'demo_user', 'name_app'],
        where: {
          id: this.id
        }
      })
    }
    User.prototype.markRedeemedAccessCode = function(isDemoCode: boolean): Promise<User> {
        return this.update({
            entered_access_code: true,
            temp_answer_bio_question_token: uid2(255),
            temp_access_code_token: null,
            demo_user: isDemoCode
        })
    }
    User.prototype.markAnsweredAllBioQuestions = function(): Promise<User> {
        return this.update({
            answered_all_bio_questions: true,
            temp_password_token: uid2(255),
            temp_answer_bio_question_token: null
        })
    }
    User.prototype.hasSetPassword = function(): boolean {
        return this.password_hash != null && this.salt != null
    }
    User.prototype.verifyPassword = function(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password_hash)
    }
    User.prototype.setPassword = function(password: string): Promise<User> {
        const salt = bcrypt.genSaltSync(10)
        return this.update({
            salt: salt,
            password_hash: User.getPasswordHash(password, salt),
            temp_password_token: null,
            access_token: uid2(255)
        })
    }

    return User
}
