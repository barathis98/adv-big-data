import amqp from 'amqplib';
import { deleteDocument, save } from './elasticFunctions.js';

export async function startQueueListener() {
  try {
    const queueName = 'Hello';
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });

    console.log(`Queue listener started. Waiting for messages in ${queueName}...`);

    channel.consume(queueName, async (message) => {
      if (message !== null) {
        const content = message.content.toString();
        console.log(`Received message: ${content}`);
        const JSONcontent = JSON.parse(content);
        switch (JSONcontent.operation) {
          case 'POST':
            console.log('POST operation');
            await save('insurance', JSONcontent.body);
            break;
          case 'PATCH':
            console.log('PATCH operation');
            break;
          case 'DELETE':
            console.log('DELETE operation');
            await deleteDocument('insurance', JSONcontent.body);
            break;
        }


        channel.ack(message); 
      }
    });

  } catch (error) {
    console.error('Error starting queue listener:', error);
  }
}

