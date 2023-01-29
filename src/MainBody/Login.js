import React, {useState} from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import instoryLogo from '../img/instory.jpg';
import {db, auth} from '../firebase/firebase';
import { useDispatch, useSelector} from 'react-redux';
import {login} from '../redux/user';
import book_img from '../bookimg/books.png'

const LoginContainer = styled.div`
    > div {
        > img {
            z-index: 10;
            max-width: 500px;
            margin-top: 100px;
            margin-left: 20%;
        }
    }

    > .MuiPaper-root {
        position: fixed;
        top: 30%;
        left: 50%;
        width: 20%;
        padding: 20px;

        > form {
            display: flex;
            flex-direction: column;
            text-align: center;

            > img {
                object-fit:contain; 
                height:40px;
            }

            > div {
                justify-content: space-between;
                margin-top: 10px;
            }
        }
    }

`;

function Login() {

    const user = useSelector((state) => state.user.value);
    const [userName, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    const signUp = (event) => {
        event.preventDefault();
        console.log(userName);
        auth.createUserWithEmailAndPassword(email, password)
            .then((authUser) => {
                db.collection("users").doc(authUser.user.uid).set({
                    Name: userName,
                    Avatar: "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg"
                });
                
                alert("Sign-up successfully!!");
                return authUser.user.updateProfile({
                    displayName: userName
                })
            })
            .catch((error) => 
                alert(error.message)
            );
    } 


    const signIn = (event) => {
        event.preventDefault();
        db.collection("users").get().then(snap => {
            let count = 0;
            for(let i = 0; i < snap.size; i++) {
                if(snap.docs[i].data().Name.trim().toLowerCase() !== userName.trim().toLowerCase()){
                    count++;
                }
            }

            if(count === snap.size){
                alert("Invalid username!");
            }
            else {
                auth.signInWithEmailAndPassword(email, password)
                .then((authUser) => {
                    db.collection("users").doc(authUser.user.uid).get().then(f => {
                        dispatch(login({
                            id: authUser.user.uid,
                            name: userName,
                            avatar: f.data().Avatar,
                        }));
                    });
                    
                })
                .catch((error) => alert(error.message));
            }
        })
    }

    return(
        <LoginContainer>
            <div>
                <img src={book_img}/>
            </div>
            <Paper id="logpage" elevation={3}>
                <form>
                    <img src={instoryLogo}/>
                    <br/>
                    <TextField
                        
                        id="standard-error-helper-text"
                        label="User Name"
                        type="text"
                        
                        value={userName}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <TextField
                        
                        id="standard-error-helper-text"
                        label="Email"
                        type="email"

                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <TextField
                        
                        id="standard-error-helper-text"
                        label="Password"
                        type="password"
                        value={password}
                        
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <div>
                        <Button onClick={signUp}>SIGN UP</Button>
                        <Button type="submit" onClick={signIn}>SIGN IN</Button>
                    </div> 
                </form>
            </Paper>
        </LoginContainer>
    )
}


export default Login;