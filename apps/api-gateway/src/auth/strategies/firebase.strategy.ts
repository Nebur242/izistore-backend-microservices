import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(token: string) {
    try {
      // First try to verify as admin user
      try {
        const adminDecodedToken = await admin.auth().verifyIdToken(token);
        console.log(adminDecodedToken);
        if (!adminDecodedToken.tenant_id) {
          return {
            uid: adminDecodedToken.uid,
            email: adminDecodedToken.email,
            isAdmin: true,
          };
        }
      } catch (error) {
        // Not an admin token, continue to tenant verification
      }

      // Extract tenant ID from token claims
      const decodedToken = await admin.auth().verifySessionCookie(token, true);
      const tenantId = decodedToken.tenant_id;

      if (!tenantId) {
        throw new UnauthorizedException('No tenant ID found in token');
      }

      // Verify token with tenant-specific Firebase instance
      const tenantAuth = admin.auth().tenantManager().authForTenant(tenantId);
      const tenantDecodedToken = await tenantAuth.verifyIdToken(token);

      return {
        uid: tenantDecodedToken.uid,
        email: tenantDecodedToken.email,
        tenantId,
        isAdmin: false,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
