import React, {useState, useEffect} from 'react';
import firebase from 'firebase';
import {db} from '../firebase/firebase';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Emoji from "react-emoji-render";
import Grid from '@material-ui/core/Grid';


const messList = makeStyles((theme) => ({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: 'inline',
    },
}));

const useStylesAvatar = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    large: {
      width: theme.spacing(20),
      height: theme.spacing(20),
    },
}));


const MessengerContainer = styled.div`
    max-width: 1000px;
    height: 520px;
    margin-left: 13%;
    margin-top: 20px;
    border: 1px solid #dbdbdb;
    border-radius: 3px 3px 3px 3px;
    background-color: white;

    .text__input {
        margin-left: 65px;
        width: 80%;
        resize: none;
        height: 20px;
        padding: 10px 0;
        padding-left: 10px;
        border: none;
        border-top: 1px solid #efefef;
        font-family: inherit;
    }


    .comment__input {
        flex: 1;
        resize: none;
        height: 20px;
        padding: 10px;
        border: none;
        border-top: 1px solid #efefef;
        font-family: inherit;

        &:active {
            border:none;
            border-top: 1px solid #efefef;
        }
    }

    
`;


const MessHeaderContainer = styled.div`
    text-align: center;
    padding: 20px;
    border-right: 1px solid  #dbdbdb;
    border-bottom: 1px solid  #dbdbdb;

`;


const MessDetailFriendContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 15.5px;
    border-bottom: 1px solid #dbdbdb;
`;


const FriendMessContainer = styled.div`
    border-right: 1px solid #dbdbdb;
    overflow-y: scroll;
    height: 100%;
`;


const AllMessContainer = styled.div`
    width: 100%;
    height: 100%;
`;


const ShowMessContainer = styled.div`
    overflow-y: scroll;
    height: 390px;
    margin-bottom: 20px;


    .mess {
        display:flex;
        align-items: center;
        margin: 10px;
        padding:3px;
        width: fit-content;
        border-radius: 10px 10px 10px 10px;
    }

    .mess__user {
        margin-left: auto;
        color: white;
        text-align: right !important;
    }

    .mess__usercard {
        color: white !important;
        background-color: black !important;
    }

    .mess__guesecard{
        color: black !important;
        background-color: darkgray !important;
        
    }

    .ava__mess {
        margin-right: 10px;
    }

`;


function Messenger(props) {

    const user = useSelector((state) => state.user.value);

    const [selectedFriend, setSelectedFriend] = useState(null);
    const [otherProfile, setOtherProfile] = useState("");
    const listFriendStyles = messList();
    const [mess, setMess] = useState([]);
    const [messID, setMessID] = useState("");
    const [text, setText] = useState("");
    const classesAvatar = useStylesAvatar();


    useEffect(() => {
        if(messID.trim() !== ""){
            const unsubscribe = db.collection("mess").doc(messID).collection("text").orderBy("timestamp", "asc").onSnapshot((snapShot) => {
                setMess(snapShot.docs.map(doc => doc.data()));
            })


            return () => {
                unsubscribe();
            }
                
        }

        
    }, [messID])


    const scrollBottom = () => {
        let scrollBar =  document.getElementById("mess__display");
        scrollBar.scrollTop = scrollBar.scrollHeight;
    }

    const clickSelectedFriends = (event, value) => {
        setSelectedFriend(value.id);
        setOtherProfile(value);
        db.collection("mess").get().then((snap) => {
            if(snap.docs.length === 0){
                db.collection("mess").add({
                    ID: [user.id, value.id]
                }).then((doc) => {
                    setMessID(doc.id);
                    
                })
                
            }
            else {
                let count = 0;
                for(let i = 0; i < snap.size; i++){
                    if(snap.docs[i].data().ID.includes(user.id) === true && snap.docs[i].data().ID.includes(value.id) === true){
                        setMessID(snap.docs[i].id);
                        break;
                    }
                    else {
                        count ++;
                    }
                }

                if(count === snap.size){
                    db.collection("mess").add({
                        ID: [user.id, value.id]
                    }).then((doc) => {
                        setMessID(doc.id);
                        
                    })
                }
            }

        })

        
    }


    const pressKey = (event) => {
        if(event.key === "Enter" && !event.shiftKey){
            event.preventDefault();
            if(text.trim() !== ""){
                db.collection("mess").doc(messID).collection("text").add({
                    userid: user.id,
                    text: text,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
        
                setText("");
                scrollBottom();
            }
        }
    }

    const renderFriends = (value) => {
        return(
            <div key={value.id}>
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
        )
    }

   


    const renderMess = (v,i) => {
        return(
            <div key={i} className={v.userid === user.id ? "mess mess__user" : "mess"}>
                {v.userid === otherProfile.id ? <Avatar className="ava__mess"  src={otherProfile.userinfo.Avatar}/> : null}
                <Card className={v.userid === user.id ? "mess__usercard" : "mess__guesecard"}>
                    <CardContent>
                        <Typography>
                            <Emoji text={v.text}/>
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        )
    }


    return (
        <MessengerContainer>
            <Grid container item xs={12}>
                <Grid container item xs={12}>
                    <Grid item xs={4}>
                        <MessHeaderContainer>
                            <h4 style={{fontWeight:"500"}}>Friends</h4>
                        </MessHeaderContainer>
                    </Grid>
                    <Grid item xs={8}>
                            {otherProfile ? 
                                <MessDetailFriendContainer>
                                    <Avatar className={classesAvatar.small} src={otherProfile.userinfo.Avatar}/> 
                                    <h5 style={{fontWeight:"500", paddingLeft: "10px"}}>{otherProfile.userinfo.Name}</h5>
                                </MessDetailFriendContainer>
                            : null}
                    </Grid>
               </Grid>
               <Grid container item xs={12} style={{height:"458px"}}>
                    <Grid item xs={4}>
                        <FriendMessContainer>
                            <h4 style={{fontWeight:"500", paddingLeft:"20px", paddingTop:"10px"}}>Messages</h4>
                            <List className={listFriendStyles.root}>
                                {props.userFriends.map(renderFriends)}
                            </List>
                        </FriendMessContainer>
                    </Grid>
                    <Grid item xs={8}>
                        {otherProfile ? 
                            <AllMessContainer>
                                <ShowMessContainer id="mess__display">
                                    {mess.length !== 0 ? mess.map(renderMess) : null}
                                </ShowMessContainer>
                                <div>
                                    <textarea
                                        className="comment__input text__input"
                                        placeholder="Message..."
                                        rows={4}
                                        onKeyPress={pressKey}
                                        value={text}
                                        onChange={(event) => setText(event.target.value)}
                                        >
                                    </textarea>
                                </div>
                            </AllMessContainer>
                        : null}
                    </Grid> 
               </Grid>
            </Grid>
        </MessengerContainer>
    );

}


export default Messenger;
