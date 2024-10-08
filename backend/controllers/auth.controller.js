import User from '../models/user.model.js';
import { sendWelcomeEmail } from '../emails/emailHandlers.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const signup = async (req, res) => {
    try{
     const { name, username, email, password } = req.body;
     const exisitingEmail = await User.findOne({ email });

      if(!name || !username || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
      
      if(exisitingEmail){
            return res.status(400).json({message: "User already exists with this email"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password should be atleast 6 characters long"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            name,
            username,
            email,
            password: hashedPassword
        });
        await user.save();
        

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
        res.cookie("jwt-linkedin", token,
             { 
               httpOnly: true,
               maxAge: 3 * 24 * 60 * 60 * 1000,
               sameSite: "strict",
               secure: process.env.NODE_ENV === "production"
             },
            
            );

        res.status(201).json({message: "User created successfully"});

        const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

        try {
         await sendWelcomeEmail(user.email, user.name, profileUrl);
        } catch (emailError) {
            console.log("error in sending email", emailError.message);
        }

    }


    catch(err){
        console.log("error in signup", err.message);
        res.status(500).json({message: "Something went wrong"});
    }
}

export const login = async (req, res) => {
    try{
        const { username, password } = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }


        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
        res.cookie("jwt-linkedin", token,
             { 
               httpOnly: true,
               maxAge: 3 * 24 * 60 * 60 * 1000,
               sameSite: "strict",
               secure: process.env.NODE_ENV === "production"
             },
            
            );
        res.status(200).json({message: "Login successful"});

    }
    catch(err){
        console.log("error in login", err.message);
        res.status(500).json({message: "Something went wrong"});
    }

    res.send('Login');
}

export const logout = async (req, res) => {
    res.clearCookie("jwt-linkedin");
    res.send('Logout successfully');
}

export const getCurrentUser = async (req, res) => {
    try{
        res.status(200).json(req.user);
    }
    catch(err){
        console.log("error in getCurrentUser", err.message);
        res.status(500).json({message: "Something went wrong"});
    }
}