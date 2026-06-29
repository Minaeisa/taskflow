import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@CurrentUser('_id') userId: string, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('_id') userId: string) {
    return this.workspacesService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('_id') userId: string) {
    return this.workspacesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @Body() dto: Partial<CreateWorkspaceDto>,
  ) {
    return this.workspacesService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('_id') userId: string) {
    return this.workspacesService.delete(id, userId);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @Body() body: { memberId: string; role?: string },
  ) {
    return this.workspacesService.addMember(id, userId, body.memberId, body.role);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.workspacesService.removeMember(id, userId, memberId);
  }
}
