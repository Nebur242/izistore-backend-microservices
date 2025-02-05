import { Module } from '@nestjs/common';
import { TestHelpersController } from './test-helpers.controller';
import { FirebaseService } from '@izistore/firebase';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [TestHelpersController],
  providers: [FirebaseService],
})
export class TestHelpersModule {}
