import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/auth.guard';
import { GatewayThrottlerModule } from './throttler/throttler.module';
import { ThrottlerBehindProxyGuard } from './throttler/throttler-behind-proxy.guard';
import { ProxyModule } from './proxy/proxy.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import gatewayConfig from './config/gateway.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [gatewayConfig] }),
    AuthModule,
    GatewayThrottlerModule,
    ProxyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
