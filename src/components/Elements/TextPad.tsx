import React, { useEffect } from "react";
import { Icon } from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveElement } from "redux/slices/elementsNavigationHelperReducer";
import { RootState } from "redux/store";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  //
  isRequired: boolean;
}

export const TextPad = ({
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

  const elementsNavigationHelperState = useSelector(
    (state: RootState) => state.elementsNavigationHelper
  );
  const [remainingText,setRemainingText]=useState(Number);
  const [maxCharacters,setMaxCharacters]=useState(Number);
  const [isActive, setIsActive] = useState(false);

  useEffect(()=>{
    const setMaxChars=()=>{
      let maxChar = Math.floor(((width) / 8) * ((height) / 21));
      setMaxCharacters(maxChar);
      setRemainingText(maxChar);
    }
    setMaxChars();
  },[])
  return (
    <>
    <ToastContainer />
      <div
        style={{
          // backgroundColor: "#ffe185",
          position: "absolute",
          height: height,
          width: width,
          top: y,
          left: x,
          right: 0,
          // overflow: none
          bottom: 0,
          borderRadius: 5,
        }}
        // onFocus={()=>setIsActive(true)}
        // onMouseEnter={()=>setIsActive(true)}
        // onMouseLeave={()=>setIsActive(false)}
        // onClick={addDrawing}
        
      >
        <div className={editable?"":"readonly-container-textarea"}>
          <span className="cannot-edit" style={editable?{display:'none'}:{}} > Cannot Edit </span>
        
        {/* signatureData */}

        <span style={{ position: "relative" }}>
          {/* {editable &&
            <span style={isActive?{display:'none'}:{position:"absolute",top:'15px',right:"0px",backgroundColor:'#1d5d9b',color:'white',borderRadius:'0px 0px 5px 5px',width:width,fontSize:"smaller",textAlign:"center"}}>
              {remainingText} left
            </span>
          } */}
          <textarea
            // maxLength={width / 7}
            maxLength={maxCharacters}
            key={coordinateId}
            placeholder="Click To Enter Text Here..."
            style={editable?{ height: height, width: width ,resize:'none',overflow:"none"}:{height: height, width: width ,resize:'none',overflow:"none",pointerEvents:"none"}}
            onClick={(e: any) => {
              if(editable){

                dispatch(setActiveElement({ coordinateId, y, x, isRequired }));
  
                e.target.focus();
              }else{
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              if (editable) {
                handleTextChange(e, textElementIndex);
                setRemainingText(maxCharacters - e.target.value.length);
                console.log('remaining text ' + remainingText);
                
              if(remainingText === 0){
                toast.error(`You can only add ${maxCharacters} in text field`, {
                  position: "top-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
              }
              } else {
                e.preventDefault(); // Prevent accidental deletion
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}

            value={textInputValue}
            className="active-data-container-input-text"
          //   className={`
          //   ${
          //     editable?(
          //     elementsNavigationHelperState.activeElementCoordinateId ===
          //     coordinateId
          //       ? "active-data-container-input-text"
          //       : (textInputValue
          //       ? "filled-data-container-input-text"
          //       : "empty-data-container-input-text")):"readonly-data-container-input-text"
          //   }
          // `}

          readOnly={editable ? false : true}
          />

          {/* isRequired */}
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
