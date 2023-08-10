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
// entities
import { Group } from './entities/group.entity';
import { User } from '../users/entities/user.entity';

import { CreateGroupDto } from './dto/create-group.dto';
import { GroupsService } from './groups.service';

import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorator/auth';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Auth()
  @Post()
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Req() req,
  ): Promise<Group> {
    const user: User = req.user?.userId; //indicamos ? para que no de error en caso de que user no extista

    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado'); //validamos que el usuario este auturizado
    }

    // Llamamos a la función createGroup del servicio para crear el grupo
    const newGroup = await this.groupsService.createGroup(createGroupDto, user);

    return newGroup;
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id); //
  }
}
