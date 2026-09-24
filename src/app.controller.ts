import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {

  @Get("/")
  public getHome() {
    return "your app is working";
  }
}
