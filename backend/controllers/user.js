const User = require('../models/User');
const Post = require('../models/Post');
const {sendEmail} = require('../middlewares/sendEmail');
const crypto = require('crypto');

exports.register = async (req, res) => {
    try {
        const {name, email, password, avatar} = req.body
        let user = await User.findOne({email});
        if(user)    return res.status(400).json({success: false, message: "User already exists"});

        user = await User.create({name, email, password, avatar:avatar});
        
        //Once registration gets completed, we generate a token for the user and directly logs him in
        const token = user.generateToken();
        res.status(201).cookie("token", token, {
            expires: new Date(Date.now()+90*24*60*60*1000),
            httpOnly: true

        }).json({
            success: true,
            user,
            token
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.login = async (req, res) => {

    try {
        const {email, password} = req.body;

        const user = await User.findOne({email}).select("+password").populate("posts followers following");
        //if user email does not exist, then we return from here
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User does not exist"
            })
        }

        //if user email exists, then we check if the password is correct
        const isMatch = await user.matchPassword(password);

        //if password does't match, then we return from here
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            })
        }

        //if password matches, then we generate a token for the user
        const token = user.generateToken();
        res.status(200).cookie("token", token, {
            expires: new Date(Date.now()+90*24*60*60*1000),
            httpOnly: true

        }).json({
            success: true,
            user,
            token
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.logout = async (req, res) => {
    try {
        res.status(200).cookie("token", null, {expires: new Date(Date.now()), httpOnly: true}).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.followUser = async (req, res) => {
    try {
        
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);

        if(!userToFollow){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        //if user is already followed, then we un-follow him
        if(loggedInUser.following.includes(userToFollow._id)){

            const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexfollowing, 1);

            const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexfollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: "User un-followed successfully"
            })

        }else{

            //if user is not followed, then we follow him
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);
    
            await loggedInUser.save();
            await userToFollow.save();
    
            res.status(200).json({
                success: true,  
                message: "User followed successfully"
            })
        }




    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");
        const {oldPassword, newPassword} = req.body;

        //if nothing is entered in the fields, then we return from here
        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: "Please enter all the fields"
            })
        }

        //if old password is incorrect, then we return from here
        const isMatch = await user.matchPassword(oldPassword);
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Incorrect old password"
            })
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully!"
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.updateProfile = async (req, res) => {
    try {
        

        const user = await User.findById(req.user._id);
        const {name, email} = req.body;

        if(name){ user.name = name; }
        if(email){ user.email = email; }

        //if user uploads a new avatar FRONTEND


        await user.save();
        res.status(200).json({
            success: true,
            message: "Profile updated successfully!"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteMyProfile = async (req, res) => {
    try {
        
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;
        await user.deleteOne();

        //logout the user after deleting his profile
        res.cookie("token", null, {
            expires: new Date(Date.now()), 
            httpOnly: true
        })


        //we also need to delete all the posts of the user
        //looping over all the posts made by the user
        for(let i=0; i<posts.length; i++){
            const post = await Post.findById(posts[i]);
            await post.deleteOne();
        }

        //Removing user from the followers list of all the users
        for(let i = 0; i<followers.length; i++){
            const follower = await User.findById(followers[i]);

            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
            await follower.save();
        }

        //Removing the profile from the following list of all the users
        for(let i = 0; i<following.length; i++){
            const follows = await User.findById(following[i]);

            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index, 1);
            await follows.save();
        }


        res.status(200).json({
            success: true,
            message: "Profile deleted successfully!"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Helps us to see our own profile
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("posts followers following");
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Helps us to see the profile of other users
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts followers following");
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


//shows all the users in the database
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getMyPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        const posts = []
        for(let i=0; i<user.posts.length; i++){
            const post = await Post.findById(user.posts[i]).populate("likes comments.user owner");
            posts.push(post);
        }
        res.status(200).json({
            success: true,
            posts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.forgotPassword = async (req, res) => {

    try {
        
        const user = await User.findOne({email: req.body.email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        //if user exists, then we generate a reset token for him
        const resetPasswordToken = user.getResetPasswordToken();
        await user.save();

        //send the reset password link to the user
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`;
        const message = `Reset your password by clicking on the link below:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password reset request",
                message
            })

            res.status(200).json({
                success: true,
                message: "Email sent successfully"
            })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return res.status(500).json({
                success: false,
                message: error.message
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })     
    }
}


exports.resetPassword = async(req, res) => {
    try {
        
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()}
        
        });

        //either token is invalid or expired
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Token is Invalid or Expired"
            })
        }

        //if token is valid and not expired, then we update the password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })

    }catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}