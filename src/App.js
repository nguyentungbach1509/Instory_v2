import React, {useEffect, useState} from 'react';
import './App.css';
import Header from './Header/Header';
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
  Redirect,
  Switch
} from 'react-router-dom';
import Home from './MainBody/Home';
import {useSelector, useDispatch} from 'react-redux';
import {login,logout} from './redux/user';
import Login from './MainBody/Login';
import {db,auth} from './firebase/firebase';
import Profile from './MainBody/Profile';
import {changeNotice} from './redux/friends';
import Messenger from './MainBody/Messenger';

function App() {

  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  const [friendRequest, setRequest] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [addFriends, setAddFriend] = useState([]);
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
        if(authUser){
            dispatch(login({
              id: authUser.uid,
              name: authUser.displayName,
              avatar: authUser.photoURL,
            }));
        }
        else {
          dispatch(logout);
        }
    })

    return () => {
        unsubscribe();
    }

  }, []);
  

  useEffect(() => {
    if(user.id){
      const unsubscribe = db.collection("users").doc(user.id).collection("requests").onSnapshot((frd) => {
          if((frd.docs.map(doc => ({id: doc.id, userinfo: doc.data()}))).length > friendRequest.length){
              dispatch(changeNotice({
                noticeRequest: true
              }))
          }
          setRequest(frd.docs.map(doc => ({id: doc.id, userinfo: doc.data()})));
      })

      return () => {
          unsubscribe();
      }
    }
  
}, [user, friendRequest])


useEffect(() => {
  if(user.id){
      const unsubscribe = db.collection("users").doc(user.id).collection("friends").onSnapshot((frd) => {
          setUserFriends(frd.docs.map(doc => ({id: doc.id, userinfo: doc.data()})));
      })

      return () => {
          unsubscribe();
      }
  }
}, [user, userFriends])


useEffect(() => {
  if(user.id){
      const unsubscribe = db.collection("users").doc(user.id).collection("add").onSnapshot((frd) => {
          setAddFriend(frd.docs.map(doc => ({id: doc.id, userinfo: doc.data()})));
      })

      return () => {
          unsubscribe();
      }
  }
}, [user, addFriends])

  

  return (
    <div className="App">
      <Router>
        {
          user.name ? (
            <>
              <Header friendRequest={friendRequest}/>
              <Switch>
                <Route path="/profile/:profileID">
                  <Profile friendRequest={friendRequest} userFriends={userFriends} addFriends={addFriends}/>
                </Route>
                <Route path="/mess">
                  <Messenger userFriends={userFriends}/>
                </Route>
                <Route path="/">
                  <Home userFriends={userFriends}/>
                </Route>
              </Switch>
              
            </>
          ) : (
            <Login/>
          )
        }
      </Router>
        
    </div>
  );
}

export default App;
