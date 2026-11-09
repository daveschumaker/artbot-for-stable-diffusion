FROM node:24
WORKDIR /artbot
COPY . /artbot
RUN npm ci
RUN npx next build
CMD ["npm", "start"]
