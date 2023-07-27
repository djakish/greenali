FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV AMQP_URL=amqp://admin:pass@rabbitmq:5672

EXPOSE 3000

CMD [ "nodemon", "index.js" ]
