import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {

  const logger = new Logger('Main');
  
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // Permite solicitudes desde tu aplicación Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Permite el envío de cookies
  });

  // Establezca el prefijo de ruta para que comience con /api/. Por ejemplo, localhost:3000/api
  app.setGlobalPrefix('api');

  // Habilitar el prefijo de ruta de la versión API. Por ejemplo, localhost:3000/api/v1/route
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );


  await app.listen( envs.port );

  logger.log(`Main running on port ${ envs.port }`);

}
bootstrap();
