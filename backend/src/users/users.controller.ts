import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return user;
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser('_id') userId: string,
    @Body() body: { name?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(userId, body);
  }
}
