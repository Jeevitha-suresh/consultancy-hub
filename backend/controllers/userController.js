const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name profilePicture headline')
      .populate('connectionRequests', 'name profilePicture headline');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.headline = req.body.headline || user.headline;
      user.bio = req.body.bio || user.bio;
      user.location = req.body.location || user.location;
      user.skills = req.body.skills ? req.body.skills.split(',').map(s => s.trim()) : user.skills;
      
      // We will handle education and experience updates separately or here if simple arrays
      if (req.body.education) user.education = req.body.education;
      if (req.body.experience) user.experience = req.body.experience;

      if (req.files?.profilePicture?.[0]) {
        user.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
      }
      if (req.files?.resume?.[0]) {
        user.resume = `/uploads/${req.files.resume[0].filename}`;
      }

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        headline: updatedUser.headline,
        bio: updatedUser.bio,
        location: updatedUser.location,
        skills: updatedUser.skills,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users for search
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('name profilePicture headline');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
