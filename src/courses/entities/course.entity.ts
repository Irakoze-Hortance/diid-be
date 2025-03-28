import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from './enrollment.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 0 })
  maxStudents: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @ManyToOne(() => User, {eager: true})
  teacher: User;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course, { eager: true })
  enrolledStudents: Enrollment[];


  @Column({ default: 'draft' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}