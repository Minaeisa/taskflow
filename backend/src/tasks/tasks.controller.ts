import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@CurrentUser('_id') userId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(userId, dto);
  }

  @Get()
  findByProject(
    @Query('projectId') projectId: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.tasksService.findByProject(projectId, userId);
  }

  @Get('stats')
  getStats(
    @Query('projectId') projectId: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.tasksService.getProjectStats(projectId, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('_id') userId: string) {
    return this.tasksService.delete(id, userId);
  }
}
