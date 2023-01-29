import React, {useEffect, useState} from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link,
    NavLink,
    Redirect,
    Switch
} from 'react-router-dom';
import styled from 'styled-components';
import Post from '../Posts/Post';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Avatar from '@material-ui/core/Avatar';
import {useSelector, useDispatch} from 'react-redux';
import {db} from '../firebase/firebase';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { storeInfor } from '../redux/other';



const requestList =  makeStyles((theme) => ({
    root: {
      width: '100%',
      height: '200px',
      overflowY: 'scroll',
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: 'inline',
    },
}));


const HomeFriendContainer = styled.div`
    position: sticky;
    top: 200px;

    a {
        text-decoration: none;
        color: inherit;
    }

`;


const HomeUserContainer = styled.div`

    display: flex;
    align-items: center;
    margin-bottom: 10px;

    :&hover {
        text-decoration: underline;
        cursor: pointer;
    }

    > h4 {
        padding-left: 15px;
    }
`;


function Home(props) {

    const user = useSelector((state) => state.user.value);
    const dispatch = useDispatch();
    const [posts, setPosts] = useState([]);
    const listFriendStyles = requestList();
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
        const clearFunction = db.collection("posts").orderBy("timestamp", "desc").onSnapshot((snap) => {
            setPosts(snap.docs.map(doc => ({postid: doc.id,  post: doc.data()})));
        })

        return () => {
            clearFunction();
        }
        
    }, []);

    const clickSelectedFriends = (event, value) => {
        setSelectedFriend(value.id);
        dispatch(storeInfor({
            id: value.id,
            name: value.userinfo.Name,
            avatar: value.userinfo.Avatar
        }))

    }


    const renderFriends = (value) => {
        return(
            <Link  key={value.id} to={`/profile/${value.id}`}>
                <div>
                    <ListItem 
                        alignItems="flex-start"
                        button
                        selected={selectedFriend === value.id}
                        onClick={(event) => clickSelectedFriends(event, value)}
                        
                    >
                        <ListItemAvatar>
                            <Avatar src={value.userinfo.Avatar} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={value.userinfo.Name}
                        />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                </div>
            </Link>
        )
    }
    

    return (
        <Grid container item xs={12} spacing={4}>
            <Grid item xs={8}>
                <div>
                    {posts.filter(e => (e.post.userID === user.id || props.userFriends.some(a => a.id === e.post.userID) === true) ? true : false).map(e =>(<Post key={e.postid} id={e.postid} post={e.post} user={user} userFriends={props.userFriends} showProfile={false}/>))}
                </div> 
            </Grid>
            <Grid item xs={3} style={{marginTop: "100px"}}>
                <HomeFriendContainer>
                    <Link to={`/profile/${user.id}`}>
                        <HomeUserContainer>
                            <Avatar src={user.avatar}/>
                            <h4>{user.name}</h4>
                        </HomeUserContainer>
                    </Link>
                    <div>
                        <h5 style={{marginBottom:"5px"}}>Friends</h5>
                        <List className={listFriendStyles.root} style={{backgroundColor: "whitesmoke"}}>
                            {props.userFriends.map(renderFriends)}
                        </List>
                    </div>
                </HomeFriendContainer>
            </Grid>
        </Grid>
    )
}


export default Home;