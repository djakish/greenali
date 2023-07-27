FROM node:latest

WORKDIR /usr/src/worker

COPY package*.json ./

RUN npm install

COPY . .

ENV AMQP_URL=amqp://admin:pass@rabbitmq:5672

CMD [ "nodemon", "index.js" ]
