import { hash } from 'bcrypt';
import { AppRoles } from 'src/app.roles';
import { User } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(User);

    const data = {
      name: 'admin',
      email: 'l19480829@nuevoleon.tecnm.mx',
      password: await hash('161001', 10),
      description: 'Administrador del sistema',
      imagen: 'http://localhost:5000/upload/admin.jpg',
      roles: [AppRoles.admin], //
      status: true,
    };

    const user = await repository.findOne({ where: { email: data.email } });

    if (!user) {
      await repository.save(data);
    }
  }
}
