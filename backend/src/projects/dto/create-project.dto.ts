import { IsString, MinLength, MaxLength, IsOptional, IsMongoId } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsMongoId()
  workspaceId: string;
}
