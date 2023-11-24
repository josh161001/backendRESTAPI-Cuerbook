import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import * as serveStatic from 'serve-static';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({});

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('react example')
    .setDescription('The react API description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
    },
  });

  app.use('/upload', express.static(path.join(__dirname, '../../', 'upload')));

  // Sirve los archivos estáticos de tu aplicación React
  app.use(serveStatic(path.join(__dirname, '..', 'dist')));

  // Redirige todas las solicitudes desconocidas al archivo index.html de tu aplicación React
  app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
  });

  await app.listen(AppModule.port);
}
bootstrap();
