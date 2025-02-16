import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { TRepositoryMock } from 'test/mock.types';

import { User } from 'shared/entities/user.entity';
import { Account } from 'shared/entities/account.entity';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';

import NotFoundException from 'shared/exceptions/not-found.exception';

import { getIdPointer } from 'shared/utils/idPointer.utils';

import { UsersService } from 'users/users.service';

const createUserRepositoryMock = <T>(): TRepositoryMock<T> => ({
    count: jest.fn(),
    findOne: jest.fn(),
});

describe('UsersService', () => {
    let service: UsersService;
    let userRepositoryMock: TRepositoryMock<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: DataSource, useValue: {} },
                {
                    provide: getRepositoryToken(User),
                    useValue: createUserRepositoryMock(),
                },
                {
                    provide: getRepositoryToken(Account),
                    useValue: createUserRepositoryMock(),
                },
                {
                    provide: getRepositoryToken(TransactionCategory),
                    useValue: createUserRepositoryMock(),
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepositoryMock = module.get<TRepositoryMock<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getNewName', () => {
        describe('when there are no users', () => {
            it('return a new user name', async () => {
                userRepositoryMock.count.mockResolvedValue(0);

                const name = await service.getNewName();
                expect(name).toBe('User#1');
            });
        });

        describe('when there are users', () => {
            it('return a new user name', async () => {
                userRepositoryMock.count.mockResolvedValue(2);

                const name = await service.getNewName();
                expect(name).toBe('User#3');
            });
        });
    });

    describe('getOne', () => {
        describe('when user exists', () => {
            it('return user', async () => {
                const expectedUser = { id: 1 };

                userRepositoryMock.findOne.mockResolvedValue(expectedUser);

                const user = await service.getOne(1);
                expect(user).toEqual(expectedUser);
            });
        });

        describe('when user does not exist', () => {
            it('throw NotFoundException', async () => {
                userRepositoryMock.findOne.mockResolvedValue(null);

                await expect(service.getOne(1)).rejects.toThrow(NotFoundException);
            });

            it('throw correct error message', async () => {
                userRepositoryMock.findOne.mockResolvedValue(null);

                await expect(service.getOne(1)).rejects.toThrow(
                    `User ${getIdPointer(1)} not found`,
                );
            });
        });
    });
});
