FROM node:18.16.0
WORKDIR /artbot
COPY . /artbot
RUN npm install
CMD ["npm", "start"]
