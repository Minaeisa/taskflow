import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string, withPassword = false) {
    const query = this.userModel.findOne({ email });
    if (withPassword) query.select('+password +refreshToken');
    return query.exec();
  }

  async create(data: { name: string; email: string; password: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    return this.userModel.create({ ...data, password: hashed });
  }

  async updateRefreshToken(userId: string, token: string | null) {
    const hashed = token ? await bcrypt.hash(token, 10) : null;
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed });
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await this.userModel.findByIdAndUpdate(userId, data, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(userId: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { password: hashed });
  }
}
