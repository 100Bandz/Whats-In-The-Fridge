# ================================
# 1. Build the Vue frontend
# ================================
FROM node:20 AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/whats-in-the-fridge/package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/whats-in-the-fridge ./

# Build the Vue app
RUN npm run build


# ================================
# 2. Build the Express backend
# ================================
FROM node:20 AS backend

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY backend .

# Copy Vue build output into backend's dist folder
COPY --from=frontend-builder /app/frontend/dist ./dist

# Expose port
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=/data/sqlite/prod.db

# Create persistent data directory (for SQLite)
RUN mkdir -p /data/sqlite

# Start the app
CMD ["node", "index.js"]