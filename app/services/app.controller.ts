import { Controller, Get, Injectable } from "@vigilio/express-core";
import { AppService } from "./app.service";

@Injectable()
@Controller("/")
export class AppController {
    constructor(private readonly appService: AppService) {}
    @Get("/")
    index() {
        return this.appService.index();
    }
}
