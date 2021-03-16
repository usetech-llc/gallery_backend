FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json .
RUN npm install typescript -g
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3003
CMD [ "npm", "start" ]
