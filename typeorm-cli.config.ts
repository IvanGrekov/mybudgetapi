import { UserRefactor1707651913889 } from 'src/migrations/1707651913889-UserRefactor';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'Cosonic56',
  entities: [],
  migrations: [UserRefactor1707651913889],
});
