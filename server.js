const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sharing-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Post model
const Post = require('./models/Post');

// Routes
app.get('/', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('index', { sharedContent: posts });
});

app.post('/share', async (req, res) => {
    const content = req.body.content;
    if (content) {
        const newPost = new Post({ content });
        await newPost.save();
    }
    res.redirect('/');
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send('File uploaded successfully!');
    } else {
        res.status(400).send('No file uploaded.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});