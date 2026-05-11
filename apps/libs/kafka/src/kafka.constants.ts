export const KAFKA_GROUP_ID = 'KAFKA_GROUP_ID';
export const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') ?? [
  'localhost:9092',
];
