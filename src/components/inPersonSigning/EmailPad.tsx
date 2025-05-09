import React, { useEffect, useState } from "react";
import { Icon } from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveElement } from "redux/slices/elementsNavigationHelperReducer";
import { RootState } from "redux/store";
import { emailRegex } from "helpers/constants/validation_constants";

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  editable: boolean;
  textElementIndex: number;
  handleTextChange: Function;
  coordinateId: number;
  isRequired: boolean;
}

export const EmailPad = ({
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
  const [remainingText, setRemainingText] = useState(Number);
  const [maxCharacters, setMaxCharacters] = useState(Number);
  const [isEmailEmpty, setIsEmailEmpty] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);

  useEffect(() => {
    const setMaxChars = () => {
      // let maxChar = Math.floor(((width - 4) / 7) * ((height - 4) / 19));
      let maxChar = Math.floor((width / 8) * (height / 21));

      setMaxCharacters(maxChar);
      setRemainingText(maxChar);
    };
    setMaxChars();
  }, []);

  const handleBlur = (e: any) => {
    const emailValue = e.target.value.trim();

    if (!emailRegex.test(emailValue) && emailValue !== "") {
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
    setIsEmailEmpty(textInputValue ? false : true);
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
        // onClick={addDrawing}
      >
        <div className={editable ? "" : "readonly-container-textarea"}>
          <span
            className="cannot-edit"
            style={editable ? { display: "none" } : {}}
          >
            {" "}
            Cannot Edit{" "}
          </span>

          {/* signatureData */}

          <span style={{ position: "relative" }}>
            {editable && (
              <span
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "0px",
                  backgroundColor: "#1d5d9b",
                  color: "white",
                  zIndex: "1",
                  borderRadius: "0px 0px 5px 5px",
                  width: width,
                  fontSize: "smaller",
                  textAlign: "center",
                }}
              >
                {remainingText} left
              </span>
            )}
            <textarea
              // maxLength={width / 7}
              id="email-input"
              name="email-input"
              maxLength={maxCharacters}
              key={coordinateId}
              placeholder="Click To Enter Email Here..."
              style={
                editable
                  ? {
                      height: height,
                      width: width,
                      resize: "none",
                      overflow: "none",
                    }
                  : {
                      height: height,
                      width: width,
                      resize: "none",
                      overflow: "none",
                      pointerEvents: "none",
                    }
              }
              onClick={(e: any) => {
                if (editable) {
                  dispatch(
                    setActiveElement({ coordinateId, y, x, isRequired })
                  );

                  e.target.focus();
                } else {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                if (editable) {
                  handleTextChange(e, textElementIndex);
                  // setRemainingText(maxCharacters - e.target.value.length);
                } else {
                  e.preventDefault(); // Prevent accidental deletion
                }
              }}
              onBlur={handleBlur}
              onMouseDown={(e) => e.stopPropagation()}
              value={textInputValue}
              className="active-data-container-input-text"
              // className={`
              //     ${
              //       editable
              //         ? elementsNavigationHelperState.activeElementCoordinateId ===
              //           coordinateId
              //           ? "active-data-container-input-text"
              //           : textInputValue
              //           ? "filled-data-container-input-text"
              //           : "empty-data-container-input-text"
              //         : "readonly-data-container-input-text"
              //     }
              //   `}
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
          <span
            id={textInputValue}
            style={{
              position: "absolute",
              fontWeight: "bold",
              color: isEmailValid ? "#00b005" : "#BB2525",
              fontSize: "1rem",
              top: "-20px",
              right: "0px",
            }}
          >
            {isEmailEmpty
              ? ""
              : isEmailValid
              ? "Valid Email"
              : "Invalid Email!"}
          </span>
        </div>
      </div>
    </>
  );
};
