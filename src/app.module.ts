// src/app.module.ts (updated with proper null password handling)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/entities/course.entity';
import { Enrollment } from './courses/entities/enrollment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const password = configService.get('DB_PASSWORD');
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: password || undefined, // Use undefined instead of empty string
          database: configService.get('DB_DATABASE', 'nestjs'),
          entities: [User, Course, Enrollment],
          synchronize: configService.get('DB_SYNC', true),
        };
      },
    }),
    UsersModule,
    AuthModule,
    CoursesModule,
  ],
})
export class AppModule {}