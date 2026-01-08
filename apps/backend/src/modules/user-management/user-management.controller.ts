import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UserManagementService } from './user-management.service';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { ListUsersQueryDto } from './dto/list-users.query.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/users')
export class UserManagementController {
  constructor(private readonly service: UserManagementService) {}

  @Post()
  create(@Body() dto: CreateUserByAdminDto) {
    return this.service.createByAdmin(dto);
  }

  @Get()
  list(@Query() query: ListUsersQueryDto) {
    return this.service.listUsersForTable(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserByAdminDto) {
    return this.service.updateUserByAdmin(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteUserByAdmin(id);
  }
}
