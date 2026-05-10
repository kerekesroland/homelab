import { DynamicModule, Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';

@Module({})
export class KafkaModule {
  static register(groupId: string): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_GROUP_ID',
          useValue: groupId,
        },
        ProducerService,
        ConsumerService,
      ],
      exports: [ProducerService, ConsumerService],
    };
  }
}
