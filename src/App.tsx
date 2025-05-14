import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import { AxiosResponse } from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { Container } from "semantic-ui-react";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";

//
import { MenuBar } from "./components/MenuBar";
import { DrawingModal } from "./modals/components/DrawingModal";
import { usePdf, Pdf } from "./hooks/usePdf";
import { useUploader, UploadTypes } from "./hooks/useUploader";

//
import { setInfo, setSalesforceOrgId } from "./redux/slices/basicInfoReducer";
import { setCoordinateData } from "./redux/slices/coordinatesReducer";
import { setRecordData } from "./redux/slices/coordinatesReducer";
import { setUserData } from "./redux/slices/externalUserReducer";
import { setAllPreviousSignatures } from "./redux/slices/signatureReducer";
import {
  setActiveElement,
  setCurrentPage,
} from "./redux/slices/elementsNavigationHelperReducer";
import {
  setTotalNoOfFields,
  setCompletedNoOfFields,
} from "./redux/slices/allFinalDataReducer";

//
import { fetchIpInfo } from "./utils/fetchIpInfo";
import { AuditTrailModal } from "./modals/components/AuditTrailModal";

import OtpModal from "./modals/components/OtpModal";
//
import { Page } from "./components/Page";
import AlreadySignedComponent from "./components/Common/AlreadySignedComponent";
import Loading from "./components/Common/Loading";

//
import { postRequest } from "helpers/axios";
import { API_ROUTES } from "helpers/constants/apis";

//
import { RootState } from "redux/store";

//
import "semantic-ui-css/semantic.min.css";
import "./App.css";

type PageElement = {
  pageNo: number;
  x: number;
  y: number;
  screenY: number;
  screenX: number;
}

const App: React.FC = () => {
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [isFetchingCordinatesData, setIsFetchingCordinatesData] =
    useState(true);

  const [originalOtpValue, setOriginalOtpValue] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isAlreadySign, setIsAlreadySign] = useState(false);
  const [isOtpVerificationDone, setIsOtpVerificationDone] = useState(true);
  const [isResendOtp, setIsResendOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userErrorMsg, setUserErrorMsg] = useState("");
  const [isAuditHistoryShown, setIsAuditHistoryShown] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [mobileView,setMobileView]=useState(false);
  //
  const signatureIndicatorRef = useRef<any>(null);
  const visitedFieldsRef = useRef<Set<number>>(new Set());

  //
  const currentReduxState = useSelector((state: RootState) => state);
  const allCoordinateDataWithCordinates = useSelector(
    (state: RootState) => state.coordinatesList.allCoordinateData
  );
  const elementsNavigationData = useSelector(
    (state: RootState) => state.elementsNavigationHelper
  );

   const allTextData = useSelector(
      (state: RootState) => state.textList.allTextData
    );
    const allDateData = useSelector(
      (state: RootState) => state.dateList.allDateData
    );
    const allCheckboxData = useSelector(
      (state: RootState) => state.checkboxList.allCheckboxData
    );
    const allSignatureData = useSelector(
      (state: RootState) => state.signatureList
    );

  const {
    file,
    initialize,
    pageIndex,
    isMultiPage,
    isFirstPage,
    isLastPage,
    currentPage,
    isSaving,
    setIsSaving,
    savePdf,
    previousPage,
    nextPage,
    setDimensions,
    name,
    dimensions,
    pages,
    goToPage,
  } = usePdf();

  //
  const dispatch = useDispatch();

  //

  const initializePageAndAttachments = (pdfDetails: Pdf) => {
    initialize(pdfDetails);
    const numberOfPages = pdfDetails.pages.length;
  };

  const {
    inputRef: pdfInput,
    handleClick: handlePdfClick,
    isUploading,
    onClick,
    upload: uploadPdf,
  } = useUploader({
    use: UploadTypes.PDF,
    afterUploadPdf: initializePageAndAttachments,
  });

  useEffect(()=>{
    if(window.innerWidth<595){
      setMobileView(true);
    }else{
      setMobileView(false);
    }
  },[])

  const handleSignRejection = async (commentText: string) => {
    const thankYouContainer: HTMLElement = document.getElementById(
      "thankyou-container"
    ) as HTMLElement;
    try {
      setIsSaving(true);

      thankYouContainer.innerHTML = `<div
      style="
        position: fixed;
        z-index: 5;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: white;
      "
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          flex-direction: column
        "
      >
        <img src="/loading.gif" class="loading-logo-gif" />
    
        <span class="mb-3"><b>Processing Your Request </b></span>
      </div>
    </div>`;

      const tempState = currentReduxState as any;

      const signatoryUUID = tempState.basicInfoData.uuidSignatory;

      const locationData = await fetchIpInfo();

      const {
        data: { data: responseData },
      }: AxiosResponse = await postRequest(
        API_ROUTES.COMMON_HANDLESIGNREJECTION,
        false,
        {
          uuid_signatory: signatoryUUID,
          rejectionReason: commentText,
          location: locationData,
        }
      );

      localStorage.clear();

      thankYouContainer.innerHTML = `<div
      style="
        position: fixed;
        z-index: 5;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #F4EDE4;
        display:flex;
        justify-content:center;
      "
    >
      <div class="parent-container-reject">
      <div class="child-container-reject">
        <div class="img-container-reject">
          <img
            src="/reject.svg"
            alt="reject svg"
            class="img-size-reject"
          />
          <p class="congrats-text-reject">
          Oops! you have rejected signature
          </p>
          <p class="closer-text-reject">
          We regret to see that you had rejected for signature. If this happens by mistake then please notify admin.
          </p>
        </div>

        <div class="footer-parent-reject">
          <div class="footer-child-reject">
            <span>Learn more about </span>
            <a
              href="https://www.eruditeworks.com/ew-sign/demo/"
              class="span-one"
            >
              EWSIGN
            </a>
          </div>
        </div>
      </div>
    </div>
   
    </div>`;
    } catch (err) {
      console.log(err);
      alert("something want wrong please try again");
      thankYouContainer.innerHTML = "";
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePdf = () => {
    const tempState = currentReduxState as RootState;
    const { coordinatesList, signatureList, textList, dateList, checkboxList, emailList, pickList } =
      currentReduxState as RootState;

    console.log("DataList", dateList);
    console.log("DataList", JSON.stringify(dateList));
    const signatureData = signatureList.allSignatureData;
    const textData = textList.allTextData;
    const dateData = dateList.allDateData;
    const checkboxData = checkboxList.allCheckboxData;
    const emailData = emailList.allEmailData;
    const picklistData = pickList.allPicklistData;   

    for (const indexNo in signatureData) {
      for (let i = 0; i < signatureData[indexNo].length; i++) {
        const innerElement = signatureData[indexNo][i];

        if (
          innerElement.isRequired &&
          signatureList.encodedImgData.length === 0
        ) {
          // alert("Please Fill Signature");
          handleRequiredFieldLogic(innerElement);

          return;
        }
      }
    }
    for (const indexNo in textData) {
      for (let i = 0; i < textData[indexNo].length; i++) {
        const innerElement = textData[indexNo][i];

        if (innerElement.isRequired && innerElement.value.length === 0) {
          // alert("Please Fill All Text Data");
          handleRequiredFieldLogic(innerElement);

          return;
        }
      }
    }
    for (const indexNo in dateData) {
      for (let i = 0; i < dateData[indexNo].length; i++) {
        const innerElement = dateData[indexNo][i];

        if (innerElement.isRequired && innerElement.value.length === 0) {
          // alert("Please Fill All Date Data");
          handleRequiredFieldLogic(innerElement);

          return;
        }
      }
    }
    for (const indexNo in checkboxData) {
      for (let i = 0; i < checkboxData[indexNo].length; i++) {
        const innerElement = checkboxData[indexNo][i];

        if (innerElement.isRequired && innerElement.value === false) {
          // alert("Please Check All Checkbox Data");
          handleRequiredFieldLogic(innerElement);

          return;
        }
      }
    }
    for (const indexNo in emailData) {
      for (let i = 0; i < emailData[indexNo].length; i++) {
        const innerElement = emailData[indexNo][i];

        if (innerElement.isRequired && innerElement.value === false) {
          // alert("Please Check All Checkbox Data");
          handleRequiredFieldLogic(innerElement);

          return;
        }
      }
    }
    for (const indexNo in picklistData) {
      for (let i = 0; i < picklistData[indexNo].length; i++) {
        const innerElement = picklistData[indexNo][i];

        if (innerElement.isRequired && innerElement.value === false) {
          handleRequiredFieldLogic(innerElement);

          return;
        }
      }
    }

    // here changed
    if (coordinatesList.allCoordinateData.length === 0) {
      alert("oops there is no fields are seems");

      return;
    }

    console.log("Save pdf called : ", tempState);

    savePdf(tempState);
  };

  //
  const handleRequiredFieldLogic = (innerElement) => {
    try {
      document.getElementsByClassName(
        "signature-indicator"
      )[0].innerHTML = `<span>
      <i class="fa-solid fa-circle-arrow-down"></i> Required
    </span>`;

      const { coordinateId, x, y, screenX, screenY, pageNumber, width, height, isRequired, value } = innerElement;

      dispatch(setActiveElement({ coordinateId, y, x, screenX, screenY, pageNumber, width, height, isRequired, value }));
    } catch (err) {
      console.log(err);
    }
  };

  //
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // const visitedFields = new Set<Number>();
  const handleStartAndScrollElement = (field? :any) => {
    try {
      console.log('field targeted' + JSON.stringify(field));

      const targetField = field || elementsNavigationData;
      console.log('targeted fields' + JSON.stringify(targetField));
      const pageNumber = targetField.pageNo;
      const { activeElementCoordinateId, screenY } = targetField;
      console.log("activeElementCoordinateId", activeElementCoordinateId);
      console.log("pageNumber", pageNumber);
      // console.log('screenYyyy' + screenY);
      
      console.log('all text data in app' + JSON.stringify(allTextData));
      
      
      let nextIndex;
      console.log("next index after intialization" + nextIndex);

      if(field){
        nextIndex =
        allCoordinateDataWithCordinates.findIndex(
          (item: any) => item.coordinateId === activeElementCoordinateId
        );
      }
      else {
          nextIndex =
        allCoordinateDataWithCordinates.findIndex(
          (item: any) => item.coordinateId === activeElementCoordinateId
        ) + 1;
      }
      // console.log('all cooordinate data' + JSON.stringify(allCoordinateDataWithCordinates));

      console.log("next index " + (nextIndex - 1));
      console.log('all coordiates data with coordinates length ' + allCoordinateDataWithCordinates.length);
      

      const indexNo =
        activeElementCoordinateId === 0 ||
        nextIndex - 1 === allCoordinateDataWithCordinates.length
          ? 0
          : nextIndex;

      console.log("index number " + indexNo);

      const currentElementData: any = allCoordinateDataWithCordinates[indexNo];

      console.log("currentElementData 418", JSON.stringify(currentElementData));

      // if (window.innerWidth > 550) {
      //   console.log('@@@ innerWidth more than 500...');
      //   console.log('@@@ pageNumber..' + currentElementData.pageNo);
      //   console.log("viewPortHeight", viewportHeight);
        
      //   const scrollY =
      //     currentElementData.pageNo * viewportHeight + currentElementData.y - 200;
      
      //   console.log('Calculated scrollY:', scrollY);
      
      //   console.log('Before scroll:', window.scrollY);

      //   window.scroll({
      //     top: scrollY,
      //     behavior: "smooth",
      //   });
        
      //   setTimeout(() => {
      //     console.log('After scroll:', window.scrollY);
      //   }, 1000);
      // } else {
      //   console.log('@@@ innerWidth less than 500...');
      //   window.scroll({
      //     top: currentElementData.y,
      //     behavior: "smooth",
      //   });
      // }
      
      const container = document.getElementById("pdfViewerContainer");
      console.log("container",container);

if (container) {
  const scrollY = currentElementData.pageNo * viewportHeight + currentElementData.y + 200;
  console.log("Calculated scrollY:", scrollY);

  container.scrollTo({
    top: scrollY,
    behavior: "smooth",
  });
} else {
  console.warn("PDF scroll container not found.");
}

      //  if (window.innerWidth > 550) {
      //   console.log('@@@ innerWidth more than 500...');
      //   console.log('@@@ pageNumber..'+currentElementData.pageNo);
      //   console.log('printinggggg' + currentElementData.pageNo + 'screenY' + screenY + 'y' + currentElementData.y);
        

      //   console.log('scrol!!!' + Number((currentElementData.pageNo * screenY) * (currentElementData.y - 100)));
        
      //   console.log("viewPortHeight",viewportHeight);
      //   window.scroll({
      //     top: currentElementData.pageNo === 0 ? Number(currentElementData.y - 100) : Number(currentElementData.pageNo * viewportHeight + currentElementData.y - 100),
      //     behavior: "smooth",
      //   });
      // } else {
      //   console.log('@@@ innerWidth less than 500...');
      //   window.scroll({
      //     top: currentElementData.y,
      //     behavior: "smooth",
      //   });
      // }

      visitedFieldsRef.current.add(currentElementData.coordinateId);
      console.log('visited fields ' + Array.from(visitedFieldsRef.current));
      console.log("currentElementData 477" + JSON.stringify(currentElementData));


      dispatch(
        setActiveElement({
          coordinateId: currentElementData.coordinateId,
          y: currentElementData.y,
          x: currentElementData.x,
          screenX: currentElementData.screen_x,
          screenY: currentElementData.screen_y,
          pageNumber: currentElementData.pageNo,
          height: currentElementData.height,
          width: currentElementData.width,
          isRequired: currentElementData.isRequired,
          // value: currentElementData.value
        })
      );

      dispatch(setCurrentPage({ pageIndex: currentElementData.pageNo }));
      
      
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const { y, x, pageNumber, screenY, height, width } = elementsNavigationData;
    console.log("elementsNavigationData",elementsNavigationData);

    if (signatureIndicatorRef.current && y > 0 && x > -1) {
      console.log('signature ref' + signatureIndicatorRef.current);
      
      const currentPageElements = allCoordinateDataWithCordinates.find(
        (item: any) => item.pageNo === pageNumber
      ) as PageElement | undefined;

      console.log('currentPageElement' + JSON.stringify(currentPageElements));
      

      allCoordinateDataWithCordinates.map((item: any) => {
        console.log('page number useeffect element navigation data' + item.pageNo);
          console.log('page index useeffect element navigation data' + pageIndex);
      })

      if (currentPageElements) {
        
        Object.keys(currentPageElements).forEach((key) => {
          console.log(`key ${key}: ${currentPageElements[key]}`);
        });

        if(currentPageElements.pageNo > 0){
          console.log('inside iffff:' + pageNumber);
          console.log('screen y:' + screenY);
          console.log(' y:' + y);
          console.log(' height:' + height);
          console.log('qwertyyy' + y + 'screeny' + viewportHeight + 'pageNo' + currentPageElements.pageNo);
          console.log(currentPageElements.pageNo * viewportHeight + currentPageElements.y - 25);
          
          
          // signatureIndicatorRef.current.style.top = `${screenY + currentPageElements.y}px`;
          signatureIndicatorRef.current.style.top = `${currentPageElements.pageNo * viewportHeight + y - 25}px`;
          signatureIndicatorRef.current.style.left = `${x}px`;
          console.log('inside iqwerty');

          
        }
        else {
          signatureIndicatorRef.current.style.top = `${y - 35}px`;
          signatureIndicatorRef.current.style.left = `${x}px`;
        }
        
        // scroll inner div
        document.getElementsByClassName("pdf-viewer-container")[0].scrollLeft =
          x - 20;
      }
    }

    return () => {};
    // elementsNavigationData will contain the active element info, on change of active elements, the above logic should be re-executed.

    // activePage:0
    // activeElementCoordinateId:7299
    // y:164
    // x:14
    // screenX:14
    // screenY:325
    // pageNumber:0
    // height:57
    // width:152

    // pagenumber, x and y  will get change by user, on click event, "Next" button click
  }, [elementsNavigationData.pageNumber, elementsNavigationData.x, elementsNavigationData.y]);

  // here x value change container direction !!!!!!!!!!
  // const fetchingCordinates = async (
  //   uuid_template_instance: string,
  //   uuidS: string
  // ) => {
  //   try {
  //     const {
  //       data: { data: responseData },
  //     }: AxiosResponse = await postRequest(
  //       API_ROUTES.COMMON_FETCHCORDINATESDATA,
  //       false,
  //       {
  //         uuid_template_instance: uuid_template_instance,
  //         uuid_signatory: uuidS,
  //       }
  //     );
  //     console.log("responseData from fetchingCordinates " + JSON.stringify(responseData));

  //     let coord = responseData.coord;
  //     const recordData = responseData.recordData;

  //     console.log("record data" + JSON.stringify(recordData));
  //     console.log("coord data" + JSON.stringify(coord));
  //     console.log("coord data length" + coord.length);

  //     if (coord && coord.length > 0) {
  //       const salesforceOrgId = coord[0].salesforce_org_id;
  //       dispatch(setSalesforceOrgId({ salesforceOrgId }));
  //     }

  //     let completedFieldCount = 0;
  //     console.log("recordData before if", recordData);

  //     if (coord && coord.length > 0) {
  //       coord.map((item) => {
  //         console.log("coord item value " + JSON.stringify(item.value));
  //         if (item.value) {
  //           completedFieldCount += 1;
  //         }
  //         if (item.fieldType === "Date") {
  //           item.value = moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
  //           console.log("item value Date ", item.value);

  //           // item.value = item.value ? item.value : moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
  //         }
  //       });
  //     }

  //     if (Object.keys(recordData).length > 0) {
  //       console.log("recordData after if", recordData);

  //       coord = coord.map((item) => {
  //         // if (item.value !== "") {
  //         //   completedFieldCount += 1;
  //         // }
  //         if (
  //           item.isUpdateFromSalesforce &&
  //           item.mappingField &&
  //           item.mappingField !== ""
  //         ) {
  //           if (
  //             recordData.hasOwnProperty(item.mappingField) &&
  //             recordData[item.mappingField] != null
  //           ) {
  //             if (item.fieldType !== "Checkbox") {
  //               completedFieldCount += 1;
  //             }
  //             item.value =
  //               item.fieldType === "Date"
  //                 ? moment(recordData[item.mappingField], "YYYY-MM-DD").format(
  //                     "MM-DD-YYYY"
  //                   )
  //                 : recordData[item.mappingField];
  //           } else {
  //             // TODO: revert this change after api latest code updated
  //             item.value = item.fieldType === "Checkbox" ? false : "";
  //           }
  //         } else if (item.fieldType === "Date") {
  //           item.value = moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
  //           console.log("item value", item.value);

  //           // completedFieldCount += 1;
  //         }
  //         return item;
  //       });

  //       console.log(coord);
  //     }

  //     const sortedCoordinateData: any = [
  //       ...(new Set(
  //         coord
  //           .map((item: any) => item.pageNo)
  //           .sort((a: number, b: number) => a - b)
  //       ) as any),
  //     ];

  //     const finalData: Array<Object> = [];

  //     sortedCoordinateData.map((currentPageNo: number) => {
  //       const data = coord.filter((item: any) => item.pageNo == currentPageNo);

  //       const t = data.sort((a: any, b: any) => {
  //         return a.y - b.y;
  //       });
  //       finalData.push(...t);
  //     });

  //     dispatch(setCoordinateData({ allCoordinateData: finalData }));
  //     dispatch(setRecordData({ recordData: recordData }));
  //     dispatch(setTotalNoOfFields({ allCoordinateData: finalData }));
  //     dispatch(
  //       setCompletedNoOfFields({ completedNoOfFields: completedFieldCount })
  //     );
  //     setIsFetchingCordinatesData(false);
  //   } catch (err: any) {
  //     // console.log(err);
  //     console.log(err.response);

  //     if (
  //       err.response.data.msg.toLowerCase() ==
  //       "Sorry Your Signature Is Already Done".toLowerCase()
  //     ) {
  //       setIsAlreadySign(true);
  //     }
  //   }
  // };


  const fetchingCordinates = async (
    uuid_template_instance: string,
    uuidS: string
  ) => {
    try {
      const {
        data: { data: responseData },
      }: AxiosResponse = await postRequest(
        API_ROUTES.COMMON_FETCHCORDINATESDATA,
        false,
        {
          uuid_template_instance: uuid_template_instance,
          uuid_signatory: uuidS,
        }
      );
      console.log("responseData from fetchingCordinates " + JSON.stringify(responseData));

      let coord = responseData.coord;
      const recordData = responseData.recordData;

      console.log("record data" + JSON.stringify(recordData));
      console.log("coord data" + JSON.stringify(coord));
      console.log("coord data length" + coord.length);

      if (coord && coord.length > 0) {
        const salesforceOrgId = coord[0].salesforce_org_id;
        dispatch(setSalesforceOrgId({ salesforceOrgId }));
      }

      let completedFieldCount = 0;
      console.log("recordData before if", recordData);

      if (coord && coord.length > 0) {
        coord.map((item) => {
          console.log("coord item value " + JSON.stringify(item.value));
          if (item.value) {
            completedFieldCount += 1;
          }

          if (item.fieldType === "Date") {
            // Check if item.value is not an empty string
            if (item.value) {
              item.value = moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
              console.log("item value Date ", item.value);
            } else {
              // If it's an empty string, set it as an empty string
              item.value = "";
            }
          }
          
          // if (item.fieldType === "Date") {
          //   item.value = moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
          //   console.log("item value Date ", item.value);

          //   // item.value = item.value ? item.value : moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
          // }
        });
      }

      if (Object.keys(recordData).length > 0) {
        console.log("recordData after if", recordData);

        // coord = coord.map((item) => {
        //   // if (item.value !== "") {
        //   //   completedFieldCount += 1;
        //   // }
        //   if (
        //     item.isUpdateFromSalesforce &&
        //     item.mappingField &&
        //     item.mappingField !== ""
        //   ) {
        //     if (
        //       recordData.hasOwnProperty(item.mappingField) &&
        //       recordData[item.mappingField] != null
        //     ) {
        //       if (item.fieldType !== "Checkbox") {
        //         completedFieldCount += 1;
        //       }
        //       item.value =
        //         item.fieldType === "Date"
        //           ? moment(recordData[item.mappingField], "YYYY-MM-DD").format(
        //               "MM-DD-YYYY"
        //             )
        //           : recordData[item.mappingField];
        //     } else {
        //       // TODO: revert this change after api latest code updated
        //       item.value = item.fieldType === "Checkbox" ? false : "";
        //     }
        //   } else if (item.fieldType === "Date") {
        //     item.value = moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
        //     console.log("item value", item.value);

        //     // completedFieldCount += 1;
        //   }
        //   return item;
        // });


        coord = coord.map((item) => {
          if (
            item.isUpdateFromSalesforce &&
            item.mappingField &&
            item.mappingField !== ""
          ) {
            if (
              recordData.hasOwnProperty(item.mappingField) &&
              recordData[item.mappingField] != null
            ) {
              if (item.fieldType !== "Checkbox") {
                completedFieldCount += 1;
              }
              // For Date type fields, check if value is empty before using moment
              if (item.fieldType === "Date" && recordData[item.mappingField]) {
                item.value = moment(recordData[item.mappingField], "YYYY-MM-DD").format("MM-DD-YYYY");
              } else if (item.fieldType !== "Date") {
                item.value = recordData[item.mappingField];
              }

            } else {
              // Handle cases where no mapping exists in recordData
              item.value = item.fieldType === "Checkbox" ? false : "";
            }
          } else if (item.fieldType === "Date" && item.value) {
            item.value = moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
          }
          return item;
        });
        
        console.log(coord);
      }

      const sortedCoordinateData: any = [
        ...(new Set(
          coord
            .map((item: any) => item.pageNo)
            .sort((a: number, b: number) => a - b)
        ) as any),
      ];

      const finalData: Array<Object> = [];

      sortedCoordinateData.map((currentPageNo: number) => {
        const data = coord.filter((item: any) => item.pageNo == currentPageNo);

        const t = data.sort((a: any, b: any) => {
          return a.y - b.y;
        });
        finalData.push(...t);
      });

      console.log("final data dispatch : ", finalData);
      dispatch(setCoordinateData({ allCoordinateData: finalData }));
      dispatch(setRecordData({ recordData: recordData }));
      dispatch(setTotalNoOfFields({ allCoordinateData: finalData }));
      dispatch(
        setCompletedNoOfFields({ completedNoOfFields: completedFieldCount })
      );
      setIsFetchingCordinatesData(false);
    } catch (err: any) {
      // console.log(err);
      console.log(err.response);

      if (
        err.response.data.msg.toLowerCase() ==
        "Sorry Your Signature Is Already Done".toLowerCase()
      ) {
        setIsAlreadySign(true);
      }
    }
  };

  const fetchingUsersResources = async (uuidSignatory: string) => {
    try {
      const {
        data: { data: responseData },
      }: AxiosResponse = await postRequest(
        API_ROUTES.COMMON_EXTERNALUSER_DATA_CHECKORADD,
        false,
        {
          uuidSignatory: uuidSignatory,
        }
      );

      const userId = responseData.userId;

      const {
        data: { data: signatureData },
      }: AxiosResponse = await postRequest(
        API_ROUTES.COMMON_EXTERNALUSER_SIGNATURE_FETCHALL,
        false,
        {
          userId: userId,
        }
      );

      dispatch(setUserData({ userId }));
      dispatch(
        setAllPreviousSignatures({ allPreviousSignatures: signatureData })
      );
    } catch (err: any) {
      // console.log(err);
      console.log(err.response);
    }
  };

  const checkStatus = async (
    signatoryUniqUUID: string,
    uuidTemplateInstance: string
  ) => {
    try {
      console.log("uuidTemplateInstance", uuidTemplateInstance);
      console.log("signatoryUniqUUID", signatoryUniqUUID);
      const {
        data: { data: responseData },
      }: AxiosResponse = await postRequest(API_ROUTES.CHECKSTATUS, false, {
        uuid_signatory: signatoryUniqUUID,
        uuid_template_instance: uuidTemplateInstance,
      });
      console.log("calling track....", JSON.stringify(responseData));

      const expiryDate = responseData?.expiryDate;
      if (expiryDate) {
        const currentDate = new Date();
        const expiryDateObj = new Date(expiryDate);

        if (currentDate > expiryDateObj) {
          const msg: string = "Sorry, the document has expired.";
          setUserErrorMsg(msg);
          setIsAlreadySign(true);
          localStorage.clear();
          return;
        }
      }

      await trackDocumentViewed(uuidTemplateInstance, signatoryUniqUUID);
    } catch (err: any) {
      if (err.response.data.msg) {
        if (
          err.response.data.msg.toLowerCase() ==
          "Sorry Your Signature Is Already Done".toLowerCase()
        ) {
          const msg: string = "Sorry You Had Already Done Your Work";
          setUserErrorMsg(msg);
          setIsAlreadySign(true);
          // setIsAlreadySign(false);
        } else if (
          err.response.data.msg.toLowerCase() ==
          "Sorry Your Template Is Already Signed".toLowerCase()
        ) {
          const msg: string =
            "Sorry Your Template Is Already Signed Either By You Or By SomeOne Else In Your Group";
          setUserErrorMsg(msg);
          setIsAlreadySign(true);
        } else if (
          err.response.data.msg.toLowerCase() ==
          "Sorry Someone Had Rejected This Template".toLowerCase()
        ) {
          const msg: string =
            "Sorry one of the signatory had rejected this template so you are unable to go further";
          setUserErrorMsg(msg);
          setIsAlreadySign(true);
        }

        localStorage.clear();
      }
      console.log("i am from app.tsx above finally block on line no 654");
    } finally {
      setIsLoading(false);
    }
  };

  const trackDocumentViewed = async (
    uuidTemplateInstance: any,
    signatoryUniqUUID: any
  ) => {
    try {
      const locationData: any = await fetchIpInfo();

      const {
        data: { data: responseData },
      }: AxiosResponse = await postRequest(
        API_ROUTES.AUDIT_TRACKDOCUMENTVIEWED,
        false,
        {
          tiUUID: uuidTemplateInstance,
          signatoryUUID: signatoryUniqUUID,
          location: locationData,
        }
      );
      console.log("Response", JSON.stringify(responseData));
    } catch (err) {
      console.log(err);
    }
  };
  console.log(
    "trackDocumentViewed outside function"
    // JSON.stringify(trackDocumentViewed)
  );

  useEffect(() => {
    // if (isOtpVerificationDone) {
    const fetchingAsync = async () => {
      // console.log("done");
      const uuid = searchParams.get("uuid");
      const uuidTemplateInstance = searchParams.get("uuid_template_instance");
      const uuidSignatory = searchParams.get("uuid_signatory");

      await fetchingUsersResources(uuidSignatory as string);

      await fetchingCordinates(
        uuidTemplateInstance as string,
        uuidSignatory as string
      );
      await uploadPdf(uuid, uuidTemplateInstance);
    };
    fetchingAsync();
    // }

    return () => {};
  }, []);

  const fetchParamsAndFetchPdf = async () => {
    try {
      const uuid = searchParams.get("uuid");
      const uuidTemplateInstance = searchParams.get("uuid_template_instance");
      const uuidSignatory = searchParams.get("uuid_signatory");

      if (!uuid || !uuidTemplateInstance || !uuidSignatory) {
        navigate("/page404", { replace: true });
        return;
      }
      dispatch(setInfo({ uuid, uuidTemplateInstance, uuidSignatory }));
      setIsOtpVerificationDone(true);

      if (
        // originalOtpValue.length == 0 &&
        uuid &&
        uuidTemplateInstance &&
        uuidSignatory
      ) {
        console.log("--------");
        console.log(
          "i am from app.tsx in if condition above sentotp on line no 739"
        );
        console.log("--------");
        // track document viewed, call api
        await checkStatus(
          uuidSignatory as string,
          uuidTemplateInstance as string
        );
        // await sendOtp(
        //   uuidSignatory as string,
        //   uuidTemplateInstance as string
        // );
        // setIsOtpVerificationDone(true);
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };
  console.log("isOtpVerificationDone", isOtpVerificationDone);

  useEffect(() => {
    fetchParamsAndFetchPdf();
  }, []);

  return (
    <>
      {/* <Container style={{ margin: 30 }}> */}
        {/* thank you */}

        <div id="thankyou-container"></div>

        {/*  */}

        {isLoading ? <Loading /> : null}

        {
          isAlreadySign ? (
            <AlreadySignedComponent
              userErrorMsg={userErrorMsg}
              setIsAuditHistoryShown={setIsAuditHistoryShown}
            />
          ) : (
            <>
              <MenuBar
                rejectSign={handleSignRejection}
                savePdf={handleSavePdf}
                savingPdfStatus={isSaving}
                isPdfLoaded={!!file}
                setIsAuditHistoryShown={setIsAuditHistoryShown}
              />
              <div id="pdfViewerContainer" style={mobileView?{overflow:"hidden"}:{ overflow: "auto"}} className={mobileView?"pdf-viewer-div-mobile":"pdf-viewer-div"}>
                {!file || isFetchingCordinatesData ? (
                  <Loading />
                ) : (
                  <div className=" d-flex justify-content-center align-items-center overflow-x-scroll">
                    <div className="inner-container">
                      {currentPage && (
                        <div className="border mb-5 position-relative">
                          {" "}
                          <div>
                            {/*  */}
                            <Page
                              dimensions={dimensions}
                              updateDimensions={setDimensions}
                              page={currentPage}
                              allPages={pages}
                              goToPage={goToPage}
                              isFetchingCordinatesData={
                                isFetchingCordinatesData
                              }
                              setDrawingModalOpen={setDrawingModalOpen}
                              handleStartAndScrollElement={
                                handleStartAndScrollElement
                              }
                              signatureIndicatorRef={signatureIndicatorRef}
                              updateViewportHeight={(height) => setViewportHeight(height)}
                            />

                            {/*  */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {drawingModalOpen ? (
                <DrawingModal
                  open={drawingModalOpen}
                  dismiss={() => setDrawingModalOpen(false)}
                />
              ) : null}
            </>
          )

        
        }

        {isAuditHistoryShown && (
          <AuditTrailModal setIsAuditHistoryShown={setIsAuditHistoryShown} />
        )}
      {/* </Container> */}

      <footer
        className=" text-light d-flex justify-content-end"
        style={mobileView?{fontSize:"12px", backgroundColor: "#354259", position:"absolute",bottom:0,width:"100%" }:{backgroundColor:"#354259",position:"absolute",bottom:0,width:"100%"}}
      >
        {/* Copyright */}
        <div
          className="text-center p-2 fw-bold"
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.open("https://www.eruditeworks.com/", "_blank");
          }}
        >
          Powered By EW Sign
        </div>
        {/* Copyright */}
      </footer>
    </>
  );
};

export default App;
