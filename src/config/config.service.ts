import * as fs from 'fs';
import { parse } from 'dotenv';
import * as path from 'path';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };
  constructor() {
    const isDevelopmenEnv = process.env.NODE_ENV !== 'production';

    if (isDevelopmenEnv) {
      const envFilePath = path.join(__dirname, '../../..', '.env');
      const existPath = fs.existsSync(envFilePath);

      if (existPath) {
        this.envConfig = parse(fs.readFileSync(envFilePath));
      } else {
        console.log(envFilePath);
        process.exit(0);
      }
    } else {
      this.envConfig = {
        PORT: process.env.PORT,
      };
    }
  }
  get(key: string): string {
    return this.envConfig[key];
  }
}
