import React from "react";
import { Icon } from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";

//
import { setActiveElement } from "redux/slices/elementsNavigationHelperReducer";

//
import { RootState } from "redux/store";

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  addDrawing: any;
  signatureEncodedImgData: string;
  // signatureData: any;
  coordinateId: number;
}

export const SignaturePad = ({
  x,
  y,
  width,
  height,
  addDrawing,
  signatureEncodedImgData,
  coordinateId,
}: // signatureData,
Props) => {
  const dispatch = useDispatch();

  const elementsNavigationHelperState = useSelector(
    (state: RootState) => state.elementsNavigationHelper
  );

  return (
    <>
      <div
        className="signature-pad-container"
        style={{
          height: height,
          width: width,
          top: y,
          left: x,
        }}
        onClick={() => {
          addDrawing();
          dispatch(setActiveElement({ coordinateId, y, x }));
        }}
      >
        {/* signatureData */}
        {signatureEncodedImgData ? (
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
              flexDirection: "column",
            }}
            className={`${
              elementsNavigationHelperState.activeElementCoordinateId ==
              coordinateId
                ? "active-data-container-signature"
                : "filled-data-container-signature"
            }`}
          >
            <img
              src={signatureEncodedImgData}
              // style={{ maxHeight: 200, maxWidth: 200 }}
              alt={"imgg"}
              style={{ width: "80%", padding: 5 }}
            />
          </span>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              // flexDirection: "column",
            }}
            className="active-data-container-signature"
            // className={
            //   elementsNavigationHelperState.activeElementCoordinateId ==
            //   coordinateId
            //     ? "active-data-container-signature"
            //     : "empty-data-container-signature"
            // }
          >
            <div>Signature</div>
            {/* <div>
              <Icon name="signup" size="small" />
            </div> */}

            <h3
              style={{ position: "absolute", right: "4px", top: 0 }}
              className="text-light"
            >
              *
            </h3>
          </div>
        )}
      </div>
    </>
  );
};
