import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUserNotifications ,markNotificationsAsRead, deleteNotification } from '../controllers/notification.controller.js';

 const router = express.Router();

 router.get("/",protectRoute, getUserNotifications);

 router.get("/",protectRoute, markNotificationsAsRead);
 router.delete("/:id",protectRoute, deleteNotification);

 export default router;