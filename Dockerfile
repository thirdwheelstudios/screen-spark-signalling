FROM node:18-alpine
WORKDIR /usr
COPY package.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
RUN ls -a
RUN npm install
RUN npm run build

FROM node:18-alpine
WORKDIR /usr
COPY package.json ./
RUN npm install --only=production
COPY --from=0 /usr/dist .
RUN npm install pm2 -g
EXPOSE 8080
CMD ["pm2-runtime","main.js"]
