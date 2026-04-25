import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'ip',
            ttl: config.get<number>('THROTTLE_IP_TTL') ?? 60000,
            limit: config.get<number>('THROTTLE_IP_LIMIT') ?? 100,
          },
          {
            name: 'user',
            ttl: config.get<number>('THROTTLE_USER_TTL') ?? 60000,
            limit: config.get<number>('THROTTLE_USER_LIMIT') ?? 500,
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ThrottlerModule],
})
export class GatewayThrottlerModule {}
