import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import type { Request, Response } from "express";

let cachedApp: any;

async function bootstrap() {
  console.log("1 - Bootstrap started");

  const app = await NestFactory.create(AppModule);

  console.log("2 - App created");

  // Apply middlewares
  app.use(helmet());

  // CORS policy
  app.enableCors({
    origin: "http://localhost:3000",
  });

  // Swagger
  const swagger = new DocumentBuilder()
    .setTitle("Nest JS Course - App API")
    .setDescription("your api description")
    .addServer("http://localhost:5000")
    .setTermsOfService(
      "http://localhost:5000/terms-of-service",
    )
    .setLicense("MIT License", "https://google.com")
    .setVersion("1.0")
    .addSecurity("bearer", {
      type: "http",
      scheme: "bearer",
    })
    .addBearerAuth()
    .build();

  const documentation = SwaggerModule.createDocument(app, swagger);

  SwaggerModule.setup("swagger", app, documentation);

  await app.init();

  console.log("3 - App initialized");

  return app;
}

export default async function handler(
  req: Request,
  res: Response,
) {
  console.log("4 - Handler called");

  if (!cachedApp) {
    cachedApp = await bootstrap();
  }

  const expressApp = cachedApp.getHttpAdapter().getInstance();

  return expressApp(req, res);
}