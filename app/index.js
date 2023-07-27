const express = require('express');
const app = express();
const amqp = require('amqplib/callback_api');

const QUEUE_NAME = 'tasks';
const REPLY_QUEUE = 'results';
const amqpUrl = process.env.AMQP_URL || 'amqp://guest:guest@rabbitmq:5672';

app.get('/process', async (req, res) => {
  const task = { input: req.query.input };
  // Connect to ampq
  amqp.connect(amqpUrl, (error, connection) => {
    if (error) {
      console.error('Error connecting to RabbitMQ:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log('Connected to RabbitMQ');

    // Creating channel for rabbitmq 
    connection.createChannel((error, channel) => {
      if (error) {
        console.error('Error creating RabbitMQ channel:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log('Created RabbitMQ channel');
      channel.assertQueue(REPLY_QUEUE, { exclusive: false }, (error, q) => {
        if (error) {
          console.error('Error asserting reply queue:', error.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        let correlationId = generateCorrelationId();

        console.log(q.queue);

        channel.consume(q.queue, function (message) {
          if (message.properties.correlationId === correlationId) {
            const result = JSON.parse(message.content.toString());
            console.log('Result received from M2:', result);
            setTimeout(function () {
              connection.close();
            }, 500);
            return res.json({ result: result.result });
          }
        }, {
          noAck: true
        });

        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(task)), {
          correlationId,
          replyTo: q.queue,
        });

        console.log('Task sent to RabbitMQ:', task);
      });
    });
  });
});

app.listen(3000, () => {
  console.log('M1 microservice listening on port 3000');
});


function generateCorrelationId() {
  return (
    Math.random().toString(36).substring(2) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2)
  );
}