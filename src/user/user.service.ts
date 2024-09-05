import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { assign } from 'lodash';
import { Repository } from 'typeorm';
import { MakeAdminDto } from './dto/make-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role, User } from './entities/user.entity';
import { IdentityService } from '../identity/identity.service';
import { UserBank } from './entities/user-bank.entity';
import { CreateUserBankInfoDto } from './dto/create-user-bank-info.dto';
import { UpdateUserBankInfoDto } from './dto/update-user-bank-info.dto';
import { OrderService } from '../order/order.service';
import { paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserBank)
    private readonly userBankRepository: Repository<UserBank>,
    @Inject(forwardRef(() => IdentityService))
    private readonly identityService: IdentityService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  async getProfile(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('profile not found');

    delete user.password;
    delete user.password_changed_at;
    delete user.password_reset_token;
    delete user.password_reset_token_expires;
    delete user.pin;
    delete user.verification_code;

    return user;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findOne(id);

    assign(user, updateProfileDto);

    await this.userRepository.save(user);

    delete user.password;
    delete user.password_changed_at;
    delete user.password_reset_token;
    delete user.password_reset_token_expires;
    delete user.pin;
    delete user.verification_code;

    return user;
  }

  async makeAdmin(makeAdminDto: MakeAdminDto) {
    const user = await this.findByEmail(makeAdminDto.email);

    if (user.roles.includes(Role.ADMIN))
      throw new BadRequestException('user is already an admin');

    user.roles = [...user.roles, Role.ADMIN];

    await this.userRepository.save(user);

    delete user.password;
    delete user.password_changed_at;
    delete user.password_reset_token;
    delete user.password_reset_token_expires;
    delete user.pin;
    delete user.verification_code;

    return user;
  }

  async makeManager(makeAdminDto: MakeAdminDto) {
    const user = await this.findByEmail(makeAdminDto.email);

    if (user.roles.includes(Role.MANAGER))
      throw new BadRequestException('user is already a manager');

    user.roles = [...user.roles, Role.MANAGER];

    await this.userRepository.save(user);

    delete user.password;
    delete user.password_changed_at;
    delete user.password_reset_token;
    delete user.password_reset_token_expires;
    delete user.pin;
    delete user.verification_code;

    return user;
  }

  async getUserIdentity(userId: string) {
    return await this.identityService.getUserIdentity(userId, true);
  }

  async getUserBanksInfo(userId: string, query: PaginateQuery) {
    const queryBuilder = this.userBankRepository
      .createQueryBuilder('user-bank')
      .leftJoin('user-bank.user', 'user')
      .where('user.id = :id', { id: userId });

    return await paginate(query, queryBuilder, {
      sortableColumns: ['created_at'],
      nullSort: 'last',
      defaultSortBy: [['created_at', 'DESC']],
      searchableColumns: [],
      filterableColumns: {},
    });
  }

  async createUserBankInfo(
    userId: string,
    createUserBankInfoDto: CreateUserBankInfoDto,
  ) {
    const existingUserBankInfo = await this.userBankRepository.findOneBy({
      account_number: createUserBankInfoDto.account_number,
    });

    const user = await this.findOne(userId);

    if (existingUserBankInfo)
      throw new BadRequestException('bank account already exists');

    const userBankInfo = this.userBankRepository.create(createUserBankInfoDto);

    userBankInfo.user = user;

    await this.userBankRepository.save(userBankInfo);

    delete userBankInfo.user;

    return userBankInfo;
  }

  async updateUserBankInfo(
    id: string,
    updateUserBankInfoDto: UpdateUserBankInfoDto,
  ) {
    const userBankInfo = await this.userBankRepository.findOneBy({ id });

    if (!userBankInfo)
      throw new NotFoundException('bank information not found');

    assign(userBankInfo, updateUserBankInfoDto);

    await this.userBankRepository.save(userBankInfo);

    return userBankInfo;
  }

  async getUserOrders(userId: string, query: PaginateQuery) {
    return await this.orderService.getUserOrder(userId, query);
  }
}
