import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import * as fs from 'fs';

const LOGGER = new Logger('API');
if (!process.env.TZ) {
  LOGGER.error('Enviroment TZ is necessary');
  process.exit(0);
}

async function bootstrap() {
  // const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  //   logger:
  //     process.env.NODE_ENV === 'development'
  //       ? ['log', 'debug', 'error', 'verbose', 'warn']
  //       : ['log', 'error', 'warn'],
  // });

  const httpsOptions = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
  };
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
    logger:
      process.env.NODE_ENV === 'development'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['log', 'error', 'warn'],
  });
  

  // Get the ConfigService instance
  const config: ConfigService = app.get(ConfigService);

  // Set the global prefix
  const envBasePath = config.get<string>('BASEPATH');
  const basepath =
    envBasePath && envBasePath.length > 1
      ? envBasePath.charAt(envBasePath.length - 1) === '/'
        ? envBasePath.substring(0, envBasePath.length - 1)
        : envBasePath
      : '';
  if (basepath !== '') {
    app.setGlobalPrefix(basepath);
  }

  // Security
  app.use(helmet());

  // CORS
  let configCORS = {
    origin: ['*'],
    methods: 'GET,PUT,PATCH,POST,DELETE,OPTIONS',
  };
  switch (process.env.NODE_ENV) {
    case 'development':
      configCORS.origin = [
        'http://0.0.0.0:3003',
        config.get<string>('FRONT_URL'),
      ];
      break;
    case 'production':
      configCORS.origin = [config.get<string>('FRONT_URL')];
      break;
  }

  // //   app.enableCors(configCORS);
  // app.enableCors({
  //   origin: '*',
  //   methods: 'GET,PUT,PATCH,POST,DELETE,OPTIONS',
  // });

  app.enableCors({
    origin: [config.get<string>('FRONT_URL')],
    credentials: true,
    methods: 'GET,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  

  // Swagger Docs
  let swaggerPath = '';
  if (process.env.SWAGGER_DOCS && process.env.SWAGGER_DOCS === '1') {
    const configSwagger = new DocumentBuilder()
      .setTitle(config.get<string>('DESCRIPTION'))
      .setVersion(config.get<string>('VERSION'))
      .addApiKey({
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key For External calls',
      })
      .addBearerAuth({
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT Token use Bearer',
      })
      .build();
    const document = SwaggerModule.createDocument(app, configSwagger);
    fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
    swaggerPath = `${basepath}${basepath !== '' ? '/' : ''}api-docs`.replace('//', '/');
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: { schemes: ['https'] },
    });
  }

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Static files
  app.useStaticAssets(join(__dirname, '..', '..', 'files'), {
    index: false,
    prefix: '/files',
  });

  // Start the application
  await app.listen(config.get<number>('PORT'));

  // Log the application status
  LOGGER.log(`FMA-API Time Zone - ${config.get<string>('TZ')}`);
  LOGGER.log(`FMA-API Started - ${await app.getUrl()}/${basepath}`);
  LOGGER.log(
    `Swagger Docs - ${await app.getUrl()}/${basepath}${basepath !== '' ? '/' : ''}api-docs`,
  );
}

bootstrap();
