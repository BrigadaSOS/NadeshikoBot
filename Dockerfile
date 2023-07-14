FROM node:slim AS server
WORKDIR /app
COPY . .
RUN npm install --production

CMD [ "npm", "run", "start" ]
