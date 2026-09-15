const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const fs = require('fs');
const path = require('path');

const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search
      ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, description, mediaType, mediaUrl } = req.body;

    let finalMediaUrl = mediaUrl || '';

    if (req.file) {
      finalMediaUrl = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.create({
      title,
      description,
      mediaType: mediaType || 'none',
      mediaUrl: finalMediaUrl,
      author: req.user.id,
    });

    const populatedBlog = await blog.populate('author', 'username');

    res.status(201).json({ message: 'Blog created successfully', blog: populatedBlog });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { author: req.user.id };

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      totalBlogs: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user.id });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found or you are not authorized to edit it' });
    }

    const { title, description, mediaType, mediaUrl } = req.body;

    if (req.file) {
      if (blog.mediaUrl && blog.mediaUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', blog.mediaUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      blog.mediaUrl = `/uploads/${req.file.filename}`;
    } else if (mediaUrl !== undefined) {
      if (blog.mediaUrl && blog.mediaUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', blog.mediaUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      blog.mediaUrl = mediaUrl;
    }

    if (title) blog.title = title;
    if (description) blog.description = description;
    if (mediaType) blog.mediaType = mediaType;

    await blog.save();
    const updatedBlog = await blog.populate('author', 'username email');

    res.json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user.id });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found or you are not authorized to delete it' });
    }

    if (blog.mediaUrl && blog.mediaUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', blog.mediaUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Comment.deleteMany({ blog: blog._id });

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const blogs = await Blog.find({ author: adminId }).select('_id likesCount commentsCount sharesCount');
    const blogIds = blogs.map((b) => b._id);
    const totalBlogs = blogs.length;
    const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likesCount || 0), 0);
    const totalShares = blogs.reduce((sum, blog) => sum + (blog.sharesCount || 0), 0);
    const totalComments = await Comment.countDocuments({ blog: { $in: blogIds } });

    res.json({
      totalBlogs,
      totalLikes,
      totalComments,
      totalShares,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBlogs, getMyBlogs, getBlog, createBlog, updateBlog, deleteBlog, getStats };
