import { Inject, Injectable, Optional } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { ConfigService } from '@nestjs/config';
import { FirebaseModuleOptions } from './interfaces/firebase-options.interface';
import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FirebaseService {
  constructor(
    private readonly httpService: HttpService,
    @Optional() private readonly configService?: ConfigService,
    @Optional()
    @Inject('FIREBASE_OPTIONS')
    private readonly options?: FirebaseModuleOptions
  ) {
    const projectId = this.getConfig('FIREBASE_PROJECT_ID');
    const privateKey = this.getConfig('FIREBASE_PRIVATE_KEY')?.replace(
      /\\n/g,
      '\n'
    );
    const clientEmail = this.getConfig('FIREBASE_CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error('Firebase configuration is missing');
    }

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      });
    }
  }

  private getConfig(key: string): string | undefined {
    if (this.options && key in this.options) {
      return this.options[key];
    }
    return this.configService?.get<string>(key);
  }

  async createTenant(tenantId: string) {
    return getAuth()
      .tenantManager()
      .createTenant({
        displayName: tenantId,
        emailSignInConfig: {
          enabled: true,
          passwordRequired: false, // Email link sign-in enabled.
        },
      });
  }

  verifyToken(token: string, checkRevoked = false) {
    return getAuth().verifyIdToken(
      token.replace('Bearer', '').trim(),
      checkRevoked
    );
  }

  createUser(email: string, password: string) {
    return getAuth().createUser({ email, password });
  }

  getUser(uid: string) {
    return getAuth().getUser(uid);
  }

  getUsers(maxResults?: number, pageToken?: string) {
    return getAuth().listUsers(maxResults, pageToken);
  }

  async removeUser(uid: string) {
    await getAuth().deleteUser(uid);
  }

  login(email: string, password: string) {
    return lastValueFrom(
      this.httpService
        .post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword`,
          {
            email,
            password,
            returnSecureToken: true,
          },
          {
            params: {
              key: this.getConfig('FIREBASE_REST_API_KEY'),
            },
          }
        )
        .pipe(map((response) => response.data))
    );
  }
}
