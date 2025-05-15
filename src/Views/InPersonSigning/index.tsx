import { useState, useLayoutEffect, useEffect, useRef } from "react";
import _ from "lodash";
import { AxiosResponse } from "axios";
import "semantic-ui-css/semantic.min.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "App.css";

import { Container } from "semantic-ui-react";

import { MenuBar } from "components/inPersonSigning/MenuBar";
import { DrawingModal } from "modals/InPersonSigningModal/DrawingModal";
import { usePdf, Pdf } from "hooks/usePdf";
import { useUploader, UploadTypes } from "hooks/useUploader";
import {Page} from "components/inPersonSigning/Page";

//
import AlreadySignedComponent from "components/Common/AlreadySignedComponent";

//
import { setFullData } from "redux/slices/inPersonSigning/originalSignatoryWithCoordsDataReducer";
import { setInfo, setSalesforceOrgId } from "redux/slices/inPersonSigning/basicInfoReducer";
import { setActiveSignatory } from "redux/slices/inPersonSigning/activeSignatoryReducer";
import {
  setCoordinateData,
  setActiveSignatoriesCoordinateData,
  setSingatoryList,
} from "redux/slices/inPersonSigning/coordinatesReducer";
import { setUserData } from "redux/slices/externalUserReducer";
import { setAllPreviousSignatures } from "redux/slices/inPersonSigning/signatureReducer";
import Loading from "components/Common/Loading";
import { setTotalNoOfFields, setCompletedNoOfFields } from "redux/slices/inPersonSigning/allFinalDataReducer";
//
// import { setTotalNoOfFields } from "redux/slices/inPersonSigning/allFinalDataReducer";
import {
  setActiveElement,
  setCurrentPage,
} from "redux/slices/inPersonSigning/elementsNavigationHelperReducer";
import { fetchIpInfo } from "utils/fetchIpInfo";
import { AuditTrailModal } from "modals/components/AuditTrailModal";
import CustomSelect from "components/inPersonSigning/CustomSelectComponent";
// import { fetchCoordsPageWise } from "utils/InPersonSigning/fetchCoordPageWise";
import { transformData } from "utils/InPersonSigning/transformCoordData";
import { savePdfDataToServer } from "utils/InPersonSigning/savePdfDataToServer";

//
import { API_ROUTES } from "helpers/constants/apis";
import { getRequest, postRequest } from "helpers/axios";
//
import { RootState } from "redux/store";
import moment from "moment";
import { FetchAllElementsStatus } from "utils/InPersonSigning/FetchAllElementStatus";

const InPersonSigningPage = () => {
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [isFetchingCordinatesData, setIsFetchingCordinatesData] =
    useState(true);
  const [isAlreadySign, setIsAlreadySign] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userErrorMsg, setUserErrorMsg] = useState("");
  const [isAuditHistoryShown, setIsAuditHistoryShown] = useState(false);
  const [signatories, setSignatories] = useState<
    { label: string; value: string; coordData: [] }[] | null
  >(null);
    const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [selectedSignatory, setSelectedSignatory] = useState<{
    label: string;
    value: string;
  } | null>(null);
  // const [isStartNeeded, setIsStartNeeded] = useState<boolean>(true);

  const [mobileView,setMobileView]=useState(false);

  
  const signatureIndicatorRef = useRef<any>(null);

  
  const currentReduxState = useSelector((state) => state);

  const fullData = useSelector(
    (state: RootState) =>
      state.inPerson.inPersonOriginalSignatoryWithCoordsData.data
  );

  const activeSignatory = useSelector(
    (state: RootState) => state.inPerson.inPersonActiveSignatory.activeSignatory
  );
  const allCoordinateDataWithCordinates = useSelector(
    (state: RootState) =>
      state.inPerson.inPersonCoordinatesList.allCoordinateData
  );

  console.log("allCoordinateDataWithCordinates: " + JSON.stringify(allCoordinateDataWithCordinates));
  

  const activeSignatoriesCoordinateData = useSelector(
    (state: RootState) =>
      state.inPerson.inPersonCoordinatesList.activeSignatoriesCoordinateData
  );
  const elementsNavigationData = useSelector(
    (state: RootState) => state.inPerson.inPersonElementsNavigationHelper
  );
  const {
    file,
    initialize,
    pageIndex,
    currentPage,
    savePdf,
    setDimensions,
    dimensions,
    pages,
    goToPage,
  } = usePdf();

  const dispatch = useDispatch();
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

  const addDrawing = (drawing?: {
    width: number;
    height: number;
    path: string;
    encodedImgData: string;
  }) => {};

  const handleSavePdf = async () => {
    const tempState = currentReduxState as any;

    if (tempState.inPerson.inPersonCoordinatesList.length === 0) {
      alert("oops there is no fields are seems");

      return;
    }

    let signatureFieldCount = 0;
    const firstFieldWithEmptyValue =
      tempState.inPerson.inPersonCoordinatesList.allCoordinateData.find(
        (field) => {
          if (field.fieldType === "Signature") signatureFieldCount += 1;
          if (field.fieldType !== "Signature" && field.value.length === 0) {
            return field;
          }
        }
      );

    const firstSignatoryWithEmptyValue =
      signatureFieldCount === 0
        ? undefined
        : tempState.inPerson.inPersonCoordinatesList.signatoryList.find(
            (signatory) => signatory.value?.length === 0
          );

    if (firstSignatoryWithEmptyValue) {
      alert(
        `Please Fill Signature, ${firstSignatoryWithEmptyValue.signatoryName}'s signature is pending.`
      );
    } else if (firstFieldWithEmptyValue ) { //&& firstFieldWithEmptyValue.fieldType!=='Checkbox'
      alert(`Please Fill All ${firstFieldWithEmptyValue.fieldType} fields.`);
    } else {
      // savePdf(allPageAttachments, tempState);
      const uuidTemplateInstance = searchParams.get("uuid_template_instance");
      const result = await savePdfDataToServer(tempState, uuidTemplateInstance);
    }
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(()=>{
    if(window.innerWidth<600){
      setMobileView(true);
    }else{
      setMobileView(false);
    }
  },[])

  // const handleStartAndScrollElement = async () => {
  //   try {
  //     const { activeElementCoordinateId } = elementsNavigationData;

  //     const nextIndex =
  //       activeSignatoriesCoordinateData.findIndex(
  //         (item: any) => item.coordinateId === activeElementCoordinateId
  //       ) + 1;

  //     const indexNo =
  //       activeElementCoordinateId === 0 ||
  //       nextIndex === activeSignatoriesCoordinateData.length
  //         ? 0
  //         : nextIndex;

  //     const currentElementData: any = activeSignatoriesCoordinateData[indexNo];

  //     if (window.innerWidth > 600) {
  //       window.scroll({
  //         top: currentElementData.y,
  //         behavior: "smooth",
  //       });
  //     } else {
  //       window.scroll({
  //         top: currentElementData.y - 50,
  //         behavior: "smooth",
  //       });
  //     }

  //     dispatch(
  //       setActiveElement({
  //         coordinateId: currentElementData.coordinateId,
  //         y: currentElementData.y,
  //         x: currentElementData.x,
  //       })
  //     );

  //     goToPage(currentElementData.pageNo + 1);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

 const handleStartAndScrollElement = async () => {
  try {
    const { activeElementCoordinateId } = elementsNavigationData;

    const nextIndex =
      activeSignatoriesCoordinateData.findIndex(
        (item: any) => item.coordinateId === activeElementCoordinateId
      ) + 1;

    const indexNo =
      activeElementCoordinateId === 0 ||
      nextIndex === activeSignatoriesCoordinateData.length
        ? 0
        : nextIndex;

    const currentElementData: any = activeSignatoriesCoordinateData[indexNo];

    const scrollContainer = document.getElementById('pdf-viewer-div-inperson-scrollable');

    if (currentElementData) {
      // Scroll to the actual field DOM element using its ID
      const fieldElement = document.getElementById(currentElementData.coordinateId);

      if (fieldElement) {
        // Scroll it into center view without jumping to bottom
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (scrollContainer) {
        // Fallback scroll
        const yOffset = -100;
        setTimeout(()=>{
            scrollContainer.scrollTo({
             top : ((currentElementData.pageNo * viewportHeight) + (currentElementData.y)-100),
             behavior: 'smooth',
        });
        },100)
       
      }
    }

    dispatch(
      setActiveElement({
        coordinateId: currentElementData.coordinateId,
        y: currentElementData.y,
        x: currentElementData.x,
      })
    );

    goToPage(currentElementData.pageNo + 1);
  } catch (err) {
    console.log(err);
  }
};



  
// 
  // ******************** //
  //      USE EFFECT      //
  // ******************** //
  useEffect(() => {
    const { y, x } = elementsNavigationData;

    if (signatureIndicatorRef.current && y > 0 && x > -1) {
      const currentPageElements:any = activeSignatoriesCoordinateData.find(
        (item: any) => item.pageNo === pageIndex
      );

      if (currentPageElements) {
        signatureIndicatorRef.current.style.top = `${currentPageElements.pageNo * viewportHeight + y - 25}px`;
        signatureIndicatorRef.current.style.left = `${x}px`;

        // scroll inner div
        document.getElementsByClassName("pdf-viewer-container-inperson")[0].scrollLeft =
          x - 20;
      }
    }

    return () => {};
  }, [elementsNavigationData]);

  //  useEffect(() => {
  //     const handleKeyDown = (event: KeyboardEvent) => {
  //       if (
  //         event.key === "F12" ||
  //         (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "C" || event.key === "J" || event.key === "K")) ||
  //         (event.ctrlKey && event.key === "U")
  //       ) {
  //         event.preventDefault();
  //       }
  //     };
    
  //     const handleContextMenu = (event: MouseEvent) => {
  //       event.preventDefault();
  //     };
    
  //     const handleResize = () => {
  //       if (
  //         window.outerWidth - window.innerWidth > 100 || 
  //         window.outerHeight - window.innerHeight > 100 
  //       ) {
  //         window.close();
  //       }
  //     };
    
  //     window.addEventListener("keydown", handleKeyDown);
  //     window.addEventListener("contextmenu", handleContextMenu);
  //     window.addEventListener("resize", handleResize);
    
  //     return () => {
  //       window.removeEventListener("keydown", handleKeyDown);
  //       window.removeEventListener("contextmenu", handleContextMenu);
  //       window.removeEventListener("resize", handleResize);
  //     };
  //   }, []);
    

  useEffect(() => {
    if (elementsNavigationData.activeElementCoordinateId > 0) {
      const indexNoList: Array<number> = [];

      const currentPageElements = activeSignatoriesCoordinateData.filter(
        (item: any, index: number) => {
          if (item.pageNo === pageIndex) {
            indexNoList.push(index);

            return item;
          }
        }
      );

      if (currentPageElements[0]) {
        const currentElementData: any = currentPageElements[0];

        if (window.innerWidth > 550) {
          window.scroll({
            top: currentElementData.y,
            behavior: "smooth",
          });
        } else {
          window.scroll({
            top: currentElementData.y - 50,
            behavior: "smooth",
          });
        }

        dispatch(
          setActiveElement({
            coordinateId: currentElementData.coordinateId,
            x: currentElementData.x,
            y: currentElementData.y,
          })
        );
      } else {
        signatureIndicatorRef.current.style.top = "10px";
        signatureIndicatorRef.current.style.left = "0px";

        window.scroll({
          top: 0,
          behavior: "smooth",
        });
      }
    }

    if (pageIndex > -1) {
      dispatch(setCurrentPage({ pageIndex }));
    }

    return () => {};
  }, [currentPage]);

  // here x value change container direction !!!!!!!!!!
  const finalData: Array<any> = [];
  const sortData = (originalData) => {
    const sortedCoordinateData: any = [
      ...(new Set(
        originalData
          .map((item: any) => item.pageNo)
          .sort((a: number, b: number) => a - b)
      ) as any),
    ];

    

    sortedCoordinateData.map((currentPageNo: number) => {
      const data = originalData.filter(
        (item: any) => item.pageNo == currentPageNo
      );

      const t = data.sort((a: any, b: any) => {
        return a.y - b.y;
      });
      finalData.push(...t);
    });

    console.log("@@@ finalData: " + JSON.stringify(finalData));
    

    return finalData;
  };


  
  const fetchingCordinates = async (
    uuid: string,
    uuid_template_instance: string
  ) => {
    try {
      const {
        data: { data: responseData },
      }: AxiosResponse = await getRequest(
        API_ROUTES.COMMON_DOCUMENTS_INPERSONSIGNING_FETCHSIGNATORIES,
        false,
        `tiUUID=${uuid_template_instance}`
      );

      console.log("@@@ responseData: " + JSON.stringify(responseData));
      console.log("@@@ responseData length: " + JSON.stringify(responseData.length));
      
      dispatch(setFullData({ data: responseData }));

      let coord = _.cloneDeep(responseData.coord[0].coordData);;
      console.log('coordd data' + JSON.stringify(coord));
      const recordData = responseData.recordData;
      console.log('record data' + JSON.stringify(recordData));
      
      console.log("Is coord frozen?", Object.isFrozen(coord));
      console.log("Is coordData frozen?", Object.isFrozen(responseData.coord[0].coordData));


      let completedFieldCount = 0;
      let totalRequiredFields = 0;


      // if(coord && coord.length > 0){
      //   coord.forEach(element => {
      //     if(element.isRequired){
      //       totalRequiredFields++;

      //       if(Object.keys(recordData).length > 0){
      //         coord.forEach(element => {
      //           if(element.isUpdateFromSalesforce && element.mappingField && element.mappingField !== ""){
      //             if(recordData.hasOwnProperty(element.mappingField) && recordData[element.mappingField] != null){
      //               if(element.fieldType !== 'Checkbox' && element.value !== ''){
      //                 console.log('before completedFieldCount increament: ',completedFieldCount, element.value);
                      
      //                 completedFieldCount += 1;

      //                 console.log('after completedFieldCount increament: ',completedFieldCount, element.value);
      //               }
      //             }
      //             element.value = element.fieldType === 'Date' ? moment(recordData[element.mappingField]).format('YYYY-MM-DD') : recordData[element.mappingField];
      //           }
      //           else{
      //             element.value = element.fieldType === 'Checkbox' ? false : '';
      //           }
      //         });
      //       }
      //     }
      //   });
      // }

      coord.forEach(element => {
        if(element.isRequired){
          totalRequiredFields++;
        }
      });

      if(coord && coord.length > 0){
        coord.forEach(element => {
          if(element.value && element.fieldType !== 'Checkbox'){
            // console.log('Before completedFieldCount increament: ',completedFieldCount, item.value);  
            completedFieldCount += 1;
            console.log('After completedFieldCount increament: ',completedFieldCount, element.value);  
          }   
        });
      }

      // if(coord && coord.length>0) {
      //   coord.foreach((item) => {
      //     // console.log('coord item value ' + JSON.stringify(item.value));
      //     if(item.value && item.fieldType !== 'Checkbox'){
      //       // console.log('Before completedFieldCount increament: ',completedFieldCount, item.value);  
      //       completedFieldCount += 1;
      //       console.log('After completedFieldCount increament: ',completedFieldCount, item.value);  
      //     }     
      //     // if(item.fieldType === "Date"){
      //     //   item.value = moment(item.value, "YYYY-MM-DD").format("MM-DD-YYYY");
      //     //   console.log('item value Date ',item.value);
                  
      //     //   // item.value = item.value ? item.value : moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
      //     // }   
      //     // if(item.value === ''){
      //     //   completedFieldCount -= 1;
      //     // }  
      //    })
      // }

      // if (Object.keys(recordData).length > 0) {
      //         console.log('recordData after if',recordData);
              
      //         coord = coord.map((item) => {
      //           // if (item.value !== "") {
      //           //   completedFieldCount += 1;
      //           // }
      //           if (
      //             item.isUpdateFromSalesforce &&
      //             item.mappingField &&
      //             item.mappingField !== ""
      //           ) {
      //             if (
      //               recordData.hasOwnProperty(item.mappingField) &&
      //               recordData[item.mappingField] != null
      //             ) {
      //               // if(item.fieldType !== "Checkbox") {
      //               //   completedFieldCount += 1;
      //               // }
      //               item.value =
      //                 item.fieldType === "Date"
      //                   ? moment(recordData[item.mappingField], "YYYY-MM-DD").format(
      //                       "MM-DD-YYYY"
      //                     )
      //                   : recordData[item.mappingField];
      //             } else {
      //               item.value = item.fieldType === "Checkbox" ? false : "";
      //             }
      //           } 
      //           else if (item.fieldType === "Date") {
      //             item.value = moment(item.value, "YYYY-MM-DD").format("DD-MM-YYYY");
      //             console.log('item value',item.value);
                  
      //             // completedFieldCount += 1;
      //           }
      //           return item;
      //         });
      
      //         console.log(coord);
      //       }

        
      console.log('Total Required Fields: ',totalRequiredFields);
      console.log('Completed Field Count: ',completedFieldCount);
      
      
      console.log('Before if');
      

      let tempSignatories: { label: string; value: string; coordData: [] }[] =
        [];
      let signatoryList: {
        signatoryName: string;
        signatoryUUID: string;
        salesforce_org_id: string,
        value: string;
        totalNoOfFields: number;
        completedNoOfFields: number;
      }[] = [];
      console.log('outside current redux state');
      
      responseData.coord.forEach((ele) => {
        console.log('inside current redux state');
        const { listOfCompletedElements } = FetchAllElementsStatus({ reduxState: currentReduxState });
        console.log('current redux state' + JSON.stringify(currentReduxState));
        console.log('list of completed element in index.tsx' + listOfCompletedElements);
        console.log('list of completed element in index.tsx length' + listOfCompletedElements.length);
        
        completedFieldCount += listOfCompletedElements.length;
        console.log('completed Field Count when added length' + completedFieldCount);
        
        tempSignatories.push({
          label: ele.signatoryName,
          value: ele.signatoryUUID,
          ...ele,
        });
        signatoryList.push({
          signatoryName: ele.signatoryName,
          signatoryUUID: ele.signatoryUUID,
          salesforce_org_id: ele.salesforce_org_id,
          value: ele.value,
          totalNoOfFields: totalRequiredFields,
          completedNoOfFields: completedFieldCount,
        });
      });
      console.log(signatoryList);

      setSignatories(tempSignatories);
      dispatch(setSingatoryList({ signatoryList: signatoryList }));

      const firstSignatoryData = responseData.coord[0].coordData;
      const signatoryUUID = responseData.coord[0].signatoryUUID;
      const signatoryName = responseData.coord[0].signatoryName;
      const salesforceOrgId = responseData.coord[0].salesforceOrgId;
      localStorage.setItem("signatoryUUID", signatoryUUID);
      localStorage.setItem("signatoryName", signatoryName);

      dispatch(
        setActiveSignatory({
          activeSignatory: { label: signatoryName, value: signatoryUUID },
        })
      );
      dispatch(
        setInfo({
          uuid,
          uuidTemplateInstance: uuid_template_instance,
          uuidSignatory: signatoryUUID,
        })
      );
      dispatch(
        setSalesforceOrgId({
          salesforceOrgId: salesforceOrgId
        })
      );

      
      await fetchingUsersResources(signatoryUUID as string);
      const coordList = transformData(responseData);
      console.log("@@@ coordList",coordList);
      dispatch(setCoordinateData({ allCoordinateData: coordList }));
      const finalData = sortData(firstSignatoryData);
      dispatch(setTotalNoOfFields({ allCoordinateData: finalData }));
      dispatch(setCompletedNoOfFields({ completedNoOfFields: completedFieldCount }));
      dispatch(
        setActiveSignatoriesCoordinateData({
          activeSignatoriesCoordinateData: finalData,
        })
      );

      trackDocumentViewed(uuid_template_instance, signatoryUUID);
      setIsFetchingCordinatesData(false);
    } catch (err: any) {
      console.log("error" + err);
      console.log(err.response);

      if (
        err.response?.data.msg.toLowerCase() ==
        "Sorry Your Signature Is Already Done".toLowerCase()
      ) {
        setIsAlreadySign(true);
      }
      else{
        console.error('Unexpected Error : ',err);
      }
    }
  };

  const fetchingUsersResources = async (uuidSignatory: string) => {
    try {
      const {
        data: { data: usersData },
      }: AxiosResponse = await postRequest(
        API_ROUTES.COMMON_EXTERNALUSER_DATA_CHECKORADD,
        false,
        {
          uuidSignatory: uuidSignatory,
        }
      );

      const userId = usersData.userId;

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
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchParamsAndFetchPdf = async () => {
      try {
        const uuid = searchParams.get("uuid");
        const uuidTemplateInstance = searchParams.get("uuid_template_instance");

        if (!uuid || !uuidTemplateInstance) {
          navigate("/page404", { replace: true });

          return;
        }

        console.log(uuid);
        console.log(uuidTemplateInstance);

        await fetchingCordinates(
          uuid as string,
          uuidTemplateInstance as string
        );
        await uploadPdf(uuid, uuidTemplateInstance);

        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchParamsAndFetchPdf();

    return () => {};
  }, []);

  return (
    <>
      <Container style={{ margin: 30, overflow:"hidden" }}>
        {/* thank you */}

        <div id="thankyou-container"></div>

        {/*  */}

        {isLoading ? <Loading /> : null}

        {isAlreadySign ? (
          <AlreadySignedComponent
            userErrorMsg={userErrorMsg}
            setIsAuditHistoryShown={setIsAuditHistoryShown}
          />
        ) : (
          <>
            
              <MenuBar
                rejectSign={() => {}}
                savePdf={handleSavePdf}
                isPdfLoaded={!!file}
                setIsAuditHistoryShown={setIsAuditHistoryShown}
              />
              <div className={mobileView?"pdf-viewer-div-inperson-mobile":"pdf-viewer-div-inperson"} id="pdf-viewer-div-inperson-scrollable">
                {!file || isFetchingCordinatesData ? (
                  <Loading />
                ) : (
                  <div className="d-flex justify-content-center align-items-center overflow-x-scroll">
                    <div className="inner-container">
                      <div style={mobileView?{zIndex:"1",position:"relative",top:"15px",padding:"0 10px"}:{zIndex:"1",position:"relative",top:"15px"}}>
                      <CustomSelect
                        options={signatories}
                        value={activeSignatory}
                        onChange={(e) => {
                          console.log("CustomSelect: " + e);

                          localStorage.setItem("signatoryUUID", e.value);
                          localStorage.setItem("signatoryName", e.label);

                          if (activeSignatory.value === e.value) {
                            return;
                          }
                          dispatch(setActiveSignatory({ activeSignatory: e }));
                          dispatch(
                            setInfo({
                              uuid: searchParams.get("uuid"),
                              uuidTemplateInstance: searchParams.get(
                                "uuid_template_instance"
                              ),
                              uuidSignatory: e.value,
                            })
                          );
                          fetchingUsersResources(e.value as string);
                          const coordData =
                            allCoordinateDataWithCordinates.filter(
                              (coord: any) => coord.signatoryUUID === e.value
                            );
                          dispatch(
                            setActiveSignatoriesCoordinateData({
                              activeSignatoriesCoordinateData: coordData,
                            })
                          );
                        }}
                      />
                      </div>

                      {currentPage && (
                        <div className="border mb-5 position-relative">
                          {" "}
                          <div>
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
        )}

        {isAuditHistoryShown && (
          <AuditTrailModal setIsAuditHistoryShown={setIsAuditHistoryShown} />
        )}
      </Container>

      <footer
        className=" text-light d-flex justify-content-end"
        style={{ backgroundColor: "#354259" }}
      >
        {/* Copyright */}
        <div
          className="text-center p-3 fw-bold"
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

export default InPersonSigningPage;
