const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary");

exports.createPost = async (req, res) => {
    try {

        const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
            folder: "posts"
        })
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
            owner: req.user._id
        }

        const post = await Post.create(newPostData);
        const user = await User.findById(req.user._id);

        user.posts.unshift(post._id);
        await user.save();
        res.status(201).json({
            success: true,
            message : "Post Created"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.deletePost = async (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false, 
                message: "You are not authorized to delete this post"
            })
        }

        await Post.deleteOne({ _id: req.params.id });
        //After deleting the post , we need to remove the post id from the user's posts array
        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);
        await user.save();


        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.likeAndUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const isLiked = post.likes.includes(req.user._id);
        if (isLiked) {
            //if liked, unlike i.e. pull the user id from the likes array
            post.likes.pull(req.user._id);
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post unliked"
            })
        } else {
            //if not liked, like i.e. push the user id to the likes array
            post.likes.push(req.user._id);
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post liked" 
            })          
        }

        

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getPostOfFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const posts = await Post.find({
            owner: {
                $in: user.following
            }
        }).populate("owner likes comments.user")

        res.status(200).json({
            success: true,
            posts: posts.reverse()
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateCaption = async (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }   

        //check if the post belongs to the logged in user, then only he can update the caption
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false, 
                message: "You are not authorized to update this post"
            })
        }

        post.caption = req.body.caption;
        await post.save();

        res.status(200).json({
            success: true,  
            message: "Caption updated successfully"
        })

        
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message
        })
    }
}

exports.commentOnPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }   

        let commentIndex = -1;
        //Checking if the user has already commented on the post
        post.comments.forEach((item, index) => {
            
           if(item.user.toString() === req.user._id.toString()){
                commentIndex = index;
            }
        })

        //If the user has already commented on the post, then update the comment
        if(commentIndex !== -1){

            post.comments[commentIndex].comment = req.body.comment;
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Comment updated successfully"
            })

        }else{
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment
            })

            await post.save();
            return res.status(200).json({
                success: true,  
                message: "Comment added successfully"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //if no such post is found
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }


        //deleting all the comments is posssible only for the user who made that post
        if(post.owner.toString() === req.user._id.toString()){

            if(req.body.commentId === undefined){
                return res.status(400).json({
                    success: false,
                    message: "Please provide commentId"
                })
            }
            
            post.comments.forEach((item, index) => {
            
                if(item._id.toString() === req.body.commentId.toString()){
                    return post.comments.splice(index, 1);
                }
            })

            await post.save();
            return res.status(200).json({
                success: true,
                message: "Selected comment deleted successfully"
            })

        }else{
            //deleting a single comment is possible for the user who made that comment
            post.comments.forEach((item, index) => {
            
                if(item.user.toString() === req.user._id.toString()){
                    return post.comments.splice(index, 1);
                }
            })

            await post.save();
            return res.status(200).json({
                success: true,
                message: "Your comment has been deleted successfully"
            })
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}