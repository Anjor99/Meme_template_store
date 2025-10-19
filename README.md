# 🎨 Meme Template Manager

A full-stack web application for managing meme templates with automated meme generation capabilities. Upload templates, define text/image zones, and use them for automated Instagram posting.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🖼️ **Template Management**: Upload and organize meme templates
- 📐 **Zone Definition**: Draw text and image zones with visual editor
- 🎨 **Text Customization**: Configure font size, color, and alignment
- 🗄️ **MongoDB Storage**: Persistent cloud database storage
- 🏷️ **Tagging System**: Categorize templates with tags
- 📊 **Usage Analytics**: Track template usage for optimization
- 🔍 **Search & Filter**: Find templates by category, tags, or name
- 📤 **Export/Import**: JSON export for backup and migration
- 🎲 **Random Selection**: API endpoint for automation
- 📱 **Responsive Design**: Works on desktop and mobile

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **HTML5 Canvas** - Zone drawing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Git** (optional) - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone or Download the Project

```bash
# If using Git
git clone <your-repo-url>
cd meme-automation

# Or download and extract ZIP
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

Edit `.env` and add:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3000
```

### 3. Frontend Setup

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Install additional packages
npm install lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
```

---

## ⚙️ Configuration

### MongoDB Atlas Setup

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Create Cluster**: Choose FREE M0 tier
3. **Create Database User**: 
   - Username: `memeapp`
   - Password: Generate secure password
4. **Network Access**: Add IP `0.0.0.0/0` (for development)
5. **Get Connection String**:
   - Click "Connect" → "Drivers"
   - Copy connection string
   - Replace `<password>` with your password
   - Add `/meme-templates` before `?`

Example:
```
mongodb+srv://memeapp:PASSWORD@cluster0.xxxxx.mongodb.net/meme-templates?retryWrites=true&w=majority
```

### Environment Variables

**Backend `.env`:**
```env
MONGODB_URI=mongodb+srv://memeapp:PASSWORD@cluster0.xxxxx.mongodb.net/meme-templates
PORT=3000
NODE_ENV=development
```

**Frontend** (optional `.env`):**
```env
REACT_APP_API_URL=http://localhost:3000/api
```

---

## 🎮 Usage

### Starting the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3001` (or 3000 if backend uses different port)

### Creating a Meme Template

1. **Upload Image**: Click "Upload Image" and select your meme template
2. **Enter Details**: 
   - Template name (e.g., "Drake Hotline Bling")
   - Category (reaction, comparison, etc.)
   - Tags (comma-separated)
3. **Draw Zones**:
   - Click "Draw Text Zone" or "Draw Image Zone"
   - Click and drag on the image to define areas
   - Configure text properties (font size, color, alignment)
4. **Save**: Click "Save Template" to store in MongoDB

### Using Templates in Automation

**Fetch Random Template:**
```bash
curl http://localhost:3000/api/templates/random
```

**Get All Templates:**
```bash
curl http://localhost:3000/api/templates
```

**Search by Tags:**
```bash
curl http://localhost:3000/api/templates/search/tags?tags=funny,viral
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Get All Templates
```http
GET /templates
Query Parameters:
  - category: string (optional)
  - search: string (optional)
  - limit: number (default: 50)
  - skip: number (default: 0)
```

#### Get Single Template
```http
GET /templates/:id
```

#### Create Template
```http
POST /templates
Content-Type: multipart/form-data

Body:
  - image: file (required)
  - name: string (required)
  - zones: JSON string (required)
  - category: string (optional)
  - tags: JSON array string (optional)
  - width: number (optional)
  - height: number (optional)
```

#### Update Template
```http
PUT /templates/:id
Content-Type: multipart/form-data
(Same body as create, all fields optional)
```

#### Delete Template
```http
DELETE /templates/:id
```

#### Get Random Template
```http
GET /templates/random
```

#### Track Usage
```http
POST /templates/:id/use
```

#### Search by Tags
```http
GET /templates/search/tags?tags=funny,viral
```

---

## 📁 Project Structure

```
meme-automation/
├── backend/
│   ├── node_modules/
│   ├── uploads/              # Uploaded images (auto-created)
│   ├── .env                  # Environment variables
│   ├── .gitignore
│   ├── server.js             # Main server file
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .gitignore
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── package-lock.json
│
└── README.md                 # This file
```

---

## 🌐 Deployment

### Backend Deployment Options

#### Option 1: Render (Recommended - FREE)

1. Create account at [Render](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Name**: meme-template-api
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**: Add `MONGODB_URI`
5. Click "Create Web Service"

#### Option 2: Railway

1. Go to [Railway.app](https://railway.app)
2. Click "Start a New Project"
3. Deploy from GitHub repo
4. Add environment variables
5. Railway will auto-deploy

#### Option 3: Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create meme-template-api

# Set environment variables
heroku config:set MONGODB_URI="your_connection_string"

# Deploy
git push heroku main
```

### Frontend Deployment Options

#### Option 1: Vercel (Recommended - FREE)

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Framework Preset: Create React App
4. Root Directory: `frontend`
5. Environment Variables:
   - `REACT_APP_API_URL`: Your deployed backend URL
6. Deploy

#### Option 2: Netlify

1. Go to [Netlify](https://netlify.com)
2. "Add new site" → "Import existing project"
3. Choose your repo
4. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. Environment variables: Add `REACT_APP_API_URL`
6. Deploy

#### Option 3: GitHub Pages

```bash
cd frontend

# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"homepage": "https://yourusername.github.io/meme-automation"
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

### Update Frontend API URL

After deploying backend, update `src/App.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend.render.com/api';
```

---

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string in `.env`
- Ensure password doesn't have special characters

**Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**File Upload Errors:**
- Check `uploads/` folder exists
- Verify folder permissions: `chmod 755 uploads/`

### Frontend Issues

**Module Not Found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**CORS Errors:**
- Ensure backend CORS is enabled
- Check API_URL is correct
- Backend must be running

**Tailwind Not Working:**
```bash
npm uninstall tailwindcss
npm install -D tailwindcss@3 postcss autoprefixer
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Anjor99](https://github.com/Anjor99)
- Email: anjorrane112003@gmail.com

---

## 🙏 Acknowledgments

- MongoDB Atlas for free cloud database
- Vercel/Render for free hosting
- React and Express.js communities
- All contributors and users

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: anjorrane112003@gmail.com

---

## 🔮 Roadmap

- [ ] Bulk template upload
- [ ] Template preview before saving
- [ ] Duplicate template feature
- [ ] Advanced text styling (bold, italic, stroke)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Template marketplace
- [ ] AI-powered zone detection
- [ ] Direct Instagram integration
- [ ] Template analytics dashboard

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/Anjor99/Meme_template_store?style=social)
![GitHub forks](https://img.shields.io/github/forks/Anjor99/Meme_template_store?style=social)
![GitHub issues](https://img.shields.io/github/issues/Anjor99/Meme_template_store)

---

**Made with ❤️ for meme creators everywhere**