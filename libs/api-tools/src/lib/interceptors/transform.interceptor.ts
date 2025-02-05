import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

const METHOD_MESSAGES = {
  GET: 'Resource found',
  POST: 'Resource created',
  PUT: 'Resource updated',
  PATCH: 'Resource updated',
  DELETE: 'Resource deleted',
};

const DEFAULT_MESSAGE = 'Success';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    const statusCode = response.statusCode;
    const method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = request.method;
    const message = METHOD_MESSAGES[`${method}`] || DEFAULT_MESSAGE;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message,
        data,
      }))
    );
  }
}
