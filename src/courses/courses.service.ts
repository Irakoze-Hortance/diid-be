import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { Repository, Like } from 'typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/create-course.dto';
import { EnrollStudentDto } from './dto/create-course.dto';
import { CourseQueryDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<any> {
    if (!isUUID(createCourseDto.teacherId)) {
      throw new BadRequestException('Invalid UUID format for teacherId');
    }
  
    const teacherId = createCourseDto.teacherId; 
  
    const teacher = await this.userRepository.findOne({ where: { id: teacherId } });
  
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
  
    const newCourse = this.courseRepository.create({
      ...createCourseDto,
      teacher, 
      enrolledStudents: [],
    });
  
    return this.courseRepository.save(newCourse);
  }

  async findAll(query: CourseQueryDto): Promise<{ data: Course[], total: number }> {
    const queryBuilder = this.courseRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.teacher', 'teacher') // Join the teacher relation
      .leftJoinAndSelect('course.enrolledStudents', 'enrolledStudents') // Join the enrolledStudents relation
      .leftJoinAndSelect('enrolledStudents.student', 'student') // Join the student relation
      .select([
        'course',
        'teacher.id',
        'teacher.firstName',
        'teacher.lastName',
        'teacher.email',
        'enrolledStudents.id',
        'student.id',
        'student.firstName',
        'student.lastName',
      ]);
  
    if (query.search) {
      queryBuilder.where('course.title LIKE :search OR course.description LIKE :search', {
        search: `%${query.search}%`,
      });
    }
  
    if (query.teacherId) {
      queryBuilder.andWhere('teacher.id = :teacherId', { teacherId: query.teacherId });
    }
  
    if (query.isPublished !== undefined) {
      queryBuilder.andWhere('course.isPublished = :isPublished', { isPublished: query.isPublished });
    }
  
    if (query.status) {
      queryBuilder.andWhere('course.status = :status', { status: query.status });
    }
  
    const total = await queryBuilder.getCount();
    const data = await queryBuilder.getMany();
  
    return { data, total };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });
  
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    
    if (updateCourseDto.teacherId) {
      const teacher = await this.userRepository.findOne({ where: { id: updateCourseDto.teacherId } });
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
      course.teacher = teacher;
      delete updateCourseDto.teacherId;
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  async enrollStudent(courseId: string, enrollData: EnrollStudentDto): Promise<Enrollment> {
    // Find the course with relations to ensure proper loading
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['enrolledStudents', 'enrolledStudents.student']
    });
  
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    const student = await this.userRepository.findOne({ 
      where: { id: enrollData.studentId } 
    });
  
    if (!student) {
      throw new NotFoundException('Student not found');
    }
  
    if (!course.isPublished) {
      throw new BadRequestException('Cannot enroll in an unpublished course');
    }
  
    // Count current enrollments
    const currentEnrollments = course.enrolledStudents?.length || 0;
  
    if (course.maxStudents > 0 && currentEnrollments >= course.maxStudents) {
      throw new BadRequestException('Course has reached maximum enrollment capacity');
    }
  
    // Check for existing enrollment
    const existingEnrollment = course.enrolledStudents?.find(
      enrollment => enrollment.student.id === student.id
    );
  
    if (existingEnrollment) {
      throw new BadRequestException('Student is already enrolled in this course');
    }
  
    // Create and save the new enrollment
    const enrollment = this.enrollmentRepository.create({
      course,
      student,
      status: 'active',
    });
  
    await this.enrollmentRepository.save(enrollment);
  
    // Reload the enrollment to ensure all relations are loaded
    return this.enrollmentRepository.findOne({
      where: { id: enrollment.id },
      relations: ['course', 'student']
    });
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { course: { id: courseId }, student: { id: studentId } },
      relations: ['course', 'student'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.enrollmentRepository.remove(enrollment);
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    const course = await this.findOne(courseId);
    
    return this.enrollmentRepository.find({
      where: { course: { id: courseId } },
      relations: ['student'],
    });
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { student: { id: studentId } },
      relations: ['course', 'course.teacher'],
    });

    return enrollments.map(enrollment => enrollment.course);
  }

  async markCourseCompleted(enrollmentId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course', 'student'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();
    
    return this.enrollmentRepository.save(enrollment);
  }

  async getCourseByTeacher(teacherId: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['teacher'],
    });
  }
}