FROM node:18.15.0

ARG NODE_ENV
ARG BUILD_FLAG

WORKDIR /app
COPY . .
RUN npm i -f
EXPOSE 3002

CMD ["node", "./main.js"]