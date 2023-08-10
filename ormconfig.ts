// ormconfig.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as configKeys from './src/config/config.keys'; // Importa las constantes aquí

dotenv.config();

const source = new DataSource({
  type: 'postgres',
  host: process.env[configKeys.DATABASE_HOST], // Utiliza las constantes para acceder a las propiedades del env
  port: parseInt(process.env[configKeys.DATABASE_PORT], 10),
  database: process.env[configKeys.DATABASE_NAME],
  username: process.env[configKeys.DATABASE_USERNAME],
  password: process.env[configKeys.DATABASE_PASSWORD],
  dropSchema: false,
  synchronize: true,
  entities: ['src/**/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'], //
});
export default source;

// migrations commands // package.json

// npm run typeorm:generate-migration --name=CreatePost
// npm run typeorm:run-migrations
// npm run typeorm:revert-migration
