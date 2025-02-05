import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FirebaseService } from '@izistore/firebase';
import { RpcException } from '@nestjs/microservices';
import {
  CreateTestUserDto,
  LoginTestUserDto,
  TestUserDto,
} from './test-helpers.dto';
import { AxiosError } from 'axios';

interface RpcErrorResponse {
  error: {
    status: HttpStatus;
    message: string;
    code: string;
  };
}
type FirebaseAuthErrorCode =
  | 'auth/user-not-found'
  | 'auth/email-already-exists'
  | 'auth/invalid-email'
  | 'auth/weak-password'
  | 'auth/wrong-password';

@Controller()
export class TestHelpersController {
  private readonly FIREBASE_ERROR_MAP = {
    'auth/user-not-found': {
      status: HttpStatus.NOT_FOUND,
      message: 'User not found',
    },
    'auth/email-already-exists': {
      status: HttpStatus.CONFLICT,
      message: 'Email is already in use',
    },
    'auth/invalid-email': {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid email format',
    },
    'auth/weak-password': {
      status: HttpStatus.BAD_REQUEST,
      message: 'Password is too weak',
    },
    'auth/wrong-password': {
      status: HttpStatus.UNAUTHORIZED,
      message: 'Invalid credentials',
    },
  };

  constructor(private readonly firebaseService: FirebaseService) {}

  private handleError(error: any, context: string): never {
    console.error(`🔥 Error in ${context}:`, {
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    let errorResponse: RpcErrorResponse | null = null;

    // Handle Firebase Auth errors
    if (error?.code && error.code.startsWith('auth/')) {
      const mappedError =
        this.FIREBASE_ERROR_MAP[error.code as FirebaseAuthErrorCode] ||
        'Firebase Auth Error';
      if (mappedError) {
        errorResponse = {
          error: {
            status: mappedError.status,
            message: mappedError.message,
            code: error.code,
          },
        };
      }
    }

    // Handle Axios errors
    if (error instanceof AxiosError) {
      errorResponse = {
        error: {
          status: HttpStatus.BAD_REQUEST,
          message: error.response?.data?.message || error.message,
          code: 'AXIOS_ERROR',
        },
      };
    }

    // Handle NestJS HTTP exceptions
    if (error instanceof HttpException) {
      errorResponse = {
        error: {
          status: error.getStatus(),
          message: error.message,
          code: 'HTTP_ERROR',
        },
      };
    }

    // Default error if none of the above match
    if (!errorResponse) {
      errorResponse = {
        error: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Internal server error',
          code: error.code || 'INTERNAL_ERROR',
        },
      };
    }

    console.error('🔥 Throwing RPC error:', errorResponse);
    throw new RpcException(errorResponse);
  }

  @MessagePattern({ cmd: 'post', path: '/test-helpers/user/login' })
  async loginTestUser(data: { body: LoginTestUserDto }): Promise<TestUserDto> {
    try {
      const { body: loginTestUserDto } = data;
      return await this.firebaseService.login(
        loginTestUserDto.email,
        loginTestUserDto.password
      );
    } catch (error) {
      this.handleError(error, 'loginTestUser');
    }
  }

  @MessagePattern({ cmd: 'post', path: '/test-helpers/user/register' })
  async registerTestUser(data: {
    body: CreateTestUserDto;
  }): Promise<TestUserDto> {
    try {
      const { body: createTestUserDto } = data;
      await this.firebaseService.createUser(
        createTestUserDto.email,
        createTestUserDto.password
      );
      return await this.firebaseService.login(
        createTestUserDto.email,
        createTestUserDto.password
      );
    } catch (error) {
      this.handleError(error, 'registerTestUser');
    }
  }
}
