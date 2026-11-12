FROM node:24
WORKDIR /artbot
COPY . /artbot
RUN npm ci
RUN npm run build
CMD ["npm", "start"]
