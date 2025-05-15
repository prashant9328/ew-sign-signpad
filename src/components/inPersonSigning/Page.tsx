import React, { useEffect, useRef, useState } from "react";
import { PaginationContainer } from "containers/PaginationContainer";

import { SignatureContainer } from "containers/inPersonSigning/SignatureContainer";
import { TextContainer } from "containers/inPersonSigning/TextContainer";
import { EmailContainer } from "containers/inPersonSigning/EmailContainer";
import { DateContainer } from "containers/inPersonSigning/DateContainer";
import { CheckboxContainer } from "containers/inPersonSigning/CheckboxContainer";
import { PicklistContainer } from "containers/inPersonSigning/PicklistContainer";
import { Dimensions } from "types";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { Dimensions } from "types";
import { useSelector } from "react-redux";
//
import { RootState } from "redux/store";

import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

interface Props {
  page: any;
  dimensions?: Dimensions;
  updateDimensions: ({ width, height }: any) => void;
  allPages: any;
  goToPage: (pageNo: number) => void;
  isFetchingCordinatesData: any;
  setDrawingModalOpen: any;
  handleStartAndScrollElement: any;
  signatureIndicatorRef: any;
  updateViewportHeight : any;
}

export const Page = ({
  page,
  dimensions,
  updateDimensions,
  allPages,
  goToPage,
  isFetchingCordinatesData,
  setDrawingModalOpen,
  handleStartAndScrollElement,
  signatureIndicatorRef,
  updateViewportHeight
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement[]>([]);
  const [width, setWidth] = useState((dimensions && dimensions.width) || 0);
  const [height, setHeight] = useState((dimensions && dimensions.height) || 0);
  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth);
    const [visiblePages, setVisiblePages] = useState<number[]>([]); // Start with Page 1
  
  const [isStartShown, setIsStartShown] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [fieldCounter, setFieldCounter] = useState(1);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
const [isAllFieldsFilled, setIsAllFieldsFilled] = useState(false);
  const [mobileView,setMobileView] = useState(false);
  
const allTextData = useSelector((state: RootState) => state.inPerson.inPersonTextList.allTextData);
const allEmailData = useSelector((state: RootState) => state.inPerson.inPersonEmailList.allEmailData);
const allPicklistData = useSelector((state: RootState)=> state.inPerson.inPersonPicklistList.allPicklistData);
    const allDateData = useSelector((state: RootState) => state.inPerson.inPersonDateList.allDateData);
    // const allCheckboxData = useSelector((state: RootState) => state.checkboxList.allCheckboxData);
  const activeSignatory = useSelector(
    (state: RootState) => state.inPerson.inPersonActiveSignatory.activeSignatory
  );

  const inPersonCoordinatesList = useSelector(
    (state: RootState) => state.inPerson.inPersonCoordinatesList.activeSignatoriesCoordinateData
  );

  const allSignatureData = useSelector((state: RootState) => state.inPerson.inPersonSignatureList)
  useEffect(() => {
    setIsStartShown(true);
    signatureIndicatorRef.current.style.top = `10px`;
    signatureIndicatorRef.current.style.left = `0px`;
  }, [activeSignatory]);

  useEffect(()=>{
    if(window.innerWidth<600){
      setMobileView(true);
    }else{
      setMobileView(false);
    }
  },[])

   const lastPageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  const renderPage = async (p: any, index: number) => {
  if (!p) return;
  const _page = await p;
  const canvas = canvasRef.current[index];
  if (!canvas) return;
  const context = canvas.getContext("2d");
  
  // Get viewport, scale 1, no flipping flag if possible
  const viewport = _page.getViewport({ scale: 1 });
  if (!viewport) return;

  setWidth(viewport.width);
  setHeight(viewport.height);
  updateViewportHeight(viewport.height);

  if (context) {
    // Clear canvas before rendering
    context.clearRect(0, 0, canvas.width, canvas.height);

    // If first page (index 0), flip vertically
    if (index === 0) {
      context.save();
      context.translate(0, viewport.height);
      context.scale(1, -1);
      await _page.render({ canvasContext: context, viewport }).promise;
      context.restore();
    } else {
      await _page.render({ canvasContext: context, viewport }).promise;
    }
    updateDimensions({ width: viewport.width, height: viewport.height });
  }
};

    visiblePages.forEach((pageNumber, index) => {
      if (allPages[pageNumber - 1]) {
        console.log('3' + pageNumber);
        
        renderPage(allPages[pageNumber - 1], index);
      }
    });
  }, [visiblePages, allPages]);

  useEffect(() => {
  if (allPages.length > 0) {
    const pageNumbers = allPages.map((_, idx) => idx + 1);
    setVisiblePages(pageNumbers);
  }
}, [allPages]);



  const updateFieldStatus = () => {
    const requiredTextFieldsFilled = Object.values(allTextData).every(pageData =>
      (pageData as any[]).every(field => !field.isRequired || field.value)
    );
    const requiredEmailFieldsFilled = Object.values(allEmailData).every(pageData =>
      (pageData as any[]).every(field => !field.isRequired || field.value)
    );
    const requiredDateFieldsFilled = Object.values(allDateData).every(pageData =>
      (pageData as any[]).every(field => !field.isRequired || field.value !== 'Invalid date')
    );
    const requiredSignatureFieldsFilled = allSignatureData.encodedImgData !== "";
  
    const allTextFieldsFilled = Object.values(allTextData).every(pageData =>
      (pageData as any[]).every(field => field.value)
    );
    const allEmailFieldsFilled = Object.values(allEmailData).every(pageData =>
      (pageData as any[]).every(field => field.value)
    );
    const allPicklistFieldsFilled = Object.values(allPicklistData).every(pageData =>
      (pageData as any[]).every(field => field.value)
    );
    const allDateFieldsFilled = Object.values(allDateData).every(pageData =>
      (pageData as any[]).every(field => field.value !== 'Invalid date')
    );
  
    const allFieldsFilled = requiredTextFieldsFilled && requiredEmailFieldsFilled && requiredDateFieldsFilled && requiredSignatureFieldsFilled &&
                            allTextFieldsFilled && allEmailFieldsFilled && allDateFieldsFilled;
  
    setIsAllRequiredFieldsFilled(requiredTextFieldsFilled && requiredEmailFieldsFilled && requiredDateFieldsFilled && requiredSignatureFieldsFilled);
    setIsAllFieldsFilled(allFieldsFilled);
  };
  
  useEffect(() => {
    updateFieldStatus();
  }, [allTextData, allDateData, allSignatureData, allEmailData]);
  

  const handleNextClick = () => {
    if (fieldCounter === inPersonCoordinatesList.length) {
      console.log('in person coordinates data length ' + inPersonCoordinatesList.length);
      const allRequiredFieldsFilled = checkAllRequiredFieldsFilled();
      console.log('signature data encoded ' + JSON.stringify(allSignatureData.encodedImgData));
      
      if (allRequiredFieldsFilled) {
        console.log('logggggg' + showPopup);
        
        setShowPopup(true);
      } else {
        handleStartAndScrollElement();
      }
    }else {
      handleStartAndScrollElement();
      console.log('field counter' + fieldCounter);
      
      setFieldCounter(fieldCounter => fieldCounter + 1);
    }
  };

  const checkAllFieldsFilled = () => {
    const allTextFieldsFilled = Object.values(allTextData).every(pageData =>
      (pageData as any[]).every(field => field.value)
    );
    const allDateFieldsFilled = Object.values(allDateData).every(pageData =>
      (pageData as any[]).every(field => field.value !== 'Invalid date')
    );
    const allSignatureFieldsFilled = allSignatureData.encodedImgData !== "";

    return allTextFieldsFilled && allDateFieldsFilled && allSignatureFieldsFilled;
  };

  const checkAllRequiredFieldsFilled = () => {
    const requiredTextFieldsFilled = Object.values(allTextData).every(pageData =>
      (pageData as any[]).every(field => {
        console.log('Text Field:', field);
        return !field.isRequired || field.value;
      })
    );
    const requiredEmailFieldsFilled = Object.values(allEmailData).every(pageData =>
      (pageData as any[]).every(field => {
        return !field.isRequired || field.value;
      })
    );
    const requiredDateFieldsFilled = Object.values(allDateData).every(pageData =>
      (pageData as any[]).every(field => !field.isRequired || field.value !== 'Invalid date')
    );

    let requiredSignatureFieldsFilled = false;
    if(allSignatureData.encodedImgData !== ""){
      requiredSignatureFieldsFilled = true;
    }

    // const requiredSignatureFieldsFilled = Object.values(allSignatureData)
    // const requiredCheckboxFieldsFilled = Object.values(allCheckboxData).every(pageData =>
    //   (pageData as any[]).every(field => !field.isRequired || field.value)
    // );

    console.log('requiredTextFieldsFilled' + requiredTextFieldsFilled);
    console.log('requiredDateFieldsFilled' + requiredDateFieldsFilled);
    

    // return requiredTextFieldsFilled && requiredDateFieldsFilled && requiredCheckboxFieldsFilled;
    return requiredSignatureFieldsFilled && requiredDateFieldsFilled && requiredTextFieldsFilled && requiredEmailFieldsFilled;
  };

  // console.log("width => ", width);
  // console.log("height => ", height);
  console.log("IN PERSON Signing Page....");
  return (
    <>
     <Modal
        isOpen={showPopup}
        onClosed={() => setShowPopup(false)}
        centered
        className="modal-container"
        toggle={() => setShowPopup(false)}
        fade={false}
        size={"large"}
      >
        {/* <ModalHeader>All Required Fields Filled</ModalHeader> */}
        <ModalBody>
          <div>
            <p>All required fields are filled.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => {
              setShowPopup(false);
            }}
            className='btn custom-btn1 text-dark bg-secondary'
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
    <div
    ref={signatureIndicatorRef}
    // className="signature-indicator"
    onClick={(e) => {
      if (isStartShown) {
        setIsStartShown(false);
      }
      handleStartAndScrollElement(e);
    }}
  >
    {isStartShown && !mobileView ? (
      <div className="signature-indicator-inperson">

      Start
    </div>
    ) : (
      <div className="next-hidden"></div>
    )}
  </div>
     <div
            style={mobileView?{position: "relative",overflowY: "scroll",overflowX:"hidden",top: "10px",right: "0",left: "15px",height:"100%"}:{position:"relative",overflowY: "scroll",top:"10px"}}
            className={mobileView?"pdf-viewer-container-inperson-mobile":"pdf-viewer-container-inperson"}
          
          >
            <TransformWrapper
              maxScale={2.5}
              initialScale={deviceWidth < 600 ? 0.6 : 1}
              disabled={deviceWidth <= 600}
              centerZoomedOut
              disablePadding
              wheel={{ disabled: true }}
              doubleClick={{ disabled: true }}
            >
              <TransformComponent>
                <div style={mobileView?{overflow:"scroll",height:"140vh",paddingBottom:"180px"}:{}}>
                  {visiblePages.map((pageNumber, index) => (
                    <div
                      // style={{ position: "relative"}}
                      style={mobileView?{width:"100%",marginBottom:"20px",position:"relative"}:{position:"relative"}}
                      key={pageNumber}
                      ref={
                        pageNumber === visiblePages[visiblePages.length - 1]
                          ? lastPageRef
                          : null
                      }
                    >
                      <canvas
                        ref={(el) => (canvasRef.current[index] = el!)}
                        width={width}
                        height={height}
                        style={{
                          borderRadius: "5px",
                          boxShadow: "0 2px 5px gray",
                          marginBottom: "20px",
                        }}
                      />
                      <SignatureContainer
                        page={allPages[pageNumber - 1]}
                        addDrawing={() => setDrawingModalOpen(true)}
                        isFetchingCordinatesData={isFetchingCordinatesData}
                      />
                      <TextContainer
                        page={allPages[pageNumber - 1]}
                        isFetchingCordinatesData={isFetchingCordinatesData}
                      />
                      <DateContainer
                        page={allPages[pageNumber - 1]}
                        isFetchingCordinatesData={isFetchingCordinatesData}
                      />
                      <CheckboxContainer
                        page={allPages[pageNumber - 1]}
                        isFetchingCordinatesData={isFetchingCordinatesData}
                      />
                      <EmailContainer
                        page={allPages[pageNumber - 1]}
                        isFetchingCordinatesData={isFetchingCordinatesData}
                      />
                      <PicklistContainer
                        page={allPages[pageNumber - 1]}
                        isFetchingCordinatesData={isFetchingCordinatesData}
                      />
                    </div>
                  ))}
    
                  {!isStartShown && (
                    <div
                      ref={signatureIndicatorRef}
                      className="signature-indicator-next"
                      onClick={handleNextClick}
                    >
                      <span>
                        <i className="fa-solid fa-circle-arrow-down"></i>{" "}
                        {isAllFieldsFilled ? "Finish" : "Next"}
                      </span>
                    </div>
                  )}
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
    </>
  );
};
