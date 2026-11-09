FROM node:24
WORKDIR /artbot
COPY . /artbot
RUN npm install
CMD ["npm", "start"]
