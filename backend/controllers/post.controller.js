import {cloudinary} from "../lib/cloudinary.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";


export const getFeedPosts = async (req, res) => {
    try {
       const posts = await Post.find({author: {$in: req.user.connections}}).
       populate("author", "name username profilePicture headline").
       populate("comments.user", "name profilePicture").sort({createdAt: -1});

       res.status(200).json(posts);
    }
    catch (error) {
        controller.error("Error fetching feed posts", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const createPost = async (req, res) => {
    try {
        const {content,image} = req.body;
        let newPost;

        if (image) {
            const imgResult = await cloudinary.uploader.upload(image);
            newPost = new Post({author: req.user._id, content, image: imgResult.secure_url});
        }
        else {
            newPost = new Post({content, author: req.user._id});
        }
        await newPost.save();

        res.status(201).json(newPost);
    }
        catch (error) {
            console.error("Error creating post", error);
            res.status(500).json({message: "Internal server error"});
        }


}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        
        if(!post) {
            return res.status(404).json({message: "Post not found"});
        }
        
        if (post.author.toString() !== userId) {
            return res.status(401).json({message: "Unauthorized to delete post"});
        }

        if(post.image) {
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({message: "Post deleted successfully"});
        
    } 
    catch (error) {
        console.log("Error deleting post", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).
        populate("author", "name username profilePicture headline").
        populate("comments.user", "name profilePicture username headline");

        res.status(200).json(post);
    }
    catch (error) {
        console.log("Error fetching post by id", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const createComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const {content} = req.body;

        const post = await Post.findByIdAndUpdate(postId,
                     {$push: {comments: {content, user: req.user._id}}},
                     {new: true}).populate("author", "name email username headline profilePicture"); 
        

       if(post.author.toString() !== req.user._id) {
           const notification = new Notification({
               recipient: post.author,
               type: "comment",
               relatedPost: postId,
               relatedUser: req.user._id
           });

           await notification.save();

           try {
            const postUrl = process.env.CLIENT_URL + "/post/" + postId;
            await sendCommentNotificationEmail(post.author.email, post.author.name, req.user.name, postUrl, content);
            
           } catch (error) {
            console.log("Error sending comment notification email", error.message);
           }

       }

        res.status(200).json(post);
    }
    catch (error) {
        console.error("Error creating comment", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}