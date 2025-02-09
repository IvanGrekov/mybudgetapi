import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsRelations, Repository, IsNull } from 'typeorm';

import { User } from 'shared/entities/user.entity';
import { Account } from 'shared/entities/account.entity';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { PaginatedItemsResultDto } from 'shared/dtos/paginated-items-result.dto';
import { CreateUserDto } from 'shared/dtos/create-user.dto';
import NotFoundException from 'shared/exceptions/not-found.exception';
import { getIdPointer } from 'shared/utils/idPointer.utils';
import { PaginationQueryDto } from 'shared/dtos/pagination.dto';
import { calculateSkipOption } from 'shared/utils/pagination.utils';
import { DEFAULT_CURRENCY } from 'shared/constants/currency.constants';
import { DEFAULT_LANGUAGE } from 'shared/constants/language.constants';

import { IActiveUser } from 'iam/interfaces/active-user-data.interface';

import { EditUserDto } from 'users/dtos/edit-user.dto';
import { EditUserCurrencyDto } from 'users/dtos/edit-user-currency.dto';
import { EditUserRoleDto } from 'users/dtos/edit-user-role.dto';
import { getChildrenTransactionCategories } from 'users/utils/getChildrenTransactionCategories.util';
import { getDefaultRelations } from 'users/utils/getDefaultRelations.util';
import { updateRelationsCurrency } from 'users/utils/updateRelationsCurrency.util';

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

    async getNewName(): Promise<string> {
        return this.userRepository.count().then((count) => `User${getIdPointer(count + 1)}`);
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedItemsResultDto<User>> {
        const { offset, limit } = query;

        const [items, total] = await this.userRepository.findAndCount({
            take: limit,
            skip: calculateSkipOption(query),
        });

        return {
            items,
            page: offset,
            itemsPerPage: limit,
            total,
            hasMore: total > offset * limit,
        };
    }

    async getOne(id: User['id'], relations?: FindOptionsRelations<User>): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations,
        });

        if (!user) {
            throw new NotFoundException('User', id);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { email } });

        return user || null;
    }

    async getMe(sub: IActiveUser['sub']): Promise<User> {
        return this.getOne(sub);
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const {
            defaultCurrency = DEFAULT_CURRENCY,
            language = DEFAULT_LANGUAGE,
            email,
            nickname = email,
        } = createUserDto;

        const defaultRelations = getDefaultRelations({
            currency: defaultCurrency,
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
            const userTemplate = await queryRunner.manager.create(User, {
                ...createUserDto,
                email,
                nickname,
                ...defaultRelations,
            });

            const user = await queryRunner.manager.save(User, userTemplate);

            for (const { id } of getChildrenTransactionCategories(user.transactionCategories)) {
                await queryRunner.manager.update(TransactionCategory, id, { user });
            }

            await queryRunner.commitTransaction();

            return this.getOne(user.id);
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
        userId: User['id'],
        { defaultCurrency, ...args }: EditUserCurrencyDto,
    ): Promise<User> {
        const { defaultCurrency: oldDefaultCurrency } = await this.getOne(userId);

        if (oldDefaultCurrency === defaultCurrency) {
            throw new BadRequestException('The new `defaultCurrency` is the same like current one');
        }

        const {
            isTransactionCategoriesCurrencySoftUpdate,
            isTransactionCategoriesCurrencyForceUpdate,
        } = args;

        if (
            isTransactionCategoriesCurrencySoftUpdate &&
            isTransactionCategoriesCurrencyForceUpdate
        ) {
            throw new BadRequestException(
                'Cannot provide `isTransactionCategoriesCurrencyForceUpdate` and `isTransactionCategoriesCurrencySoftUpdate` at the same time',
            );
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const getAccountsWithoutTransactions = async () =>
                this.accountRepository.find({
                    where: {
                        user: { id: userId },
                        currency: oldDefaultCurrency,
                        incomingTransactions: { id: IsNull() },
                        outgoingTransactions: { id: IsNull() },
                    },
                });

            const getTransactionCategoriesWithoutTransactions = async () => {
                const where = isTransactionCategoriesCurrencySoftUpdate
                    ? {
                          user: { id: userId },
                          currency: oldDefaultCurrency,
                          incomingTransactions: { id: IsNull() },
                          outgoingTransactions: { id: IsNull() },
                      }
                    : {
                          user: { id: userId },
                          incomingTransactions: { id: IsNull() },
                          outgoingTransactions: { id: IsNull() },
                      };

                return this.transactionCategoryRepository.find({ where });
            };

            await queryRunner.manager.update(User, userId, { defaultCurrency });

            await updateRelationsCurrency({
                queryRunner,
                currency: defaultCurrency,
                getAccountsWithoutTransactions,
                getTransactionCategoriesWithoutTransactions,
                ...args,
            });

            await queryRunner.commitTransaction();

            return this.getOne(userId);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async editRole(id: User['id'], editUserRoleDto: EditUserRoleDto): Promise<User> {
        const user = await this.userRepository.preload({
            id,
            ...editUserRoleDto,
        });

        if (!user) {
            throw new NotFoundException('User', id);
        }

        return this.userRepository.save(user);
    }

    async delete(id: User['id']): Promise<User> {
        const user = await this.getOne(id);

        return this.userRepository.remove(user);
    }
}
