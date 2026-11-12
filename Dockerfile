FROM node:26.13.1
WORKDIR /artbot
COPY . /artbot
RUN npm ci
RUN npm run build
CMD ["npm", "start"]
