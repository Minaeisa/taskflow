import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser('_id') userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  findByWorkspace(
    @Query('workspaceId') workspaceId: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.projectsService.findByWorkspace(workspaceId, userId);
  }

  @Get('stats')
  getStats(
    @Query('workspaceId') workspaceId: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.projectsService.getStats(workspaceId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('_id') userId: string) {
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @Body() dto: Partial<CreateProjectDto>,
  ) {
    return this.projectsService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('_id') userId: string) {
    return this.projectsService.delete(id, userId);
  }
}
