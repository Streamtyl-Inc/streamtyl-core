import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { UserModule } from 'src/user/user.module';
import { FileModule } from 'src/file/file.module';
import { Stream } from './entities/stream.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stream, Comment]),
    UserModule,
    FileModule,
  ],
  controllers: [StreamController],
  providers: [StreamService],
})
export class StreamModule {}
