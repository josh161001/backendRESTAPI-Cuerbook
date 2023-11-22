import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { createPdf } from '@saemhco/nestjs-html-pdf'; // Importa createPdf
import * as moment from 'moment';
import 'moment/locale/es';

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generatePdf(eventoId: string): Promise<Buffer> {
    moment.locale('es');

    const evento = await this.eventRepository.findOne({
      where: { id: eventoId },
      relations: ['user'],
    });
    if (!evento) {
      throw new Error('El evento no existe');
    }

    const usuario = evento.user;

    const htmlPath = 'src/modules/pdf/templates/solicitud-evento.hbs'; // Ruta a tu archivo HTML
    const options = {};
    const data = {
      nombreDepartamento: usuario.department,
      fechacreatedATEvento: moment(evento.createdAt).format('LLL') + ' hrs',
      jefeDepartamento: usuario.name,
      nombreEvento: evento.name,
      fechaEvento: moment(evento.fecha).format('LLL') + ' hrs',
      lugarEvento: evento.lugar,
      detallesEvento: evento.detalles,
    };

    const pdfBuffer = await createPdf(htmlPath, options, data);

    return pdfBuffer;
  }
}
