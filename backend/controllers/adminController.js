const User = require('../models/User');
const Post = require('../models/Post');
const Job = require('../models/Job');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Post.deleteMany({ author: req.params.id });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post (Admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a recruiter account (Admin only)
// @route   POST /api/admin/recruiters
// @access  Private/Admin
exports.createRecruiter = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const recruiter = await User.create({
      name,
      email,
      password,
      role: 'Recruiter',
      mustChangePassword: true  // Force password change on first login
    });

    res.status(201).json({
      _id: recruiter._id,
      name: recruiter.name,
      email: recruiter.email,
      role: recruiter.role,
      mustChangePassword: recruiter.mustChangePassword,
      createdAt: recruiter.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all recruiters (Admin only)
// @route   GET /api/admin/recruiters
// @access  Private/Admin
exports.getRecruiters = async (req, res) => {
  try {
    const recruiters = await User.find({ role: 'Recruiter' }).select('-password');
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset recruiter password (Admin only)
// @route   PUT /api/admin/recruiter/:id/reset-password
// @access  Private/Admin
exports.resetRecruiterPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const recruiter = await User.findById(req.params.id);

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    if (recruiter.role !== 'Recruiter') {
      return res.status(403).json({ message: 'Target user is not a Recruiter' });
    }

    recruiter.password = newPassword;
    recruiter.mustChangePassword = true; // Force recruiter to change on next login
    await recruiter.save();

    res.json({ message: `Password reset successfully for ${recruiter.name}. They must change it on next login.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin changes own password
// @route   PUT /api/admin/change-password
// @access  Private/Admin
exports.adminChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const admin = await User.findById(req.user.id).select('+password');

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Admin password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
