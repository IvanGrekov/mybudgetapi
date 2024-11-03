import { repl } from '@nestjs/core';

import { AppModule } from 'app.module';

async function bootstrap() {
    await repl(AppModule);
}
bootstrap();

// NOTE: Samples:
// await get("UserRepository").find()
// await get("UserRepository").update({ id: 69 }, { nickname: 'cosonic' })
