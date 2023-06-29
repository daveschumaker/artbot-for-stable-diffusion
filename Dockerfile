FROM node:18.16.0
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]


#docker run -p  8888:3000 nextjs-app

#docker build -t nextjs-app .