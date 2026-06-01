import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'generated/prisma/client';

@Catch() // Al no pasar argumentos, atrapa absolutamente TODOS los errores
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | object = 'Error interno del servidor';

        // 1. Manejo de Errores HTTP estándar de NestJS
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : (exceptionResponse as any).message || exceptionResponse;
        }
        // 2. Manejo de Errores Específicos de Prisma
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            // P2002: Violación de restricción única (ej. email duplicado)
            if (exception.code === 'P2002') {
                status = HttpStatus.CONFLICT;
                message = `El registro ya existe. Violación de restricción única en el campo: ${exception.meta?.target}`;
            }
            // P2025: Registro no encontrado (ej. al intentar actualizar o borrar)
            else if (exception.code === 'P2025') {
                status = HttpStatus.NOT_FOUND;
                message = 'El registro solicitado no existe en la base de datos';
            }
            // Puedes ir agregando más códigos de Prisma según lo necesites
        }

        // Registramos el error en la consola para nosotros (los desarrolladores)
        this.logger.error(
            `Status: ${status} Error: ${JSON.stringify(message)}`,
            exception instanceof Error ? exception.stack : '',
        );

        // Devolvemos una respuesta JSON estandarizada al cliente
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            message,
        });
    }
}