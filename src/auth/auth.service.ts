import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    // Inyección de Prisma (Acceso a datos) y JwtService (Utilidad)
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async login(email: string, password_plana: string) {
        // 1. Lógica de acceso a datos usando el modelo del esquema
        const usuario = await this.prisma.usuario.findUnique({
            where: { email },
        });

        if (!usuario) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // 2. Aquí irá la verificación del password_hash (con bcrypt)
        // Por ahora dejamos un marcador de posición estructural
        const passwordValido = true;

        if (!passwordValido) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // 3. Generación del token estructurado
        const payload = { sub: usuario.id_usuario, email: usuario.email, rol: usuario.rol };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}