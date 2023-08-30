import axios from "axios";
export const loginUser = (email, password) => async (dispatch) => {
    try {
        dispatch({type: "LoginRequest"});
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const {data} = await axios.post("/api/v1/login", {email, password}, config);
        dispatch({type: "LoginSuccess", payload: data.user});
        // localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
        dispatch({type: "LoginFailure", payload: error.response.data.message});
    }
}

export const loadUser = () => async (dispatch) => {
    try {
        dispatch({type: "LoadUserRequest"});
        const {data} = await axios.get("/api/v1/myProfile");

        dispatch({type: "LoadUserSuccess", payload: data.user});
        // localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
        dispatch({type: "LoadUserFailure", payload: error.response.data.message});
    }
}

export const getFollowingPosts = () => async (dispatch) => {
    try {
        
        dispatch({type: "postOfFollowingRequest"});
        const {data} = await axios.get("/api/v1/posts");
        // console.log(data);
        dispatch({type: "PostOfFollowingSuccess", payload: data.posts});

    } catch (error) {
        dispatch({
            type: "postOfFollowingFailure",
            payload: error.response.data.message,
        })
    }
}

export const getMyPosts = () => async (dispatch) => {
    try {
        
        dispatch({type: "myPostsRequest"});
        const {data} = await axios.get("/api/v1/my/posts");
        // console.log(data);
        dispatch({type: "myPostsSuccess", payload: data.posts});

    } catch (error) {
        dispatch({
            type: "myPostsFailure",
            payload: error.response.data.message,
        })
    }
}

export const getAllUsers = () => async (dispatch) => {
    try {
        
        dispatch({type: "allUsersRequest"});
        const {data} = await axios.get("/api/v1/users");
        // console.log(data);
        dispatch({type: "allUsersSuccess", payload: data.users});

    } catch (error) {
        dispatch({
            type: "allUsersFailure",
            payload: error.response.data.message,
        })
    }
}


export const logoutUser = () => async (dispatch) => {
    try {
        dispatch({type: "LogoutUserRequest"});

        const {data} = await axios.get("/api/v1/logout");
        dispatch({type: "LogoutUserSuccess"});
        // localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
        dispatch({type: "LogoutUserFailure", payload: error.response.data.message});
    }
}
