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
- ☁️ **Cloudinary Integration**: Store photos in cloud without data loss
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
- **Cloudinary** - Cloud image storage and CDN
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **HTML5 Canvas** - Zone drawing

### Deployment
- **Render** - Backend and frontend hosting
- **MongoDB Atlas** - Cloud database
- **Cloudinary** - Image CDN and storage

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Git** (optional) - [Download](https://git-scm.com/)
- **Cloudinary Account** - [Sign up free](https://cloudinary.com/)

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

### Cloudinary Setup

1. **Create Account**: Go to [Cloudinary](https://cloudinary.com/) and sign up for free

2. **Get API Credentials**:
   - Go to Dashboard
   - Copy your `Cloud Name`, `API Key`, and `API Secret`

3. **Configure Upload Preset** (Optional):
   - Go to Settings → Upload
   - Create unsigned upload preset for direct uploads

### Environment Variables

**Backend `.env`:**
```env
MONGODB_URI=mongodb+srv://memeapp:PASSWORD@cluster0.xxxxx.mongodb.net/meme-templates
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
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
meme-template-store/
├── backend/
│   ├── node_modules/
│   ├── server.js            # Main server file (everything in one file)
│   ├── .env                 # Environment variables
│   ├── .gitignore
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

### Backend Deployment on Render

#### Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

#### Configure Backend Service
- **Name**: `meme-template-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your preferred branch)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

#### Environment Variables
```env
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
PORT=10000
```

### Frontend Deployment on Render

#### Create Static Site
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository

#### Configure Frontend Service
- **Name**: `meme-template-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `frontend/build`

#### Environment Variables
```env
REACT_APP_API_URL=https://meme-template-backend.onrender.com/api
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

![GitHub stars](https://img.shields.io/github/stars/Anjor99/Meme_template_store)
![GitHub forks](https://img.shields.io/github/forks/Anjor99/Meme_template_store)
![GitHub issues](https://img.shields.io/github/issues/Anjor99/Meme_template_store)

---

**Made with ❤️ for meme creators everywhere**