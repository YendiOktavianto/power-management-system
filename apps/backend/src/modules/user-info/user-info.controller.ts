import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserInfoService } from './user-info.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@UseGuards(JwtAuthGuard)
@Controller('user-info')
export class UserInfoController {
  constructor(private readonly svc: UserInfoService) {}

  // GET /user-info  -> data untuk halaman User Info (profil + devices ringkas)
  @UseGuards(JwtAuthGuard)
  @Get()
  async me(@CurrentUser() user: { userId: string }) {
    return this.svc.getMe(user.userId);
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: { userId: string }, @Body() dto: UpdateProfileDto) {
    return this.svc.updateProfile(user.userId, dto);
  }

  @Patch('password')
  async changePassword(@CurrentUser() user: { userId: string }, @Body() dto: ChangePasswordDto) {
    return this.svc.changePassword(user.userId, dto);
  }

  @Patch('photo')
  async updatePhoto(@CurrentUser() user: { userId: string }, @Body() dto: UpdatePhotoDto) {
    return this.svc.updatePhoto(user.userId, dto);
  }
}
