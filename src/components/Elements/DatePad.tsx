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
  editable:boolean;
  textElementIndex: number;
  handleTextChange: Function;
  coordinateId: number;
  isRequired: boolean;
  formattedValue: string;

}

export const DatePad = ({
  x,
  y,
  width,
  height,
  value: textInputValue,
  editable,
  textElementIndex,
  handleTextChange,
  coordinateId,
  isRequired,
}: Props) => {
  const dispatch = useDispatch();

  console.log("textInputValue", textInputValue);
  

  const elementsNavigationHelperState = useSelector(
    (state: RootState) => state.elementsNavigationHelper
  );

  const formatDate = (date: string) => {
    if (moment(date, "MM-DD-YYYY", true).isValid()) {
      return moment(date, "MM-DD-YYYY").format("DD-MM-YYYY");
    }
    return date;
  };

  return (
    <>
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

        <span  style={{ position: "relative" }}>
          <input
            placeholder="Enter Data Here..."
            style={{ height: height, width: width }}
            onChange={(e) => handleTextChange(e, textElementIndex)}
            // value={moment(textInputValue, "DD-MM-YYYY").format("YYYY-MM-DD")}
            value={moment(formatDate(textInputValue), "DD-MM-YYYY").format(
              "YYYY-MM-DD"
            )}
            type="date"
            // className="form-control"
            className={`${
              
              elementsNavigationHelperState.activeElementCoordinateId ===
              coordinateId
                ? "active-data-container-input-date"
                : (textInputValue
                ? "filled-data-container-input-date"
                : "empty-data-container-input-date")
            }`}
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
