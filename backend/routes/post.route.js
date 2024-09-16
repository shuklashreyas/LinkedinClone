import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getFeedPosts, createPost, deletePost,
    getPostById, createComment, likePost} from '../controllers/post.controller.js';

const router = express.Router();

router.get("/",protectRoute,getFeedPosts)
router.get("create",protectRoute,createPost)
router.delete("delete/:id",protectRoute,deletePost)
router.get("/:id",protectRoute,getPostById)
router.get("/:id/comment",protectRoute,createComment)
router.get("/:id/like",protectRoute,likePost)


export default router; 