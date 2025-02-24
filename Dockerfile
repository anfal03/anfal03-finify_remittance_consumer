FROM node:18.18.0 AS development

# Create app directory
WORKDIR /nestjs_core

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install
RUN npm install webpack
#RUN npm link webpack
#RUN npm install --only=development

COPY . .

RUN npm run build


FROM gcr.io/distroless/nodejs:18
# Set working directory
# WORKDIR /nestjs_core
COPY .env ./
COPY locales ./locales
# Copy only necessary files from the build stage
COPY --from=development /nestjs_core/package*.json ./
COPY --from=development /nestjs_core/node_modules ./node_modules
COPY --from=development /nestjs_core/dist ./dist
# Expose application port
EXPOSE 3000
# Start the application
CMD ["dist/main"]

# FROM node:18.18.0 as production

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /nestjs_core

# COPY package*.json ./

# RUN npm install
# RUN npm install webpack
# #RUN npm link webpack
# #RUN npm install --only=production

# COPY . .

# COPY --from=development /nestjs_core/dist ./dist

# CMD ["node", "dist/main"]
