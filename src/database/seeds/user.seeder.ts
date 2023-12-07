import { hash } from 'bcrypt';
import { AppRoles } from 'src/app.roles';
import { User } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(User);

    const data = {
      department: 'Comunicación y Difusión',
      name: 'María del Carmen Errasquin Barradas',
      email: 'cyd@nuevoleon.tecnm.mx',
      password: await hash('comunicacion2023', 10),
      description:
        'Comunicar nuestra identidad y valores de manera efectiva, conectando y comprometiendo a nuestra audiencia a través de estrategias innovadoras y contenido relevante.',
      imagen: 'https://cuerbook-backend.onrender.com/upload/admin.jpg',
      roles: [AppRoles.admin], //
      status: true,
    };

    const user = await repository.findOne({ where: { email: data.email } });

    if (!user) {
      await repository.save(data);
    }
  }
}
