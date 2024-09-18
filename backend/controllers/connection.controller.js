import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { sendConnectionAcceptedEmail } from "../emails/emailHandlers.js";



export const sendConnectionRequest = async (req, res) => {
    try {
        const{userId} = req.params;
        const senderId = req.user._id;

        if(senderId === userId) {
            return res.status(400).json({message: "You cannot send connection request to yourself"});
        }

        if(req.user.connections.includes(userId)) {
            return res.status(400).json({message: "You are already connected with this user"});
        }

        const existingRequest = await ConnectionRequest.
        findOne({sender: senderId, recipient: userId, status: "pending"});

        if(existingRequest) {
            return res.status(400).json({message: "Connection request already sent"});
        }

        const newRequest = new ConnectionRequest({sender: senderId, recipient: userId});

        await newRequest.save();

        res.status(200).json({message: "Connection request sent"});

        
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;
        
        const request = await ConnectionRequest.findById(requestId).populate("sender, name email username").populate("recipient", "name email username");

        if(!request) {
            return res.status(404).json({message: "Connection request not found"});
        }

        if(request.recipient._id.toString() !== userId.toString()) {
            return res.status(401).json({message: "Unauthorized"});
        }

        if(request.status !== "pending") {
            return res.status(400).json({message: "Connection request already accepted/rejected"});
        }

        request.status = "accepted";
        await request.save();

        await User.findByIdAndUpdate(request.sender._id, {$addToSet: {connections: userId}});
        await User.findByIdAndUpdate(userId, {$addToSet: {connections: request.sender._id}});

        const notification = new Notification({
            recipient: request.sender._id,
            type: "connectionAccepted",
            relatedUser: userId,
        });

        await notification.save();

        res.json({message: "Connection request accepted"});

        const senderEmail = request.sender.email;
        const senderName = request.sender.name;
        const recipientName = request.recipient.name;
        const profileUrl = process.env.CLIENT_URL + "/profile/" + request.recipient.username;

        try {
            await sendConnectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl);
        } catch (error) {
            console.error("Error sending connection accepted email", error.message);
        }

    }
    catch (error) {
        console.error("Error accepting connection request", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}