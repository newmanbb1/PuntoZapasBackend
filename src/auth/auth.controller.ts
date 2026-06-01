import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // Define la ruta base: /auth
export class AuthController {
    // Inyección de dependencia de la capa de servicio
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK) // Devuelve 200 OK en lugar del 201 por defecto para POST
    async login(@Body() loginDto: any) {
        // Nota: Más adelante reemplazaremos 'any' por un DTO validado con class-validator
        const { email, password } = loginDto;
        return this.authService.login(email, password);
    }
}