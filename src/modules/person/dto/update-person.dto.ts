import { CreatePersonDTO } from './create-person.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdatePersonDTO extends PartialType(CreatePersonDTO) {}
