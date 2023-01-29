import {createSlice} from '@reduxjs/toolkit';

const initialStateValue = { 
    id: null,
    name: "",
    avatar: "",
    
};

export const userSlice = createSlice({
    name: "user",
    initialState: {value:{
        id: null,
        name: "",
        avatar: "",
        
    }},
    reducers: {
        login: (state, action) => {
            state.value = action.payload;
        },

        logout: (state) => {
            state.value = initialStateValue;
        },

        updateName: (state, action) => {
           state.value = {...state.value};
           state.value.name = action.payload.name;  
        },

        updateAvatar: (state, action) => {
            state.value = {...state.value};
            state.value.avatar = action.payload.avatar; 
        }

    }
});


export const {login, logout, updateName, updateAvatar} = userSlice.actions;
export default userSlice.reducer;