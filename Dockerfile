FROM node:14-alpine AS development

# Create app directory
WORKDIR /nestjs_core

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install
RUN npm install webpack
RUN npm link webpack
#RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:14-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /nestjs_core

COPY package*.json ./

RUN npm install
RUN npm install webpack
RUN npm link webpack
#RUN npm install --only=production

COPY . .

COPY --from=development /nestjs_core/dist ./dist

CMD ["node", "dist/main"]
