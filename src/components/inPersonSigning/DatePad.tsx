import React from "react";
import { Icon } from "semantic-ui-react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

//
import { setActiveElement } from "redux/slices/elementsNavigationHelperReducer";
import { RootState } from "redux/store";

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  textElementIndex: number;
  handleTextChange: Function;
  editable:boolean;
  isRequired:boolean;
  coordinateId: number;
}

export const DatePad = ({
  x,
  y,
  width,
  height,
  value: textInputValue,
  textElementIndex,
  handleTextChange,
  editable,
  isRequired,
  coordinateId,
}: Props) => {
  const dispatch = useDispatch();

  const elementsNavigationHelperState = useSelector(
    (state: RootState) => state.elementsNavigationHelper
  );

  console.log("textInputValue Datepad", textInputValue);
  

  return (
    <>
    {/*
      <div
        style={{
          // backgroundColor: "#ffe185",
          position: "absolute",
          height: height,
          width: width,
          top: y,
          left: x,
          right: 0,
          bottom: 0,
          borderRadius: 5,
        }}
      >
        <input
          placeholder="Enter Data Here..."
          style={{ height: height, width: width }}
          onChange={(e) => handleTextChange(e, textElementIndex)}
          value={moment(textInputValue, "DD-MM-YYYY").format("YYYY-MM-DD")}
          type="date"
          // className="form-control"
          className={`${
            elementsNavigationHelperState.activeElementCoordinateId ===
            coordinateId
              ? "active-data-container-input-date"
              : textInputValue
              ? "filled-data-container-input-date"
              : "empty-data-container-input-date"
          }`}
          onClick={(e: any) => {
            e.currentTarget.showPicker();
            dispatch(setActiveElement({ coordinateId, y, x }));
          }}
        />
      </div>
    */}
    <div
            style={{
              // backgroundColor: "#ffe185",
              position: "absolute",
              height: height,
              width: width,
              top: y,
              left: x,
              right: 0,
              bottom: 0,
              borderRadius: 5,
            }}
          >
            <div className={editable?"":"readonly-date-container"}>
          
            <span className={editable?"":"readonly-date"} style={{display:"none"}}>Cannot Edit</span>
    
            <span style={{ position: "relative" }}>
              <input
                placeholder="Enter Data Here..."
                style={{ height: height, width: width }}
                onChange={(e) => handleTextChange(e, textElementIndex)}
                value={moment(textInputValue, "DD-MM-YYYY").format("YYYY-MM-DD")}
                // value={moment(formatDate(textInputValue), "DD-MM-YYYY").format(
                  // "YYYY-MM-DD"
                // )}
                type="date"
                // className="form-control"
                className="active-data-container-input-date"
                // className={`${
                  
                //   elementsNavigationHelperState.activeElementCoordinateId ===
                //   coordinateId
                //     ? "active-data-container-input-date"
                //     : (textInputValue
                //     ? "filled-data-container-input-date"
                //     : "empty-data-container-input-date")
                // }`}
                onClick={(e: any) => {
                  if(editable){
                    e.currentTarget.showPicker();
                    dispatch(setActiveElement({ coordinateId, y, x, isRequired }));
                  }else{
                    e.preventDefault();
                  }
                }}
              />
              {isRequired && (
                <span
                  style={{
                    position: "absolute",
                    fontWeight: "bold",
                    color: "#BB2525",
                    fontSize: "1.2rem",
                    top: "-10px",
                    right: "-10px",
                  }}
                >
                  *
                </span>
              )}
            </span>
          </div>
          </div>
    </>
  );
};
