import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.workspaceModel.create({
      ...dto,
      owner: new Types.ObjectId(userId),
      members: [{ user: new Types.ObjectId(userId), role: 'owner' }],
    });
    return workspace.populate('members.user', 'name email avatar');
  }

  async findAllForUser(userId: string) {
    return this.workspaceModel
      .find({ 'members.user': new Types.ObjectId(userId) })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.workspaceModel
      .findById(id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .exec();

    if (!workspace) throw new NotFoundException('Workspace not found');
    this.checkMembership(workspace, userId);
    return workspace;
  }

  async update(id: string, userId: string, dto: Partial<CreateWorkspaceDto>) {
    const workspace = await this.findOne(id, userId);
    this.checkAdminOrOwner(workspace, userId);
    return this.workspaceModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async delete(id: string, userId: string) {
    const workspace = await this.findOne(id, userId);
    if (workspace.owner.toString() !== userId) {
      throw new ForbiddenException('Only the owner can delete a workspace');
    }
    await this.workspaceModel.findByIdAndDelete(id);
    return { message: 'Workspace deleted' };
  }

  async addMember(workspaceId: string, userId: string, memberId: string, role = 'member') {
    const workspace = await this.findOne(workspaceId, userId);
    this.checkAdminOrOwner(workspace, userId);

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === memberId,
    );
    if (alreadyMember) return workspace;

    workspace.members.push({ user: new Types.ObjectId(memberId) as any, role: role as any });
    return workspace.save();
  }

  async removeMember(workspaceId: string, userId: string, memberId: string) {
    const workspace = await this.findOne(workspaceId, userId);
    this.checkAdminOrOwner(workspace, userId);

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== memberId,
    );
    return workspace.save();
  }

  private checkMembership(workspace: WorkspaceDocument, userId: string) {
    const isMember = workspace.members.some(
      (m) => m.user.toString() === userId || m.user._id?.toString() === userId,
    );
    if (!isMember) throw new ForbiddenException('Not a member of this workspace');
  }

  private checkAdminOrOwner(workspace: WorkspaceDocument, userId: string) {
    const member = workspace.members.find(
      (m) => m.user.toString() === userId || m.user._id?.toString() === userId,
    );
    if (!member || !['owner', 'admin'].includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
