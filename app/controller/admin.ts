import { UserModel } from "../model"

export interface AdminController {
  createOrGetUser(email: string): Promise<UserModel>
}

export class AppAdminController implements AdminController {
  async createOrGetUser(email: string): Promise<UserModel> {
    const existingUser = await UserModel.findByEmail(email)
    if (existingUser) {
      return existingUser
    }

    return UserModel.create(email)
  }
}
