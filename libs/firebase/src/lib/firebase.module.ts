// libs/firebase/src/lib/firebase.module.ts
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import {
  FirebaseModuleAsyncOptions,
  FirebaseModuleOptions,
  FirebaseOptionsFactory,
} from './interfaces/firebase-options.interface';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(options?: FirebaseModuleOptions): DynamicModule {
    return {
      module: FirebaseModule,
      imports: [ConfigModule, HttpModule],
      providers: [
        {
          provide: 'FIREBASE_OPTIONS',
          useValue: options,
        },
        FirebaseService,
      ],
      exports: [FirebaseService],
    };
  }

  static forRootAsync(options: FirebaseModuleAsyncOptions): DynamicModule {
    return {
      module: FirebaseModule,
      imports: [...(options.imports || []), HttpModule],
      providers: [...this.createAsyncProviders(options), FirebaseService],
      exports: [FirebaseService],
    };
  }

  private static createAsyncProviders(
    options: FirebaseModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    if (!options.useClass || !options.useClass) return [];

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: FirebaseModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: 'FIREBASE_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: 'FIREBASE_OPTIONS',
      useFactory: async (optionsFactory: FirebaseOptionsFactory) =>
        await optionsFactory.createFirebaseOptions(),
      inject:
        options.useExisting && options.useClass
          ? [options.useExisting || options.useClass]
          : [],
    };
  }
}
