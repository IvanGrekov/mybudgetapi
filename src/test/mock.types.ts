import { Repository } from 'typeorm';

export type TRepositoryMock<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;
