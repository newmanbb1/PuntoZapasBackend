import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    // Instanciamos el Logger de NestJS con el contexto 'HTTP'
    private logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction): void {
        const { ip, method, originalUrl } = request;
        const userAgent = request.get('user-agent') || '';

        // Escuchamos el evento 'finish' de la respuesta para obtener el status code real
        response.on('finish', () => {
            const { statusCode } = response;
            const contentLength = response.get('content-length') || 0;

            // Imprimimos el log en la consola
            this.logger.log(
                `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
            );
        });

        next(); // Fundamental para que la petición continúe su camino
    }
}
