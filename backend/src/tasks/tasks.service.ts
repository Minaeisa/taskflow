import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private projectsService: ProjectsService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    await this.projectsService.findOne(dto.projectId, userId);
    const count = await this.taskModel.countDocuments({
      project: new Types.ObjectId(dto.projectId),
      status: dto.status || 'todo',
    });
    return this.taskModel.create({
      title: dto.title,
      description: dto.description,
      status: dto.status || 'todo',
      priority: dto.priority || 'medium',
      project: new Types.ObjectId(dto.projectId),
      createdBy: new Types.ObjectId(userId),
      assignee: dto.assigneeId ? new Types.ObjectId(dto.assigneeId) : null,
      dueDate: dto.dueDate || null,
      tags: dto.tags || [],
      order: count,
    });
  }

  async findByProject(projectId: string, userId: string) {
    await this.projectsService.findOne(projectId, userId);
    const tasks = await this.taskModel
      .find({ project: new Types.ObjectId(projectId) })
      .populate('createdBy', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .sort({ status: 1, order: 1 })
      .exec();

    return {
      todo: tasks.filter((t) => t.status === 'todo'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      in_review: tasks.filter((t) => t.status === 'in_review'),
      done: tasks.filter((t) => t.status === 'done'),
    };
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    await this.projectsService.findOne(task.project.toString(), userId);

    const updateData: any = { ...dto };
    if (dto.assigneeId !== undefined) {
      updateData.assignee = dto.assigneeId ? new Types.ObjectId(dto.assigneeId) : null;
      delete updateData.assigneeId;
    }

    return this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'name email avatar')
      .populate('assignee', 'name email avatar');
  }

  async delete(id: string, userId: string) {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    await this.projectsService.findOne(task.project.toString(), userId);
    await this.taskModel.findByIdAndDelete(id);
    return { message: 'Task deleted' };
  }

  async getProjectStats(projectId: string, userId: string) {
    await this.projectsService.findOne(projectId, userId);
    const stats = await this.taskModel.aggregate([
      { $match: { project: new Types.ObjectId(projectId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const result = { todo: 0, in_progress: 0, in_review: 0, done: 0, total: 0 };
    stats.forEach((s) => { result[s._id] = s.count; result.total += s.count; });
    return result;
  }
}
