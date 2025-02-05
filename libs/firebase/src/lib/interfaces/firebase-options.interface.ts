import { ModuleMetadata, Type } from '@nestjs/common';

export interface FirebaseModuleOptions {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  [key: string]: any;
}

export interface FirebaseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<FirebaseOptionsFactory>;
  useClass?: Type<FirebaseOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<FirebaseModuleOptions> | FirebaseModuleOptions;
  inject?: any[];
}

export interface FirebaseOptionsFactory {
  createFirebaseOptions():
    | Promise<FirebaseModuleOptions>
    | FirebaseModuleOptions;
}
