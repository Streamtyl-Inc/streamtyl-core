import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { typeOrmAsyncConfig } from 'config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { StreamModule } from './stream/stream.module';
import { FileModule } from './file/file.module';
import { CommentModule } from './comment/comment.module';
import { APP_GUARD } from '@nestjs/core';
import { WalletModule } from './wallet/wallet.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      envFilePath: ['envs/production.env', 'envs/development.env'],
      cache: true,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 100, ttl: 60 }],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ScheduleModule.forRoot(),
    AuthModule,
    StreamModule,
    FileModule,
    CommentModule,
    WalletModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
