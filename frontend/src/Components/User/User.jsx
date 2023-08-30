import React from 'react';
import {Link} from "react-router-dom";
import {Typography} from "@mui/material";

const User = (props) => {
    return (
        <Link to = {`/user/${props.userId}`}className='homeUser'>
            <img src= {props.avatar} alt= {props.name} />
            <Typography>{props.name}</Typography>
        </Link>
    )
}

export default User