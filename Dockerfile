FROM node:18

RUN npm i -g pnpm

RUN mkdir app

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm i

COPY . .

RUN pnpm build

CMD ["pnpm", "start"]
