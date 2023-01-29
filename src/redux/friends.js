import {createSlice} from '@reduxjs/toolkit';

const initialStateValue = { 
    noticeRequest: false
};

export const friendsSlice = createSlice({
    name: "friends",
    initialState: {value:initialStateValue},
    reducers: {
        changeNotice: (state, action) => {
            state.value = {...state.value};
            state.value.noticeRequest = action.payload.noticeRequest;
        }
       
    }
});


export const {changeNotice} = friendsSlice.actions;
export default friendsSlice.reducer;