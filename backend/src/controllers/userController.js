const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


exports.getUserProfile = async (req, res, next) => { 
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
}

exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { email, address, phone_no, company_name, brand, state, country, socialMedia_url } = req.body;

        if (!email || !address || !phone_no || !state || !country) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        if (user.account_type === "organization") {
            if (!company_name || !socialMedia_url) {
                return res.status(400).json({ message: "Company name, brand, and social media URL are required for organization accounts" });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { ...req.body },
            { new: true }
        );
            res.status(200).json({ user: updatedUser });
        } catch (error) {
            next(error);
        }
    }
exports.deleteUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({
            sucess: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

exports.logout = async (req, res, next) => { 
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
}

exports.changePassword = async (req, res, next) => { 
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new passwords are required" });
        }
        if (currentPassword != user.password) { 
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
}