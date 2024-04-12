import amqp from 'amqplib';

export async function sendMessage(queueName, operation, requestBody) {
    try {
    const connection = await amqp.connect('amqp://127.0.0.1:5672');
    const channel = await connection.createChannel();

    console.log("inside send message")
    await channel.assertQueue(queueName, { durable: false });

    const message = { operation, body: requestBody };
    const messageBuffer = Buffer.from(JSON.stringify(message));

    channel.sendToQueue(queueName, messageBuffer);

    console.log(`Sent message: ${message}`);

    setTimeout(() => {
      connection.close();
      return;
    }, 500);
  } catch (error) {
    console.error('Error:', error);
    return;
}
}

