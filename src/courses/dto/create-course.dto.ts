import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min, Max, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxStudents?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean = false;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
  
  @IsNotEmpty()
  @IsUUID()
  teacherId: string;


  @IsString()
  @IsOptional()
  status?: string = 'draft';
}



export class CourseQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}


export class EnrollStudentDto {
  @IsNotEmpty()
  studentId: string;


}
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
