import { Injectable } from "@vigilio/express-core";

@Injectable()
export class AppService {
    index() {
        return "hello world";
    }
}
