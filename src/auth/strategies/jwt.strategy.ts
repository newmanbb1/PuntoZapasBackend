import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY_PROVISIONAL', // Usa variables de entorno
        });
    }

    // Si el token es válido, este método se ejecuta automáticamente y
    // expone los datos del usuario en request.user
    async validate(payload: any) {
        if (!payload) {
            throw new UnauthorizedException('Token no válido');
        }
        return { id_usuario: payload.sub, email: payload.email, rol: payload.rol };
    }
}