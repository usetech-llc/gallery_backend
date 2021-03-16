FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install typescript -g
RUN npm install
RUN npm run build
COPY . .
EXPOSE 3003
CMD [ "npm", "start" ]
