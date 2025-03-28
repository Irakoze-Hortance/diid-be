import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/create-course.dto';
import { EnrollStudentDto } from './dto/create-course.dto';
import { CourseQueryDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll(@Query() query: CourseQueryDto): Promise<{ data: Course[], total: number }> {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }


  @Get('teacher/:teacherId')
  getTeacherCourses(@Param('teacherId') teacherId: string): Promise<Course[]> {
    return this.coursesService.getCourseByTeacher(teacherId);
  }

  @Post(':id/enroll')
  enrollStudent(
    @Param('id') courseId: string,
    @Body() enrollStudentDto: EnrollStudentDto,
  ): Promise<Enrollment> {
    return this.coursesService.enrollStudent(courseId, enrollStudentDto);
  }

  @Delete(':courseId/students/:studentId')
  unenrollStudent(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
  ): Promise<void> {
    return this.coursesService.unenrollStudent(courseId, studentId);
  }

  @Get(':id/enrollments')
  getCourseEnrollments(@Param('id') courseId: string): Promise<Enrollment[]> {
    return this.coursesService.getCourseEnrollments(courseId);
  }

  @Get('student/:studentId')
  getStudentCourses(@Param('studentId') studentId: string): Promise<Course[]> {
    return this.coursesService.getStudentCourses(studentId);
  }

  @Patch('enrollments/:enrollmentId/complete')
  markCourseCompleted(@Param('enrollmentId') enrollmentId: string): Promise<Enrollment> {
    return this.coursesService.markCourseCompleted(enrollmentId);
  }
}