import {createSlice} from '@reduxjs/toolkit';

const initialStateValue = { 
    id: null,
    name: "",
    avatar: "",
};

export const otherSlice = createSlice({
    name: "other",
    initialState: {value:initialStateValue},
    reducers: {
        storeInfor: (state, action) => {
            state.value = action.payload;
        },
    }
});


export const {storeInfor} = otherSlice.actions;
export default otherSlice.reducer;