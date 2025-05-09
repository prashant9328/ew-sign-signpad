import { createSlice, current } from "@reduxjs/toolkit";

export const dateSlice = createSlice({
  name: "dateSlice",
  initialState: {
    allDateData: {},
  },
  reducers: {
    setDateData: (state, action) => {
      const { allDateData } = action.payload;
      console.log('all date data in date reducer', allDateData);
      console.log('state in date reducer', state.allDateData);
      
      state.allDateData = allDateData;
    },
    changeDateData: (state, action) => {
      const { elementIndex, textValue, currentPageNo } = action.payload;
      const tempData = current(state.allDateData)[currentPageNo];
      console.log('text value in date reducer', textValue);
      console.log('element index in date reducer', elementIndex);
      
      state.allDateData[currentPageNo] = tempData.map((item) => {
        if (elementIndex === item.index) {
          return {
            ...item,
            value: textValue,
          };
        }
        return item;
      });
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDateData, changeDateData } = dateSlice.actions;

export default dateSlice.reducer;
