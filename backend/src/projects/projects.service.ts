import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private workspacesService: WorkspacesService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    await this.workspacesService.findOne(dto.workspaceId, userId);
    return this.projectModel.create({
      name: dto.name,
      description: dto.description,
      color: dto.color,
      workspace: new Types.ObjectId(dto.workspaceId),
      createdBy: new Types.ObjectId(userId),
    });
  }

  async findByWorkspace(workspaceId: string, userId: string) {
    await this.workspacesService.findOne(workspaceId, userId);
    return this.projectModel
      .find({ workspace: new Types.ObjectId(workspaceId), archived: false })
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectModel
      .findById(id)
      .populate('createdBy', 'name email avatar')
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    await this.workspacesService.findOne(project.workspace.toString(), userId);
    return project;
  }

  async update(id: string, userId: string, dto: Partial<CreateProjectDto>) {
    await this.findOne(id, userId);
    return this.projectModel.findByIdAndUpdate(
      id,
      { name: dto.name, description: dto.description, color: dto.color },
      { new: true },
    );
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.projectModel.findByIdAndDelete(id);
    return { message: 'Project deleted' };
  }

  async getStats(workspaceId: string, userId: string) {
    await this.workspacesService.findOne(workspaceId, userId);
    const stats = await this.projectModel.aggregate([
      { $match: { workspace: new Types.ObjectId(workspaceId) } },
      { $group: { _id: '$archived', count: { $sum: 1 } } },
    ]);
    const total = stats.reduce((a, b) => a + b.count, 0);
    const active = stats.find((s) => !s._id)?.count || 0;
    return { total, active, archived: total - active };
  }
}
