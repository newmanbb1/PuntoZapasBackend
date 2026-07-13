import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno de base de datos';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'Conflicto: El registro ya existe (violación de restricción única).';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'No Encontrado: El registro solicitado no existe.';
        break;
      default:
        message = `Error de base de datos: ${exception.message.split('\\n').pop()}`;
        break;
    }

    response.status(status).json({
      statusCode: status,
      error: 'Prisma Error',
      message: message,
    });
  }
}
