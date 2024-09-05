import { PartialType } from '@nestjs/mapped-types';
import { CreateUserBankInfoDto } from './create-user-bank-info.dto';

export class UpdateUserBankInfoDto extends PartialType(CreateUserBankInfoDto) {}
