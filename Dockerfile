FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV HEADLESS=true \
    CI=true

CMD ["npm", "test"]

