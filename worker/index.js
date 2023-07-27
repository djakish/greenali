const amqp = require('amqplib/callback_api');
const translit = require('./translit');

const QUEUE_NAME = 'tasks';
const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';

setTimeout(function () {
  connection.close();
}, 30000);

amqp.connect(amqpUrl, (error, connection) => {
  if (error) {
    console.error('Error connecting to RabbitMQ:', error.message);
    process.exit(1);
  }
  console.log('Connected to RabbitMQ');

  connection.createChannel((error, channel) => {
    if (error) {
      console.error('Error creating RabbitMQ channel:', error.message);
      process.exit(1);
    }
    console.log('Created RabbitMQ channel');

    channel.assertQueue(QUEUE_NAME, { durable: false });
    console.log('M2 microservice waiting for tasks...');

    // Consume messages from the queue
    channel.consume(QUEUE_NAME, (message) => {
      const task = JSON.parse(message.content.toString());
      console.log('Task received:', task);

      // Transliterating to latin
      const result = { result: translit.transliterate(task["input"]) };

      // Publish to queue
      channel.sendToQueue(message.properties.replyTo, Buffer.from(JSON.stringify(result)), {
        correlationId: message.properties.correlationId,
      });

      channel.ack(message);
      console.log('Task processed and result sent:', result);
    });
  });
});