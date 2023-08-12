import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorator/auth';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

import { EventsService } from './events.service';

import { User } from '../users/entities/user.entity';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Auth()
  @Post(':groupId')
  async create(
    @Param('groupId') groupId: string,
    @Req() req,
    @Body() createEventDto: CreateEventDto,
  ) {
    const user: User = req.user?.userId;
    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return this.eventsService.create(groupId, createEventDto, user);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
