FROM node:latest

# Instalação do jq
RUN apt update && apt install jq -y

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install

COPY server.js /app/
COPY public /app/public

CMD ["npm", "run", "dev"]
