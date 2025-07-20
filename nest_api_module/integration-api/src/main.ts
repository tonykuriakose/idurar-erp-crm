import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:8888'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('integration');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('IDURAR Integration API')
    .setDescription('Integration and reporting API for IDURAR ERP/CRM system')
    .setVersion('1.0')
    .addTag('integration')
    .addTag('reports')
    .addTag('webhooks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('integration/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`Integration API running at ${port}`);
  console.log(`API Documentation: http://localhost:${port}/integration/docs`);
}

bootstrap();