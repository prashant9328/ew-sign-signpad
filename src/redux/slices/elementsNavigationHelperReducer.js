import { createSlice } from "@reduxjs/toolkit";

export const elementsNavigationHelperSlice = createSlice({
  name: "elementsNavigationHelperSlice",
  initialState: {
    activePage: 0,
    activeElementCoordinateId: 0,
    y: 0,
    x: 0,
    screenX: 0,
    screenY: 0,
    pageNumber: 0,
    height: 0,
    width: 0,
    isRequired: false,
  },
  reducers: {
    setActiveElement: (state, action) => {
      console.log('payload of element navigation helper', action.payload);
      
      const { coordinateId, y, x, screenX, screenY, pageNumber, height, width, isRequired } = action.payload;

      state.activeElementCoordinateId = coordinateId;
      state.y = y;
      state.x = x;
      state.screenX = screenX;
      state.screenY = screenY;
      state.pageNumber = pageNumber;
      state.height = height;
      state.width = width;
      state.isRequired = isRequired;
    },
    setCurrentPage: (state, action) => {
      const { pageIndex } = action.payload;
      console.log('page index after dispatch' + pageIndex);
      state.activePage = pageIndex;
      console.log('activePage after dispatch' + state.activePage);
    },
    // setInfo: (state, action) => {
    //   const { uuid, uuidTemplateInstance, uuidSignatory } = action.payload;
    //   state.uuid = uuid;
    //   state.uuidSignatory = uuidSignatory;
    //   state.uuidTemplateInstance = uuidTemplateInstance;
    // },
  },
});

// Action creators are generated for each case reducer function
export const { setActiveElement, setCurrentPage } =
  elementsNavigationHelperSlice.actions;

export default elementsNavigationHelperSlice.reducer;
