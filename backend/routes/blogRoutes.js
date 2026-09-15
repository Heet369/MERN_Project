const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getMyBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getStats,
} = require('../controllers/blogController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBlogs);
router.get('/admin/my-blogs', verifyToken, getMyBlogs);
router.get('/stats/overview', verifyToken, getStats);
router.post('/', verifyToken, upload.single('media'), createBlog);
router.put('/:id', verifyToken, upload.single('media'), updateBlog);
router.delete('/:id', verifyToken, deleteBlog);
router.get('/:id', getBlog);

module.exports = router;
