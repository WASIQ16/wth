const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../config/cloudinaryConfig');
const { check, validationResult } = require('express-validator');
const { sendPasswordResetEmail } = require('../config/sendGridService');

// @route   POST api/auth/signup
// @desc    Register user
router.post('/signup', [
    check('fullName', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    console.log('📝 Signup Request Received:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('❌ Signup Validation Errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('❌ Signup Failed: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ fullName, email, password });
        await user.save();
        console.log('✅ User saved successfully:', user.email);

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                console.error('❌ JWT Signing Error:', err);
                throw err;
            }
            console.log('✅ Signup Successful, Token generated');
            res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
        });

    } catch (err) {
        console.error('💥 Signup Server Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    console.log('🔑 Login Request Received:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('❌ Login Validation Errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            console.log('❌ Login Failed: Invalid Credentials (Email not found)');
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('❌ Login Failed: Invalid Credentials (Password mismatch)');
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                console.error('❌ JWT Signing Error:', err);
                throw err;
            }
            console.log('✅ Login Successful, Token generated');
            res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
        });

    } catch (err) {
        console.error('💥 Login Server Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/auth/user
// @desc    Get user profile
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error('💥 Get Profile Error:', err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/reset-password', [
    auth,
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    console.log('🔐 Reset Password Request for User:', req.user.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            console.log('❌ Reset Password Failed: Incorrect current password');
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        console.log('✅ Password Reset Successful for:', user.email);
        res.json({ message: 'Password reset successfully' });

    } catch (err) {
        console.error('💥 Reset Password Server Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/update-profile
// @desc    Update user profile (fullName)
router.put('/update-profile', [
    auth,
    check('fullName', 'Name is required').not().isEmpty()
], async (req, res) => {
    console.log('👤 Update Profile Request for User:', req.user.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullName } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.fullName = fullName;
        await user.save();

        console.log('✅ Profile Update Successful for:', user.email);
        res.json({ message: 'Profile updated successfully', user: { id: user.id, fullName: user.fullName, email: user.email } });

    } catch (err) {
        console.error('💥 Update Profile Server Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/upload-avatar
// @desc    Upload user avatar to Cloudinary
router.post('/upload-avatar', auth, (req, res, next) => {
    console.log('🔍 Upload Avatar - Auth passed, starting multer...');
    upload.single('avatar')(req, res, (err) => {
        if (err) {
            console.error('💥 Multer Error:', err.message);
            console.error('💥 Multer Error Stack:', err.stack);
            console.error('💥 Multer Error Code:', err.code);
            return res.status(400).json({
                message: 'File upload error',
                error: err.message,
                code: err.code
            });
        }
        console.log('✅ Multer processing complete');
        console.log('📎 File received:', req.file ? 'Yes' : 'No');
        if (req.file) {
            console.log('📎 File details:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        }
        next();
    });
}, async (req, res, next) => {
    console.log('🖼️  Avatar Upload Request for User:', req.user.id);

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profileImage = req.file.path; // Cloudinary URL
        await user.save();

        console.log('✅ Avatar Upload Successful for:', user.email);
        res.json({
            message: 'Avatar uploaded successfully',
            profileImage: user.profileImage
        });

    } catch (err) {
        console.error('💥 Avatar Upload Server Error:', err.message);
        next(err);
    }
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset
router.post('/forgot-password', [
    check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    console.log('🔑 Forgot Password Request for:', req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        // Always return success message for security (don't reveal if email exists)
        if (!user) {
            console.log('⚠️  Email not found, but returning success for security');
            return res.json({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before saving to database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token and expiration to user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email with plain token
        try {
            await sendPasswordResetEmail(email, resetToken);
            console.log('✅ Password reset email sent to:', email);
        } catch (emailError) {
            console.error('❌ Failed to send email:', emailError);
            // Clear the reset token if email fails
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            return res.status(500).json({
                message: 'Failed to send reset email. Please try again later.'
            });
        }

        res.json({
            message: 'If an account with that email exists, a password reset link has been sent.',
            // In development, also return the token for testing
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });

    } catch (err) {
        console.error('💥 Forgot Password Server Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/verify-reset-token
// @desc    Verify if reset token is valid
router.post('/verify-reset-token', [
    check('token', 'Token is required').not().isEmpty()
], async (req, res) => {
    console.log('🔍 Verifying Reset Token');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    try {
        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('❌ Invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        console.log('✅ Token is valid');
        res.json({ message: 'Token is valid', valid: true });

    } catch (err) {
        console.error('💥 Verify Token Server Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/reset-password
// @desc    Reset password with token
router.post('/reset-password', [
    check('token', 'Token is required').not().isEmpty(),
    check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    console.log('🔐 Reset Password with Token');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    try {
        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('❌ Invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        console.log('✅ Password reset successful for:', user.email);
        res.json({ message: 'Password has been reset successfully' });

    } catch (err) {
        console.error('💥 Reset Password Server Error:', err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
