// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// MongoDB Schema
const zoneSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image'],
    required: true
  },
  x: { type: Number, required: true, min: 0, max: 1 },
  y: { type: Number, required: true, min: 0, max: 1 },
  width: { type: Number, required: true, min: 0, max: 1 },
  height: { type: Number, required: true, min: 0, max: 1 },
  fontSize: { type: Number, default: 32 },
  fontColor: { type: String, default: '#ffffff' },
  textAlign: { 
    type: String, 
    enum: ['left', 'center', 'right'], 
    default: 'center' 
  },
  verticalAlign: { 
    type: String, 
    enum: ['top', 'middle', 'bottom'], 
    default: 'middle' 
  },
  zIndex: { type: Number, default: 0 }
}, { _id: false });

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageFilename: {
    type: String,
    required: true
  },
  width: Number,
  height: Number,
  zones: [zoneSchema],
  tags: [String],
  category: String,
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const MemeTemplate = mongoose.model('MemeTemplate', templateSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'template-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// API Routes

// Get all templates
app.get('/api/templates', async (req, res) => {
  try {
    const { category, search, limit = 50, skip = 0 } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const templates = await MemeTemplate.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await MemeTemplate.countDocuments(query);
    
    res.json({
      success: true,
      data: templates,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single template by ID
app.get('/api/templates/:id', async (req, res) => {
  try {
    const template = await MemeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new template
app.post('/api/templates', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const { name, zones, tags, category, width, height } = req.body;
    
    // Parse zones if it's a string
    const parsedZones = typeof zones === 'string' ? JSON.parse(zones) : zones;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    const template = new MemeTemplate({
      name,
      imageUrl: `/uploads/${req.file.filename}`,
      imageFilename: req.file.filename,
      width: parseInt(width) || null,
      height: parseInt(height) || null,
      zones: parsedZones || [],
      tags: parsedTags || [],
      category: category || 'general'
    });

    await template.save();
    
    res.status(201).json({ 
      success: true, 
      data: template,
      message: 'Template created successfully' 
    });
  } catch (error) {
    // Delete uploaded file if template creation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update template
app.put('/api/templates/:id', upload.single('image'), async (req, res) => {
  try {
    const template = await MemeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const { name, zones, tags, category, width, height } = req.body;

    // Update fields
    if (name) template.name = name;
    if (category) template.category = category;
    if (width) template.width = parseInt(width);
    if (height) template.height = parseInt(height);
    if (zones) template.zones = typeof zones === 'string' ? JSON.parse(zones) : zones;
    if (tags) template.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    // If new image uploaded, delete old one and update
    if (req.file) {
      const oldImagePath = path.join(__dirname, 'uploads', template.imageFilename);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      template.imageUrl = `/uploads/${req.file.filename}`;
      template.imageFilename = req.file.filename;
    }

    await template.save();

    res.json({ 
      success: true, 
      data: template,
      message: 'Template updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete template
app.delete('/api/templates/:id', async (req, res) => {
  try {
    const template = await MemeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Delete image file
    const imagePath = path.join(__dirname, 'uploads', template.imageFilename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await template.deleteOne();

    res.json({ 
      success: true, 
      message: 'Template deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add/Update zones for a template
app.post('/api/templates/:id/zones', async (req, res) => {
  try {
    const template = await MemeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const { zones } = req.body;
    template.zones = zones;
    await template.save();

    res.json({ 
      success: true, 
      data: template,
      message: 'Zones updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Increment usage count (for analytics)
app.post('/api/templates/:id/use', async (req, res) => {
  try {
    const template = await MemeTemplate.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get templates by category
app.get('/api/templates/category/:category', async (req, res) => {
  try {
    const templates = await MemeTemplate.find({ 
      category: req.params.category 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search templates by tags
app.get('/api/templates/search/tags', async (req, res) => {
  try {
    const { tags } = req.query;
    const tagArray = tags.split(',').map(tag => tag.trim());
    
    const templates = await MemeTemplate.find({
      tags: { $in: tagArray }
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get random template (useful for automation)
app.get('/api/templates/random', async (req, res) => {
  try {
    const count = await MemeTemplate.countDocuments();
    const random = Math.floor(Math.random() * count);
    const template = await MemeTemplate.findOne().skip(random);
    
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Meme Template API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

module.exports = app;