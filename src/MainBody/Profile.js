import React, {useEffect, useState, useRef} from 'react';
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
import Avatar from '@material-ui/core/Avatar';
import {useSelector, useDispatch} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {auth, db, storage} from '../firebase/firebase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Resizer from 'react-image-file-resizer';
import Grid from '@material-ui/core/Grid';
import ImageList from '@material-ui/core/ImageList';
import { withStyles } from '@material-ui/core/styles';
import {updateName, updateAvatar} from '../redux/user';
import { useParams } from 'react-router';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { storeInfor } from '../redux/other';




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


const gridStyle = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor:  '#fafafa',
    },
    imageList: {
      width: '100%',
      height: 500,
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
    },
}));


const listStyles = makeStyles((theme) => ({
root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    borderRight: '2px solid black'
},
}));


function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
}



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
  


const ProfileContainer = styled.div`
    width: 100%;

`;


const ProfileInforContainer = styled.div`
    width: 100%;
    height: 50vh;
    border-bottom: 1px solid lightgrey;
`;


const UploadControl = styled.div`
    display:flex;
    justify-content: space-between;
    margin-top: 10px;

`;


const ThumbnailContainer = styled.div`
    width: 100%;
    height: 350px;
    margin-bottom: 10px;
    position: relative;

    > .load__thumbnail{
        filter: blur(3px);
        -webkit-filter: blur(3px);
        border-radius: 4px;
        width: 100%;
        object-fit: contain;
        height: 100%;
      } 
      
      > .img__thumbnail {
        border-radius: 4px;
        width: 100%;
        object-fit: contain;
        height: 100%;
      }
    
      > .MuiCircularProgress-root {
        position: absolute;
        z-index: 2;
        top: 50%;
        left: 45%;
      }

`;


const HeaderProfileContainer = styled.div`
    display: flex;
    margin-left: 8px;
    align-items: center!important;

    > button {
        
        margin-left: 20px;
        padding: 10px;
        border:none;
        background-color: #fafafa;
        
        &:hover {
            cursor: pointer;
        }
    }

`;


const FormContainer = styled.div`
    width: 100%;
    height:100%;
    margin-left: 35px;
    margin-right: 10px;

    > form {
        display: flex;
        flex-direction: column;
        width: 90%;
        height: 100%;
    }
`;


const PostCollectionContainer = styled.div`
    > div {
        text-align: center;
        margin-bottom: 30px;
    }

`;


const BodyProfile = styled.div`
    display: flex;
    margin-left: 8px;
    margin-top: 20px;

    > a {
        
        border: none;
        background-color: #fafafa;
        margin-left: 15px;
        text-decoration: none;
        color: black;


        :&hover {
            text-decoration: none;
            text-decoration-style: none;
            color: black;
        }
    }
`;


function Profile(props) {

    const user = useSelector((state) => state.user.value);
    const other = useSelector((state) => state.other.value);
    const dispatch = useDispatch();
    const {profileID} = useParams();

    const gridClass = gridStyle();
    const [openModal, setOpenModal] = useState(false);
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    const listClasses = listStyles();
    const classesAvatar = useStylesAvatar();


    const inputFile = useRef(null);
    const [checkImg, setCheckImg] = useState(false);
    const [thumbnail, setThumbNail] = useState("");
    const [img, setImg] = useState(null);
    const [openModalImage, setOpenModalImage] = useState(false);
    const[resizeImg, setResizeImg] = useState("");
    const [progressLoading, setProgress] = useState(0);
    const [view, setView] = useState("hidden");
    const [upConfirm, setConfirm] = useState(false);


    const [selectedIndex, setSelectedIndex] = useState(0);
    const [newName, setNewName] = useState(user.name);
    const [newPassword, setNewPassword] = useState("");


    const [posts, setPosts] = useState([]);
    

    //Friends
    
    const [friendsList, setFriendList] = useState([]);
    const listFriendStyles = requestList();
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [isRequest, setIsRequest] = useState(profileID === other.id && props.friendRequest.some(e => e.id === other.id));
    const [isFriend, setIsFriend] = useState(props.userFriends.some(e => e.id === other.id));
    const [isAdd, setIsAdd] = useState(profileID === other.id && props.addFriends.some(e => e.id === other.id));
    const [friendModal, setFriendModal] = useState(false);


    useEffect(() => {
        const clearFunction = db.collection("posts").orderBy("timestamp", "desc").onSnapshot((snap) => {
            setPosts(snap.docs.map(doc => ({postid: doc.id,  post: doc.data()})));
        })

        return () => {
            clearFunction();
        }
        
    }, []);

    useEffect(() => {

        if(other.id) {
            const unsubscribe = db.collection("users").doc(other.id).collection("friends").onSnapshot((snap) => {
                setFriendList(snap.docs.map(doc => ({id: doc.id,  userinfo: doc.data()})));
            })

            return () => {
                unsubscribe();
            }
        }

    }, [])
    

    //Handle change name and password
    const changeUserName = (event) => {
        event.preventDefault();
        auth.currentUser.updateProfile({
            displayName: newName
        }).then(() => {
            dispatch(updateName({
                name: newName
            }));
            db.collection("users").doc(user.id).set({
                Name: newName
            }, {merge: true}).then(() => {
    
                changeUserComment();
                changeUserPost();
                changeUserFriend();
                changeUserRequest();
                setOpenModal(false);
            })
    
                
        })
    }



    const changePassword = (event) => {
        event.preventDefault();
        auth.currentUser.updatePassword(newPassword).then(() => {
            setNewPassword("");
        });
    }



    //Update post, comments, avatar, friends lists after change 
    const changeUserComment = () => {
        db.collection("posts").get().then(snap => {
            snap.forEach((post) => {
                db.collection("posts").doc(post.id).collection("comments").where("username", "==", user.name).get().then(cmt => {
                    cmt.forEach((e) => {
                        db.collection("posts").doc(post.id).collection("comments").doc(e.id).set({
                            username: newName
                        }, {merge:true})
                    })
                })
            })
        })

        setNewName("");
    }


    const changeUserPost = () => {
        db.collection("posts").where("userID", "==", user.id).get().then(snap => {
            snap.forEach((post) => {
               db.collection("posts").doc(post.id).set({
                   username: newName
               }, {merge: true})
            })
        })
    }

    const changeUserRequest = () => {
        db.collection("users").doc(user.id).collection("add").get().then(snap => {
            if(snap.size !== 0){
                snap.forEach((e) => {
                    db.collection("users").doc(e.id).collection("requests").doc(user.id).set({
                        Name: newName
                    }, {merge: true})
                })
            }
        })
    }

    const changeUserFriend = () => {
        db.collection("users").doc(user.id).collection("friends").get().then(snap => {
            if(snap.size !== 0){
                snap.forEach((e) => {
                    db.collection("users").doc(e.id).collection("friends").doc(user.id).set({
                        Name: newName
                    }, {merge: true})
                })
            }
        })
    }


    const changeAvatarRequest = (url) => {
        db.collection("users").doc(user.id).collection("add").get().then(snap => {
            if(snap.size !== 0){
                snap.forEach((e) => {
                    db.collection("users").doc(e.id).collection("requests").doc(user.id).set({
                        Avatar: url
                    }, {merge: true})
                })
            }
        })
    }

    const changeAvatarFriend = (url) => {
        db.collection("users").doc(user.id).collection("friends").get().then(snap => {
            if(snap.size !== 0){
                snap.forEach((e) => {
                    db.collection("users").doc(e.id).collection("friends").doc(user.id).set({
                        Avatar: url
                    }, {merge: true})
                })
            }
        })
    }


    //Handle change avatar
    const onChangeFile = (event) => {
        if(event.target.files[0]){
            if(event.target.files[0].name.endsWith('.jpg') === false && event.target.files[0].name.endsWith('.png') === false && event.target.files[0].name.endsWith('.gif') === false && event.target.files[0].name.endsWith('.jpeg') === false){
                
                alert("Unsupported media type");
                inputFile.current.value="";

                
                setImg(null);
                setCheckImg(false);
                
            }
            else {
                
                setThumbNail(URL.createObjectURL(event.target.files[0]));

                Resizer.imageFileResizer(
                    event.target.files[0],
                    300,
                    300,
                    'JPEG',
                    100,
                    0,
                    uri => {
                        setResizeImg(uri);
                    },
                    'blob',
                    200,
                    200,
                );
               
                setImg(event.target.files[0]);
                setCheckImg(true);
            }
        }
    }

    const uploadImage = () => {
        if(checkImg === true){
            setConfirm(true);
            const upLoadImg = storage.ref('avatars/'+ img.name).put(resizeImg);
            upLoadImg.on("state_changed", snapshot => {setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)); setView("visible")}, error => {console.log(error)}, () => {
                storage.ref('avatars')
                           .child(img.name)
                           .getDownloadURL()
                           .then(url => {
                                db.collection("users").doc(user.id).set({
                                   Avatar: url
                                }, {merge:true});

                                dispatch(updateAvatar({
                                    avatar: url
                                }))
                                
                                changeAvatarFriend(url);
                                changeAvatarRequest(url);
                                
                                setThumbNail("");
                                
                                inputFile.current.value = "";
                                setCheckImg(false);
                                setImg(null);
                                setView("hidden");
                                setProgress(0);
                                setConfirm(false);
                                setOpenModalImage(false);
                           })
            })  
        }

    }

    const chooseAvatar = () =>{
        setOpenModalImage(true);
    }

    const closeAvatar = () => {
        setOpenModalImage(false);
        setThumbNail("");
        inputFile.current.value = "";
        setCheckImg(false);
        setImg(null);
    }

    const handleChooseFile = () => {
        inputFile.current.click();
    } 



    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
      };
  
    const handleopenModal = () => {
        setOpenModal(true);
    };
  
    const handlecloseModal = () => {
        setOpenModal(false);
      
    };


    //Friends function
    const addButton = () => {
        db.collection("users").doc(user.id).get().then(doc => {
            setIsAdd(true);
            db.collection("users").doc(other.id).collection("requests").doc(user.id).set({
                Name: user.name,
                Avatar: doc.data().Avatar
            })

            db.collection("users").doc(user.id).collection("add").doc(other.id).set({
                Name: other.name,
                Avatar: other.avatar
            })

        })
        
    }


    const acceptButton = () => {
        db.collection("users").doc(user.id).get().then(doc => {
            setIsFriend(true);
            setIsRequest(false);
            db.collection("users").doc(user.id).collection("friends").doc(other.id).set({
                Name: other.name,
                Avatar: other.avatar
            })

            db.collection("users").doc(other.id).collection("friends").doc(user.id).set({
                Name: doc.data().Name,
                Avatar: doc.data().Avatar
            })

            db.collection("users").doc(other.id).collection("add").doc(user.id).delete();
            db.collection("users").doc(user.id).collection("requests").doc(other.id).delete();

        })
    }


    const declineButton = () => {
        setIsFriend(false);
        setIsRequest(false);
        db.collection("users").doc(other.id).collection("add").doc(user.id).delete();
        db.collection("users").doc(user.id).collection("requests").doc(other.id).delete();
    }

    const removeButton = () => {
        db.collection("users").doc(user.id).collection("friends").doc(other.id).delete().then(() => setIsFriend(false));
        db.collection("users").doc(other.id).collection("friends").doc(user.id).delete();
    }
    
    const clickSelectedFriends = (event, value) => {
        setSelectedFriend(value.id);
        dispatch(storeInfor({
            id: value.id,
            name: value.userinfo.Name,
            avatar: value.userinfo.Avatar
        }))
    }

    const handleOpenFriendModal = (event) => {
        event.preventDefault();
        setFriendModal(true);
    }

    const handleCloseFriendModal = () => {
        setFriendModal(false);
    }


    const renderFriends = (value) => {
        return(
            <Link  key={value.id} to={`/profile/${value.id}`} style={{textDecoration:"none", color:"inherit"}}>
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
        <ProfileContainer>
            <Grid container item xs={12}>
                <Grid container item xs={12} spacing={2}>
                    <Grid item xs={3}>
                        
                    </Grid>
                    <Grid item xs={6}>
                        <ProfileInforContainer>
                            <Grid container item xs={12} style={{marginTop:"50px", width:"100%", height: "100%"}}>
                                <Grid item xs={4}>
                                    <div>
                                    
                                        <Avatar className={classesAvatar.large} style={{cursor:`${profileID === user.id && "pointer"}`}} onClick={profileID === user.id ? chooseAvatar : null} src={profileID === user.id ? user.avatar : other.avatar}/>
                                        <input ref={inputFile} type="file" accept="image/*" onChange={onChangeFile} style={{visibility: "hidden"}}/>
                                        
                                        <Modal
                                            open={openModalImage}
                                            onClose={closeAvatar}
                                            aria-labelledby="simple-modal-title"
                                            aria-describedby="simple-modal-description"
                                        >
                                            <div style={modalStyle} className={classes.paper}>
                                                    <ThumbnailContainer>
                                                    {thumbnail !== "" ? <img className={ upConfirm === true ? "load__thumbnail" : "img__thumbnail"} src={thumbnail}/> : null}
                                                    <CircularProgress  className="load__progress" style={{visibility: view}} value={progressLoading} color="secondary" variant="determinate"/>
                                                        
                                                    </ThumbnailContainer>
                                                    <UploadControl>
                                                        <div>
                                                            <Button onClick={handleChooseFile}>Open</Button>
                                                            <input ref={inputFile} type="file" accept="image/*" onChange={onChangeFile} style={{visibility: "hidden"}}/>
                                                        </div>
                                                        <div>
                                                            <Button onClick={uploadImage}>Upload</Button>
                                                        </div>
                                                    </UploadControl>
                                            </div>
                                        </Modal>
                                    </div>
                                </Grid>
                                <Grid item xs={8}>
                                    {
                                        profileID === user.id ? (
                                            <HeaderProfileContainer>
                                                <h2>{user.name}</h2>
                                                <button onClick={handleopenModal}>Edit Profile</button>
                                                
                                                <Modal
                                                    open={openModal}
                                                    onClose={handlecloseModal}
                                                    aria-labelledby="simple-modal-title"
                                                    aria-describedby="simple-modal-description"
                                                >
                                                    <div style={modalStyle} className={classes.paper}>
                                                        <Grid  container item xs={12}>
                                                            <Grid item xs={4}>
                                                            <div className={listClasses.root}>
                                                                <List component="nav" aria-label="main mailbox folders">
                                                                    <ListItem
                                                                    button
                                                                    selected={selectedIndex === 0}
                                                                    onClick={(event) => handleListItemClick(event, 0)}
                                                                    >
                                                                        <ListItemText primary="Username" />
                                                                    </ListItem>
                                                                    <ListItem
                                                                    button
                                                                    selected={selectedIndex === 1}
                                                                    onClick={(event) => handleListItemClick(event, 1)}
                                                                    >
                                                                        <ListItemText primary="Password" />
                                                                    </ListItem>
                                                                </List>
                                                            </div>
                                                            </Grid>
                                                            <Grid item xs={8}>
                                                                <FormContainer>
                                                                    {selectedIndex === 0 ? 
                                                                        <form>
                                                                            <TextField id="standard-basic" label="Username" style={{marginBottom:"10px"}} value={newName} onChange={(event) => setNewName(event.target.value)}/>
                                                                            <Button type="submit" onClick={changeUserName} disabled={newName.trim() === ""}>Change</Button>
                                                                        </form>   :
                                                                        <form>
                                                                            <TextField id="standard-basic" label="Password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={{marginBottom:"10px"}}/>
                                                                            <Button type="submit" onClick={changePassword} disabled={newPassword.trim() === ""}>Change</Button>
                                                                        </form>
                                                                    }
                                                                </FormContainer>
                                                            </Grid>
                                                        </Grid>
                                                    </div>          
                                                </Modal>

                                            </HeaderProfileContainer>
                                        ) : (

                                            <HeaderProfileContainer>
                                                <h2>{other.name}</h2>
                                                {isRequest === true ? 
                                                    <div style={{marginLeft:"20px"}}>
                                                        <Tooltip title="Accept" placement="top">
                                                            <IconButton onClick={acceptButton}>
                                                                <CheckCircleIcon style={{color:"black", fontSize:"40px"}}/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Decline" placement="top">
                                                            <IconButton onClick={declineButton}>
                                                                <CancelIcon style={{color:"black", fontSize:"40px"}}/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div> 
                                                : isFriend === true ? 
                                                    <Tooltip title="Unfriend" placement="top">
                                                        <IconButton onClick={removeButton} style={{marginLeft:"20px"}}>
                                                            <RemoveCircleIcon style={{color:"black", fontSize:"40px"}}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                : isAdd === true ? <Button disabled style={{marginLeft:"20px"}}>Waiting...</Button>
                                                : 
                                                <Tooltip title="Add" placement="top">
                                                    <IconButton onClick={addButton} style={{marginLeft:"20px"}}>
                                                        <PersonAddIcon style={{color:"black", fontSize:"40px"}}/>
                                                    </IconButton>
                                                </Tooltip>
                                                }
                                            </HeaderProfileContainer>
                                        )
                                    }
                                    
                                    <BodyProfile>
                                        { profileID === user.id ? 

                                            (<p><span style={{fontWeight: "600"}}>{([posts.filter(e => (e.post.userID === user.id) ? true : false ).map(e => e)])[0].length}</span> posts</p>) :
                                            
                                            (<p><span style={{fontWeight: "600"}}>{([posts.filter(e => (e.post.userID === other.id) ? true : false ).map(e => e)])[0].length}</span> posts</p>)
                                        }
                                        <a href=""  onClick={handleOpenFriendModal}>List friends</a>
                                        <Modal
                                            open={friendModal}
                                            onClose={handleCloseFriendModal}
                                            aria-labelledby="simple-modal-title"
                                            aria-describedby="simple-modal-description"
                                        >
                                            <div style={modalStyle} className={classes.paper}>
                                                <h2>Friends ({profileID === user.id ? props.userFriends.length : friendsList.length})</h2>
                                                <List className={listFriendStyles.root}>
                                                    {profileID === user.id ? props.userFriends.map(renderFriends) : friendsList.map(renderFriends)}
                                                </List>
                                            </div>
                                        </Modal>
                                    </BodyProfile>
                                </Grid>
                            </Grid>  
                        </ProfileInforContainer>
                    </Grid>
                    <Grid item xs={3}>

                    </Grid>
                </Grid>
                <Grid container item xs={12}>
                    <Grid item xs={3}>

                    </Grid>
                    <Grid item xs={6}>
                        <PostCollectionContainer>
                            <div>
                                <h5 style={{color: "#bdbdbd"}}>Posts</h5>
                            </div>
                            <div className={gridClass.root}>
                                <ImageList cols={3} gap={3} className={gridClass.gridList}>
                                    {
                                        profileID === user.id ? 
                                        posts.filter(e => (e.post.userID === user.id) ? true : false ).map(e =>(<Post key={e.postid} id={e.postid} post={e.post} user={user} showProfile={true}/>)) :
                                        posts.filter(e => (e.post.userID === other.id) ? true : false ).map(e =>(<Post key={e.postid} id={e.postid} post={e.post} user={user} showProfile={true}/>))
                                    }
                                </ImageList>
                            </div>
                        </PostCollectionContainer>
                    </Grid>
                    <Grid item xs={3}>

                    </Grid>
                </Grid>
            </Grid>
        </ProfileContainer>

    );
}



export default Profile;