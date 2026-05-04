const { Post, User, Notification, PostLike, Comment } = require('../models_sql');

// @desc    Create a post
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let image = null;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create({
      authorId: req.user.id,
      content,
      image
    });

    const populatedPost = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['name', 'profilePicture', 'headline'] }]
    });
    
    res.status(201).json({ ...populatedPost.toJSON(), _id: populatedPost.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, as: 'author', attributes: ['name', 'profilePicture', 'headline'] },
        { 
          model: Comment, 
          include: [{ model: User, attributes: ['name', 'profilePicture'] }] 
        },
        { model: User, as: 'likes', attributes: ['id'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Map for frontend compatibility
    const mapped = posts.map(p => {
      const pJson = p.toJSON();
      return {
        ...pJson,
        _id: p.id,
        author: { ...pJson.author, _id: pJson.authorId },
        likes: pJson.likes.map(l => l.id),
        comments: pJson.Comments.map(c => ({
          _id: c.id,
          user: { ...c.User, _id: c.userId },
          text: c.text,
          createdAt: c.createdAt
        }))
      };
    });
    
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const like = await PostLike.findOne({
      where: { PostId: post.id, UserId: req.user.id }
    });

    if (!like) {
      await PostLike.create({ PostId: post.id, UserId: req.user.id });
      // Notify author
      if (post.authorId !== req.user.id) {
        await Notification.create({
          recipientId: post.authorId,
          type: 'Like',
          relatedUserId: req.user.id
          // Note: MySQL Notification model might need a relatedPostId column if you want to link it
        });
      }
    } else {
      await like.destroy();
    }

    const updatedPost = await Post.findByPk(req.params.id, {
      include: [{ model: User, as: 'likes', attributes: ['id'] }]
    });
    
    res.json(updatedPost.likes.map(l => l.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await Comment.create({
      postId: post.id,
      userId: req.user.id,
      text
    });

    // Notify author
    if (post.authorId !== req.user.id) {
      await Notification.create({
        recipientId: post.authorId,
        type: 'Comment',
        relatedUserId: req.user.id
      });
    }

    const comments = await Comment.findAll({
      where: { postId: post.id },
      include: [{ model: User, attributes: ['name', 'profilePicture'] }],
      order: [['createdAt', 'DESC']]
    });
    
    const mapped = comments.map(c => ({
      _id: c.id,
      user: { ...c.User.toJSON(), _id: c.userId },
      text: c.text,
      createdAt: c.createdAt
    }));
    
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.destroy();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
