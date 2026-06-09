#!/bin/bash

# Smart Maize Insights - Setup Script for macOS/Linux

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Smart Maize Insights - Setup Script                      ║"
echo "║  AI-Powered Maize Disease Detection Platform              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    echo "   macOS: brew install node"
    echo "   Linux: sudo apt-get install nodejs npm"
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found in PATH"
    echo "   macOS: brew install mysql"
    echo "   Linux: sudo apt-get install mysql-server"
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Step 1: Install dependencies
echo "[1/3] Installing project dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install project dependencies"
    exit 1
fi
echo "✅ Project dependencies installed"
echo ""

# Step 2: Create environment files
echo "[2/3] Creating environment configuration files..."

if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=maize_detection_systemai
DB_PORT=3306

NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=maze_detection_secret_key_development
PORT=3000
EOF
    echo "✅ Created .env.local"
else
    echo "✓ .env.local already exists"
fi
echo ""

# Step 3: Initialize database
echo "[3/3] Initializing database..."
echo ""
echo "⚠️  Make sure MySQL Server is running!"
echo "   macOS: brew services start mysql"
echo "   Linux: sudo service mysql start"
echo ""
read -p "Press Enter to continue..."

if [ -f "scripts/init-db.mjs" ]; then
    echo "Attempting to initialize database..."
    npm run db:init
else
    echo ""
    echo "📝 To initialize database manually:"
    echo "   1. Ensure MySQL is running"
    echo "   2. Run: mysql -u root -p < database/schema.sql"
    echo "   3. Leave password blank if not set"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete! ✅                                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   $ npm run dev"
echo "   App runs on http://localhost:3000"
echo ""
echo "🌐 Access the app: http://localhost:3000"
echo ""
echo "📚 See SETUP_GUIDE.md for more information"
echo ""
