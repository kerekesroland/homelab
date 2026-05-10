import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  Consumer,
  ConsumerSubscribeTopics,
  EachMessagePayload,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka: Kafka;
  private consumer: Consumer;
  private handlers: ((payload: EachMessagePayload) => Promise<void>)[] = [];

  constructor(@Inject('KAFKA_GROUP_ID') private readonly groupId: string) {
    this.kafka = new Kafka({
      brokers: ['localhost:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
  }

  async onModuleInit() {
    await this.consumer.connect();

    await this.consumer.run({
      eachMessage: async (payload) => {
        for (const handler of this.handlers) {
          try {
            await handler(payload);
          } catch (error) {
            console.error(`Kafka error [${payload.topic}]`, error);
          }
        }
      },
    });
  }

  async consume(
    topics: ConsumerSubscribeTopics,
    onMessage: (payload: EachMessagePayload) => Promise<void>,
  ) {
    await this.consumer.subscribe(topics);

    this.handlers.push(onMessage);
  }

  async onApplicationShutdown() {
    await this.consumer.disconnect();
  }
}
