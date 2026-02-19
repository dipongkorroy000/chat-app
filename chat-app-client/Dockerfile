FROM node:20-alpine

WORKDIR /app

# pnpm globally install
RUN npm install -g pnpm

# dependency files copy
COPY package.json pnpm-lock.yaml ./

# install dependencies inside container
RUN pnpm install --frozen-lockfile

# copy source code
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
