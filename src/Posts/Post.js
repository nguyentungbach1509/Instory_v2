import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import {db} from '../firebase/firebase';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import firebase from 'firebase';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Emoji from "react-emoji-render";
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';

function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
}

const Accordion = withStyles({
    root: {
     
      boxShadow: 'none',
      '&:not(:last-child)': {
        borderBottom: 0,
      },
      '&:before': {
        display: 'none',
      },
      '&$expanded': {
        margin: 'auto',
      },
    },
    expanded: {},
  })(MuiAccordion);
  
  const AccordionSummary = withStyles({
    root: {
      backgroundColor: 'white',
      color: '#8e8e8e',
      marginLeft: "0",
      marginBottom: -1,
      minHeight: 56,
      '&$expanded': {
        minHeight: 56,
      },
    },
    content: {
      '&$expanded': {
        margin: '12px 0',
      },
    },
    expanded: {},
  })(MuiAccordionSummary);

const useStyles = makeStyles((theme) => ({
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '3px solid #000',
      borderRadius: '3px 3px 3px 3px',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    }
}));


const PostContainer = styled.div`
    margin-top: 25px;
    margin-left: 100px;
    margin-bottom: 25px;
    background-color: white;
    max-width: 500px;
    border: 1px solid lightgrey;
    border-radius: 3px 3px 3px 3px;
`;


const PostHeaderContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 15px;

    > .MuiAvatar-root {
        margin-right: 10px;
    }
`;


const PostBodyContainer = styled.div`
    > .post__image {
        width: 100%;
        object-fit: contain;
        border-top:1px solid lightgrey;
        border-bottom: 1px solid lightgrey;
        
    }
    
    
    > .post__onlyimg{
        width: 100%;
        object-fit: contain;
        border-top:1px solid lightgrey;
        border-bottom: 1px solid lightgrey;
        margin-bottom: 40px;
    }

    > p {
        
        padding: 15px;

        > span {
            font-weight: bold;
            font-size: 3.5mm;
        }
    }

    > span {
        align-items: center;

        > span {
            font-size: 3.5mm;
            font-weight: 500;
        }
    }

`;



const PostCommentContainer = styled.div`
    margin-top: 15px;
    margin-bottom: 5px;

    > form {
        display: flex;

        > textarea {
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

        > .comment__button {
                flex: 0;
                border: none;
                border-top: 1px solid #efefef;
                color: #0095f6;
                padding: 10px;
                background-color: white;
        }

        > .comment__buttondisable {
                flex: 0;
                border: none;
                border-top: 1px solid #efefef;
                color: #b7e1fd;
                padding: 10px;
                background-color: white;
        }
    }

   
`;


const PostComments = styled.div`
    margin-left: 15px;

    .view__allcomments {
        font-family: "Arial", sans-serif;
        font-size: 3.5mm;
        margin-left: -12px;
    }


    .list__comments {
        display: flex;
        flex-direction: column;

        .header__caption {
            font-weight: bold;
            font-size: 3.5mm;
        }
    }

`;



const ImgListCollectionContainer = styled.div`
    
    width: 200px;
    height: 200px;
    border-radius: 10px 10px 10px 10px;
    

    &:hover {
        cursor: pointer;
        border: 3px solid black;
        border-radius: 10px 10px 10px 10px;

    }

    > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px 10px 10px 10px;
    }
`;


const PostCollectionContainer = styled.div`
    .MuiImageListItemBar-rootSubtitle {
        width: 200px;
        border-radius: 0px 0px 10px 10px;
    }
`;

function Post(props) {

    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [likes, setLikes] = useState(0);
    const [clickLike, setClickLike] = useState(false);
    const isShow = props.showProfile;

    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        let unsubscribe;
        if(props.id){
            unsubscribe = db
                .collection("posts")
                .doc(props.id)
                .collection("comments")
                .orderBy("timestamp", "asc")
                .onSnapshot(snapshot => {
                    setComments(snapshot.docs.map((doc) => doc.data()));
                });
        }

        return () => {
            unsubscribe();
        }

    }, []);

    useEffect(() => {
        let unsubscribe;
        if(props.id){
            unsubscribe = db
                .collection("posts")
                .doc(props.id)
                .collection("likes")
                .onSnapshot(snapshot => {
                    let count = 0;
                    setLikes(snapshot.size);
                    for(let i = 0; i < snapshot.size; i++){
                        if(snapshot.docs[i].id === props.user.id) {
                            setClickLike(true);
                            break;
                        }
                        else {
                            count ++;
                        }
                    }

                    if(count === snapshot.size) {
                        setClickLike(false);
                    }
                });
        }

        return () => {
            unsubscribe();
        }

    }, []);

    const handleopenModal = () => {
        setOpenModal(true);
    };

    const handlecloseModal = () => {
        setOpenModal(false);
    
    };

    const addComment = (event) => {
        event.preventDefault();

        db.collection("posts").doc(props.id).collection("comments").add({
            username: props.user.name,
            text: comment,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })

        setComment("");
    }

    const pressKey = (event) => {
        if(event.key === "Enter" && !event.shiftKey){
            event.preventDefault();
            if(comment.trim() !== ""){
                db.collection("posts").doc(props.id).collection("comments").add({
                    username: props.user.name,
                    text: comment,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
        
                setComment("");
            }
        }
    }

    const likeButton = () => {
        if(clickLike === false){
            db.collection("posts").doc(props.id).collection("likes").doc(props.user.id).set({
                id: props.user.id
            })
        }
        else {
            db.collection("posts").doc(props.id).collection("likes").doc(props.user.id).delete();
        }
    }

    return (
        <>
            {isShow === false ?
            (<PostContainer>
                <PostHeaderContainer>
                    <Avatar src={((props.userFriends.filter(e => ((e.id === props.post.userID) === true) ? true:false).map(e => e))).length === 0 ? props.user.avatar : ((props.userFriends.filter(e => ((e.id === props.post.userID) === true) ? true:false).map(e => e)))[0].userinfo.Avatar}/>
                    <span>{props.post.username}</span>
                </PostHeaderContainer>
                <PostBodyContainer>
                    <img onDoubleClick={likeButton} className={(props.post.caption.trim() !== "") ? "post__image" : "post__onlyimg"} src={props.post.url}/>
                    <span>
                        <IconButton onClick={likeButton}>
                            {clickLike === true ? <FavoriteIcon style={{color: "black"}}/> : 
                            <FavoriteBorderIcon style={{color: "black"}}/>}
                        </IconButton>  
                        <span>{likes} Likes</span>
                    </span>
                    {(props.post.caption.trim() !== "") ? <p><span>{props.post.username}</span>: {props.post.caption}</p> : null}
                </PostBodyContainer>
                <PostComments>
                    <Accordion 
                        defaultExpanded={false}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            >
                            <Typography>
                                <span className="view__allcomments" >View all comments ({comments.length})</span>
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails className="list__comments">
                        
                            {comments.map((cmt, i) => (
                                <Typography key={i}>
                                    <span className="header__caption">{cmt.username}</span>: <Emoji text={cmt.text}/>
                                </Typography>
                            ))}
                            
                        </AccordionDetails>
                    
                    </Accordion>
                </PostComments>
                <PostCommentContainer>
                    <form>
                        <textarea
                            id="inputComment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows={4}
                            onKeyPress={pressKey}
                        >
                        </textarea>
                        <button  
                            className={comment.trim() === "" ? "comment__buttondisable" : "comment__button"}
                            disabled={comment.trim() === ""}
                            onClick={addComment}>
                                Post
                            </button>
                    </form>
                </PostCommentContainer>
            </PostContainer>) :
            (
            <PostCollectionContainer>
                <ImageListItem style={{width:"100%", marginLeft: "10px"}}>
                    <ImgListCollectionContainer onClick={handleopenModal}>
                        <img src={props.post.url}/>
                    </ImgListCollectionContainer>
                    <ImageListItemBar
                        title={props.post.caption}
                        subtitle={<span>by: {props.post.username}</span>}
                    />
                </ImageListItem>
                <Modal
                    open={openModal}
                    onClose={handlecloseModal}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <div style={modalStyle} className={classes.paper}>
                        
                        <PostHeaderContainer>
                            <Avatar src={props.user.avatar}/>
                            <span>{props.post.username}</span>
                        </PostHeaderContainer>
                        <PostBodyContainer>
                            <img onDoubleClick={likeButton} className={(props.post.caption.trim() !== "") ? "post__image" : "post__onlyimg"} src={props.post.url}/>
                            <span>
                                <IconButton onClick={likeButton}>
                                    {clickLike === true ? <FavoriteIcon style={{color: "black"}}/> : 
                                    <FavoriteBorderIcon style={{color: "black"}}/>}
                                </IconButton>  
                                <span>{likes} Likes</span>
                            </span>
                            {(props.post.caption.trim() !== "") ? <p><span>{props.post.username}</span>: {props.post.caption}</p> : null}
                        </PostBodyContainer>
                        <PostComments>
                            <Accordion 
                                defaultExpanded={false}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                    >
                                    <Typography>
                                        <span className="view__allcomments" >View all comments ({comments.length})</span>
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails className="list__comments">
                                
                                    {comments.map((cmt, i) => (
                                        <Typography key={i}>
                                            <span className="header__caption">{cmt.username}</span>: <Emoji text={cmt.text}/>
                                        </Typography>
                                    ))}
                                    
                                </AccordionDetails>
                            
                            </Accordion>
                        </PostComments>
                        <PostCommentContainer>
                            <form>
                                <textarea
                                    id="inputComment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    rows={4}
                                    onKeyPress={pressKey}
                                >
                                </textarea>
                                <button  
                                    className={comment.trim() === "" ? "comment__buttondisable" : "comment__button"}
                                    disabled={comment.trim() === ""}
                                    onClick={addComment}>
                                        Post
                                    </button>
                            </form>
                        </PostCommentContainer>
                    </div>      
                </Modal>
            </PostCollectionContainer> )  
        }  
        </>   
    )
}


export default Post;