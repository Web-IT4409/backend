FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm run seed:users && npm run dev"]