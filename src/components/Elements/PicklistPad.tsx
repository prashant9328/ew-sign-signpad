import { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  value: String;
  pickListArray: Array<String>;
  // picklistTitle: string;
  editable: boolean;
  picklistElementIndex: number;
  coordinateId: number;
  isRequired: boolean;
  handlePicklistValueChange: Function;
}

export const PicklistPad = ({
  x,
  y,
  width,
  height,
  editable,
  value: selectedValue = "",
  pickListArray,
  // picklistTitle = "No title",
  handlePicklistValueChange,
  picklistElementIndex,
  coordinateId,
  isRequired,
}: Props) => {
  const [picklistOpen, setPicklistOpen] = useState(false);
  const toggleDropDown = () => setPicklistOpen((prevState) => !prevState);

  // const pickListArray = [
  //   "val",
  //   "testing",
  //   "this is string",
  //   "this is testing the length",
  //   "Subtle but surprisingly strong",
  //   "An unconventional yet clever move",
  // ];

  return (
    <>
      <div
        style={{
          position: "absolute",
          minHeight: height,
          minWidth: width,
          height : "min-content",
          width : "min-content",
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

          <span style={{ position: "relative" }}>
            <Dropdown
              isOpen={picklistOpen}
              toggle={toggleDropDown}
              direction={"down"}
            >
              <DropdownToggle
                caret
                style={{ backgroundColor: "#22a699",color:'white', height: height, width : width,padding: 0 }}
                color="black"
                className="fw-bold"
                
              >
                <span style={{fontSize : "smaller",}}>

                {selectedValue?selectedValue:"Select Options"}
                </span>
              </DropdownToggle>
              <DropdownMenu style={{ minWidth: width }}>
                {pickListArray.map((ListItem: String, index: Number) => {
                  return (
                    <DropdownItem
                    key={`${index}`}
                      onClick={() => {

                        selectedValue = ListItem;

                        setTimeout(()=>{
                          handlePicklistValueChange(
                            picklistElementIndex,
                            selectedValue
                          );
                        },1)
                      }}
                    >
                      {ListItem}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
          </span>
        </div>
      </div>
    </>
  );
};
