const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username avatarUrl');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Could not load posts.', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content cannot be empty.' });
    }

    const author = await User.findById(req.user.id);
    if (!author) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const post = await Post.create({ author: author._id, content: content.trim() });
    await post.populate('author', 'username avatarUrl');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Could not create post.', error: error.message });
  }
});

router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    post.likes += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Could not like post.', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts.' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete post.', error: error.message });
  }
});

module.exports = router;
