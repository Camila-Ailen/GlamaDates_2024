## Use the official Node.js image as the base image
#FROM node:22 AS fma-frontend
#
## Set the working directory inside the container
#WORKDIR /usr/src/app
#
## Copy package.json and package-lock.json to the working directory
#COPY package*.json ./
#
## Install the application dependencies
#RUN npm install
#
## Copy the rest of the application files
## Disable for now, as we are using a volume to mount the source code
## COPY . .
#
## Build the NextJS application
## RUN npm run build
#
## Expose the application port
#EXPOSE 3000
#
## Command to run the application
#CMD ["npm", "run", "dev"]

FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package.json ./
RUN npm i

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Run the app
FROM base AS fma-frontend
WORKDIR /app
ENV NODE_ENV=development
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs --ingroup nodejs
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
# CMD HOSTNAME="0.0.0.0" node server.js
CMD npm run dev