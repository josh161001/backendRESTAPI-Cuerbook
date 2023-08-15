import { DataSource } from 'typeorm';
import { Seeder, runSeeders } from 'typeorm-extension';
import UserSeeder from './user.seeder';

export default class InitSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    await runSeeders(dataSource, {
      seeds: [UserSeeder],
    });
  }
}
