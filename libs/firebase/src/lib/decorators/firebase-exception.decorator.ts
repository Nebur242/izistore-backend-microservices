import { BadRequestException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { FirebaseError } from 'firebase-admin';

export function CatchFirebaseException(HttpException = BadRequestException) {
  return (
    target: unknown,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    const originalMethod = propertyDescriptor.value;
    propertyDescriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error: any) {
        console.log('Caught error:', error);
        const err = error as FirebaseError;
        console.log(err.message);
        throw new BadRequestException(err.message || 'Firebase error');
      }
    };
  };
}
