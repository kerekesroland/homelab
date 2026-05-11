import { DynamicModule, Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';
import { KAFKA_GROUP_ID } from './kafka.constants';

@Module({})
export class KafkaModule {
  static register(groupId: string): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        { provide: KAFKA_GROUP_ID, useValue: groupId },
        ProducerService,
        ConsumerService,
      ],
      exports: [ProducerService, ConsumerService],
    };
  }
}
