import { roles } from './../../app.roles';
import { hash } from 'bcrypt';
import { User } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(User);

    const data = {
      name: 'admin',
      email: 'l19480829@nuevoleon.tecnm.mx',
      password: await hash('admin', 10),
      roles: ['ADMIN'],
      status: true,
    };

    const user = await repository.findOne({ where: { email: data.email } });

    if (!user) {
      await repository.save(data);
    }
  }
}
