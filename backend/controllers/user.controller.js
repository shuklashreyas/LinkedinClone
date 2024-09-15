import e from "express";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getSuggestedConnections = async (req, res) => {

    try {
        const currentUser = await User.findById(req.user._id).select("connections");
        const suggestedUsers = await User.find({ 
            _id: { $nin: currentUser.connections } }).select("name username email profilePic").limit(3);
        res.json(suggestedUsers);
    } 
    catch (error) {
        console.error("error in getSuggestedConnections", error.message);
        res.status(500).json({ message: "internal server error" });
    }
}

export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        res.json(user);
    } 
    catch (error) {
        console.error("error in getPublicProfile", error.message);
        res.status(500).json({ message: "internal server error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const allowedFields = ["name", "username", "headline", "about", "location", "profilePicture", "bannerImg", "skills", "experience", "education"];
        const updatedData = {};
        for (const field of allowedFields) {
            if (req.body[field]) {
                updatedData[field] = req.body[field];
            }
        }

        if (req.body[fields]) {
            const results = cloudinary.uploader.upload(req.body.profilePicture);
            updatedData.profilePicture = results.secure_url;
        }

        if (req.body.bannerImg) {
            const results = cloudinary.uploader.upload(req.body.bannerImg);
            updatedData.profilePicture = results.secure_url;
        }

        const user = await User.findByIdAndUpdate(req.user._id, { $set: updatedData }, { new: true }).select("-password");
        res.json(user);
    }
    catch (error) {
        console.error("error in updateProfile", error.message);
        res.status(500).json({ message: "internal server error" });
    }
}