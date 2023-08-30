import React, { useEffect } from 'react';
import "./Post.css";
import {Avatar , Typography, Button, Dialog} from "@mui/material";
import {Link} from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
    MoreHoriz,
    MoreVert,
    FavoriteBorder,
    Favorite,
    ChatBubbleOutline,
    DeleteOutline
} from "@mui/icons-material";
import { addCommentOnPost, likePost } from '../../Actions/Post';
import { getFollowingPosts } from '../../Actions/User';
import User from '../User/User';
import CommentCard from '../CommentCard/CommentCard';

 const Post = ({postId, caption, postImage, likes = [], comments = [], ownerImage, ownerName, ownerId, isDelete = false, isAccount = false}) => {
    
    const [liked, setLiked] = React.useState(false);
    const [likesUser, setLikesUser] = React.useState(false);
    const {error, message} = useSelector(state => state.like);

    const [commentValue, setCommentValue] = React.useState("");
    const [commentToggle, setCommentToggle] = React.useState(false);

    const dispatch = useDispatch();
    const {user} = useSelector(state => state.user);
    const handleLike = async () => {
        setLiked(!liked);
        await dispatch(likePost(postId));

        if(isAccount){
            console.log("isAccount")
        }else{
            dispatch(getFollowingPosts());
        }
        
    }

    const addCommentHandler = async (e) => {
        e.preventDefault();
        console.log(commentValue);

        await dispatch(addCommentOnPost(postId, commentValue));

        if(isAccount){
            console.log("show me comments")
        }else{
            dispatch(getFollowingPosts());
        }
    }

    useEffect(() => {
        likes.forEach( item => {
            if(item._id === user._id){
                setLiked(true);
            }
        } )
    }, [likes, user._id])

    return (
        <div className='post'>
            <div className='postHeader'>
                {isAccount ? (<Button><MoreHoriz /></Button>) : null}
            </div>
            <img src={postImage} alt='Post' />
            <div className='postDetails'>
                <Avatar src={ownerImage} alt="User" 
                    sx = {{
                        width: "3vmax",
                        height: "3vmax",
                    }}
                />

                <Link to={`/user/${ownerId}`}>
                    <Typography fontWeight={700}>{ownerName}</Typography>
                </Link>

                <Typography fontWeight={100} color="rgba(0,0,0,0.582)" style={{alignSelf: "center"}}>{caption}</Typography>
            </div>
            <button 
                style={{
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    margin: "1vmax 2vmax"
                }}

                onClick={() => setLikesUser(!likesUser)}
                disabled={likes.length === 0 ? true : false}
            >
                <Typography>{likes.length} likes</Typography>
            </button>

            <div className='postFooter'>
                <Button onClick={handleLike}>
                    { liked ? <Favorite style={{color:"red"}}/> : <FavoriteBorder />}
                </Button>

                <Button>
                    <ChatBubbleOutline onClick = {() => setCommentToggle(!commentToggle)}/>
                </Button>

                {isDelete ? (<Button><DeleteOutline /></Button>) : null}
                
            </div>

            <Dialog 
                open={likesUser}
                onClose={() => setLikesUser(!likesUser)}>

                <div className='DialogBox'>
                    <Typography variant='h4'>Liked By</Typography>
                    {
                        likes.map(like => (
                            <User
                                key = {like._id}
                                userId = {like._id}
                                name = {like.name}
                                avatar = {like.avatar.url}
                            />
                        ))
                    }
                </div>
            </Dialog>

            <Dialog 
                open={commentToggle}
                onClose={() => setCommentToggle(!commentToggle)}>

                <div className='DialogBox'>
                    <Typography variant='h4'>Comments</Typography>

                    <form className='commentForm' onSubmit={addCommentHandler}>
                        <input type='text' placeholder = "Comment here!"value={commentValue} onChange={(e) => setCommentValue(e.target.value)} required></input>
                        <Button type='submit' variant='contained'>Comment</Button>
                    </form>

                    {
                        comments.length > 0 ? comments.map(item => (
                            <CommentCard 
                                key = {item._id}
                                userId = {item.user._id}
                                name = {item.user.name}
                                avatar = {item.user.avatar.url}
                                comment = {item.comment}
                                commentId = {item._id}
                                postId = {postId}
                                isAccount = {isAccount}
                            />
                        )): <Typography>No comments yet</Typography>
                    }
                </div>
            </Dialog>
        </div>
    )
}

export default Post