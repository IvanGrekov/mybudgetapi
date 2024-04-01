import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';

import NotFoundException from '../shared/exceptions/not-found.exception';
import { User } from '../shared/entities/user.entity';
import { Account } from '../shared/entities/account.entity';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { PaginationQueryDto } from '../shared/dtos/pagination.dto';
import { calculateSkipOption } from '../shared/utils/pagination.utils';

import { CreateUserDto } from './dtos/create-user.dto';
import { EditUserDto } from './dtos/edit-user.dto';
import { EditUserCurrencyDto } from './dtos/create-user-currency.dto';
import { getChildrenTransactionCategories } from './utils/getChildrenTransactionCategories.util';
import { getDefaultRelations } from './utils/getDefaultRelations.util';
import { updateRelationsCurrency } from './utils/updateRelationsCurrency.util';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(TransactionCategory)
        private readonly transactionCategoryRepository: Repository<TransactionCategory>,
        private readonly dataSource: DataSource,
    ) {}

    async findAll(query: PaginationQueryDto): Promise<User[]> {
        return this.userRepository.find({
            take: query.limit,
            skip: calculateSkipOption(query),
        });
    }

    async getNewName(): Promise<string> {
        return this.userRepository.count().then((count) => `User#${count + 1}`);
    }

    async findOne(id: User['id'], relations?: FindOptionsRelations<User>): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations,
        });

        if (!user) {
            throw new NotFoundException('User', id);
        }

        return user;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { defaultCurrency: currency, language } = createUserDto;
        const defaultRelations = getDefaultRelations({
            currency,
            language,
            createAccount: this.accountRepository.create.bind(this.accountRepository),
            createTransactionCategory: this.transactionCategoryRepository.create.bind(
                this.transactionCategoryRepository,
            ),
        });

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userTemplate = queryRunner.manager.create(User, {
                ...createUserDto,
                ...defaultRelations,
            });

            const user = await queryRunner.manager.save(User, userTemplate);

            getChildrenTransactionCategories(user.transactionCategories).forEach(({ id }) => {
                queryRunner.manager.update(TransactionCategory, id, { user });
            });

            await queryRunner.commitTransaction();

            return this.findOne(user.id);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async edit(id: User['id'], editUserDto: EditUserDto): Promise<User> {
        const user = await this.userRepository.preload({
            id,
            ...editUserDto,
        });

        if (!user) {
            throw new NotFoundException('User', id);
        }

        return this.userRepository.save(user);
    }

    async editCurrency(
        id: User['id'],
        { defaultCurrency, rate, isForceCurrencyUpdate }: EditUserCurrencyDto,
    ): Promise<User> {
        const oldUser = await this.findOne(id);
        const oldDefaultCurrency = oldUser.defaultCurrency;

        if (oldDefaultCurrency === defaultCurrency) {
            throw new BadRequestException('The new `defaultCurrency` is the same like current');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            queryRunner.manager.update(User, id, { defaultCurrency });

            updateRelationsCurrency({
                queryRunner,
                userId: id,
                isForceCurrencyUpdate,
                oldCurrency: oldDefaultCurrency,
                currency: defaultCurrency,
                rate,
            });

            await queryRunner.commitTransaction();

            return this.findOne(id);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async delete(id: User['id']): Promise<User> {
        const user = await this.findOne(id);

        return this.userRepository.remove(user);
    }
}
