import { AuthGuard } from '@nestjs/passport';
import { ApiBody } from '@nestjs/swagger';
import { UpdatePersonDTO } from './dto/update-person.dto';
import { CreatePersonDTO } from './dto/create-person.dto';
import { PersonService } from './person.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  //   @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPerson() {
    return await this.personService.getAllPerson();
  }

  @ApiBody({ type: CreatePersonDTO })
  @Post()
  async createPerson(@Body() createPersonDTO: CreatePersonDTO) {
    return await this.personService.createPerson(createPersonDTO);
  }

  @Get(':id')
  async getPersonById(@Param('id') id: string) {
    return await this.personService.getPersonById(id);
  }

  @ApiBody({ type: UpdatePersonDTO })
  @Patch(':id')
  async updatePersonById(
    @Param('id') id: string,
    @Body() UpdatePersonDTO: UpdatePersonDTO,
  ) {
    return await this.personService.updatePerson(id, UpdatePersonDTO);
  }

  @Delete(':id')
  async deletePersonById(@Param('id') id: string) {
    return await this.personService.deletePersonById(id);
  }

  @Get('/root/all')
  async getAllRootPeople() {
    return await this.personService.getAllRootPeople();
  }

  @Delete('delete/bulk')
  async bulkDelete(@Body('name') name: string) {
    return await this.personService.bulkDelete(name);
  }
}
