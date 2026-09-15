const express = require('express');
const router = express.Router();
const {
  toggleLike,
  addComment,
  getComments,
  trackShare,
} = require('../controllers/interactionController');

router.post('/:id/like', toggleLike);
router.post('/:id/comment', addComment);
router.get('/:id/comments', getComments);
router.post('/:id/share', trackShare);

module.exports = router;
