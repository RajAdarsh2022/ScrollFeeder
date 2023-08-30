import React, { useEffect } from "react";
import "./NewPost.css";
import { Typography, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { createNewPost } from "../../Actions/Post"; 
import { useAlert } from "react-alert";

const NewPost = () => {

    const [image, setImage] = React.useState(null);
    const [caption, setCaption] = React.useState("");

    const {loading, error, message} = useSelector(state => state.like);
    const dispatch = useDispatch();
    const alert = useAlert()
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const Reader = new FileReader();
        Reader.readAsDataURL(file);

        Reader.onload = () => {
            if(Reader.readyState === 2){
                console.log(Reader.result);
                setImage(Reader.result);
            }
        }
        
    }

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(createNewPost(caption, image))
    }

    useEffect(() => {
        if(error){
            alert.error(error)
            dispatch({type: "clearErrors"})
        }

        if(message){
            alert.success(message)
            dispatch({type: "clearMessage"})
        }
    }, [dispatch, error, message, alert])
    return (
        <div className="newPost">
            <form className="newPostForm" onSubmit={submitHandler}>
                <Typography variant="h3">New Post</Typography>
                {image && <img src = {image} alt = "post" />}
                <input type="file" accept="image/*"  onChange = {handleImageChange} />
                <input 
                    type="text" 
                    placeholder="Caption..."  
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}

                />
                <Button disabled = {loading} type="submit">Post</Button>
            </form>
        </div>
    )
}

export default NewPost