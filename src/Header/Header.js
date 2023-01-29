import React, {useState, useRef, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
  Redirect,
  Switch
} from 'react-router-dom';
import firebase from 'firebase';
import styled from 'styled-components';
import instoryLogo from '../img/instory.jpg';
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import PublishIcon from '@material-ui/icons/Publish';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import Avatar from '@material-ui/core/Avatar';
import GroupIcon from '@material-ui/icons/Group';
import Popover from '@material-ui/core/Popover';
import {auth,db,storage} from '../firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import {logout} from '../redux/user';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import { storeInfor } from '../redux/other';
import { changeNotice } from '../redux/friends';


const CssTextField = withStyles({
    root: {
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'lightgray',
        },
        '&:hover fieldset': {
          borderColor: 'black',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'black',
        },
      },
      
      '& .MuiInputBase-root': {
           height: '30px',  
      }
    },
})(TextField);

const searchList = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
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


  
const HeaderContainer = styled.div`

  background-color: white;
  padding: 15px;
  border-bottom: 1px solid #dbdbdb;
  display: flex;
  justify-content: space-between;
  align-items: center;

  > a {
    > img {
      object-fit: contain;
      background-color: white;
      width: 110px;
      height: 31px;
      margin-left: 20px;

      &:hover {
        cursor: pointer;
      }
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }
  

`;


const HeaderSearchContainer = styled.div`
  > .search__result {
      position:absolute;
      z-index:100;
      width: 100%;
      max-width: 255px;
      overflow-y: scroll;
      height: 80px;
      top:50px;
    }

`;


const HeaderMenuContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 50px;

  > .MuiAvatar-root {
      margin-left: 10px;

      &:hover {
        cursor: pointer;
      }
  }

  a { 
      text-decoration: none;
      color: inherit;
   }
`;


const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;

  > a {

    > button {
        width: 100%;
        border: none;
        padding: 10px 20px;
        background-color: white;
        font-weight: 600;

      &:hover {
        background-color: whitesmoke;
        cursor: pointer;
      }
    }
  }

  > button {
      border: none;
      padding: 10px 20px;
      background-color: white;
      font-weight: 600;

      &:hover {
        background-color: whitesmoke;
        cursor: pointer;
      }
  }
`;


const UploadThumbnailContainer = styled.div`
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


const UploadCaptionContainer = styled.div`

  >.MuiTextField-root {
    width: 100%;
  }

`;


const UploadControlContainer = styled.div`
  display:flex;
  justify-content: space-between;
  margin-top: 10px;
`;


function Header(props) {

  //Redux user
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const friendsNotice = useSelector((state) => state.friends.value);
  

  const [anchorEl, setAnchorEl] = useState(null);
  const requestStyles = requestList();
  
  //Modal upload post img
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const [openModal, setOpenModal] = React.useState(false);
  const[img, setImg] = useState(null);
  const [updateConfirm, setConfirm] = useState(false);
  const inputFile = useRef(null);
  const [checkImg, setCheckImg] = useState(false);
  const [thumbnail, setThumbNail] = useState("");
  const [progress, setProgress] = useState(0);
  const [viewLoad, setViewLoad] = useState("hidden");
  const [caption, setCaption] = useState("");

  //Searching users
  const searchStyles = searchList();
  const [search, setSearch] = useState("");
  const [searchResult, setResult] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);


 
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const [requestModal, setRequestModal] = useState(false);


  const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
      setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const logOut = () => {
    auth.signOut();
    dispatch(logout());
    setAnchorEl(null);
  }


  const handleopenModal = () => {
      setOpenModal(true);
  };

  const handlecloseModal = () => {
      setOpenModal(false);
      setThumbNail("");
      inputFile.current.value = "";
      setCheckImg(false);
      setImg(null);
  };


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
          
            setImg(event.target.files[0]);
            setCheckImg(true);
        }
    }
  }

  const handleChooseFile = () => {
    inputFile.current.click();
  }


  const uploadImage = () => {
    if(checkImg === true){
        setConfirm(true);
        const upLoadImg = storage.ref('imgs/'+ img.name).put(img);
        upLoadImg.on("state_changed", snapshot => {setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)); setViewLoad("visible")}, error => {console.log(error)}, () => {
            storage.ref('imgs')
                      .child(img.name)
                      .getDownloadURL()
                      .then(url => {
                            db.collection("posts").add({
                                userID: user.id,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                username: user.name,
                                url: url,
                                caption: caption
                            })
                            
                            
                            setThumbNail("");
                            
                            inputFile.current.value = "";
                            setCheckImg(false);
                            setImg(null);
                            setCaption("");
                            setViewLoad("hidden");
                            setProgress(0);
                            setConfirm(false);

                      })
        })  
          
    }
    
  }

  const searchTyping = (event) => {
    let temp = [];
    let word = event.target.value.toLowerCase();
    setSearch(event.target.value);
    db.collection("users").where("Name", "!=" , user.name).get().then(snap => {
        for(let i = 0; i < snap.size; i++) {
            if(word.trim() !== ""){
                if(snap.docs[i].data().Name.toLowerCase().includes(word) === true){
                    temp.push({id:snap.docs[i].id, userinfo: snap.docs[i].data()});
                }
            }
        }

        setResult(temp);
    })

  }


  const listResultClick = (event, value) => {
    setSelectedResult(value.id);
    dispatch(storeInfor({
      id: value.id,
      name: value.userinfo.Name,
      avatar: value.userinfo.Avatar
    }));
    setSearch("");
  } 

  const renderResult = (value) => {
    return(
      <Link key={value.id} to={`/profile/${value.id}`}>
        <div>
          <ListItem 
              alignItems="flex-start"
              button
              selected={selectedResult === value.id}
              onClick={(event) => listResultClick(event, value)}
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
  
  const openRequestModal = () => {
    setRequestModal(true);
    dispatch(changeNotice({
      noticeRequest: false
    }));
  }

  const closeRequestModal = (event, value) => {
    setRequestModal(false);
    dispatch(storeInfor({
      id: value.id,
      name: value.userinfo.Name,
      avatar: value.userinfo.Avatar
    }));
  }

  const renderRequest = (value) => {
    return(
      <Link  key={value.id} to={`/profile/${value.id}`} style={{textDecoration:"none", color:"inherit"}}>
        <div>
            <ListItem 
                alignItems="flex-start"
                button
                selected={selectedRequest === value.id}
                onClick={(event) => closeRequestModal(event, value)}
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

  return(
      <HeaderContainer>
        <Link to="/">
          <img
                src={instoryLogo}
            />
        </Link>
          <HeaderSearchContainer>
              <CssTextField
                  style={{backgroundColor: "whitesmoke"}}
                  id="outlined-size-small"
                  placeholder="Search..."
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={searchTyping}
                  InputProps={{
                      startAdornment: (
                      <InputAdornment position="start">
                          <SearchIcon />
                      </InputAdornment>
                      )
                  }}
              />
              <Paper elevation={3} className="search__result" style={search.trim() !== "" ? {visibility: "visible"} : {visibility:"hidden"}}>
                  <List className={searchStyles.root}>
                      {searchResult.map(renderResult)}
                  </List>
              </Paper>
          </HeaderSearchContainer>
          <HeaderMenuContainer>
              <Link to="/">
                <IconButton><HomeIcon style={{fontSize:"35px", color:"black"}}/></IconButton>
              </Link>         
              <IconButton onClick={handleopenModal}><PublishIcon style={{fontSize:"35px", color:"black"}}/></IconButton>
              <Modal
                open={openModal}
                onClose={handlecloseModal}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div style={modalStyle} className={classes.paper}>
                        <UploadThumbnailContainer>
                            {thumbnail !== "" ? <img className={ updateConfirm === true ? "load__thumbnail" : "img__thumbnail"} src={thumbnail}/> : null}
                            <CircularProgress style={{visibility: viewLoad}} value={progress} color="secondary" variant="determinate"/>
                            
                        </UploadThumbnailContainer>
                        <UploadCaptionContainer>
                            <TextField
                                id="standard-multiline-static"
                                label="Enter caption..."
                                multiline
                                rows={4}
                                value={caption}
                                onChange={(event) => setCaption(event.target.value)}
                            />
                        </UploadCaptionContainer>
                        <UploadControlContainer>
                            <div>
                                <Button onClick={handleChooseFile}>Open</Button>
                                <input ref={inputFile} type="file" accept="image/*" onChange={onChangeFile} style={{visibility: "hidden"}}/>
                            </div>
                            <div>
                                <Button onClick={uploadImage}>Upload</Button>
                            </div>
                        </UploadControlContainer>
                </div>
              </Modal>
              
              <Link to="/mess">
                <IconButton><QuestionAnswerIcon style={{fontSize:"35px", color:"black"}}/></IconButton>
              </Link>
              <IconButton onClick={openRequestModal}><GroupIcon style={friendsNotice.noticeRequest === true ? {fontSize: "35px", color: "darkgray"} : {fontSize:"35px", color: "black"}}/></IconButton>
              <Modal
                  open={requestModal}
                  onClose={() => setRequestModal(false)}
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
              >
                  <div style={modalStyle} className={classes.paper}>
                      <List className={requestStyles.root}>
                          {props.friendRequest.map(renderRequest)}
                      </List>
                  </div>
              </Modal>
              <Avatar aria-describedby={id} onClick={handleClick} src={user.avatar}/>
              <Popover
                id={id}
                style={{top:"5px"}}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
                }}
                transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
                }}
            >
                <PopoverContent>
                  <Link to={`/profile/${user.id}`}>
                    <button onClick={handleClose}>Profile</button>
                  </Link>
                  <Link to="/">
                    <button onClick={logOut}>Logout</button>
                  </Link>
                </PopoverContent>
            </Popover>
          </HeaderMenuContainer>
      </HeaderContainer>
  )
}


export default Header;