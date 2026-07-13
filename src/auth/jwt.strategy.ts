import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-2026',
    });
  }

  async validate(payload: any) {
    return { 
      id_usuario: payload.sub, 
      email: payload.email, 
      rol: payload.rol,
      sucursal_id: payload.sucursal_id 
    };
  }
}
