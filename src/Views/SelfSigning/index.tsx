import { useState, useLayoutEffect, useEffect, useRef } from "react";
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
import { setInfo } from "redux/slices/inPersonSigning/basicInfoReducer";
import { setActiveSignatory } from "redux/slices/inPersonSigning/activeSignatoryReducer";
import {
  setCoordinateData,
  setActiveSignatoriesCoordinateData,
  setSingatoryList,
} from "redux/slices/inPersonSigning/coordinatesReducer";
import { setUserData } from "redux/slices/externalUserReducer";
import { setAllPreviousSignatures } from "redux/slices/inPersonSigning/signatureReducer";
import Loading from "components/Common/Loading";

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

const SelfSigningPage = () => {
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [isFetchingCordinatesData, setIsFetchingCordinatesData] =
    useState(true);
  const [isAlreadySign, setIsAlreadySign] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userErrorMsg, setUserErrorMsg] = useState("");
    const [viewportHeight, setViewportHeight] = useState<Number>(0);
  
  const [isAuditHistoryShown, setIsAuditHistoryShown] = useState(false);
  const [signatories, setSignatories] = useState<
    { label: string; value: string; coordData: [] }[] | null
  >(null);
  const [selectedSignatory, setSelectedSignatory] = useState<{
    label: string;
    value: string;
  } | null>(null);
  // const [isStartNeeded, setIsStartNeeded] = useState<boolean>(true);

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

  const handleSavePdf = async () => {
    const tempState = currentReduxState as RootState;

    if (
      tempState.inPerson.inPersonCoordinatesList.allCoordinateData.length === 0
    ) {
      alert("oops there is no fields are seems");

      return;
    }

    let signatureFieldCount = 0;
    const firstFieldWithEmptyValue: any =
      tempState.inPerson.inPersonCoordinatesList.allCoordinateData.find(
        (field: any) => {
          if (field.fieldType === "Signature") signatureFieldCount += 1;
          if (field.fieldType !== "Signature" && field.value.length === 0) {
            return field;
          }
        }
      );

    const firstSignatoryWithEmptyValue: any =
      signatureFieldCount === 0
        ? undefined
        : tempState.inPerson.inPersonCoordinatesList.signatoryList.find(
            (signatory: any) => signatory.value.length === 0
          );

    if (firstSignatoryWithEmptyValue) {
      alert(
        `Please Fill Signature, ${firstSignatoryWithEmptyValue.signatoryName}'s signature is pending.`
      );
    } else if (firstFieldWithEmptyValue) {
      alert(`Please Fill All ${firstFieldWithEmptyValue.fieldType} fields.`);
    } else {
      // savePdf(allPageAttachments, tempState);
      const uuidTemplateInstance = searchParams.get("uuid_template_instance");
      const result = await savePdfDataToServer(tempState, uuidTemplateInstance);
    }
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
          y: currentElementData.y,
          x: currentElementData.x,
        })
      );

      goToPage(currentElementData.pageNo + 1);
    } catch (err) {
      console.log(err);
    }
  };

  // ******************** //
  //      USE EFFECT      //
  // ******************** //
  useEffect(() => {
    const { y, x } = elementsNavigationData;

    if (signatureIndicatorRef.current && y > 0 && x > -1) {
      const currentPageElements = activeSignatoriesCoordinateData.find(
        (item: any) => item.pageNo === pageIndex
      );

      if (currentPageElements) {
        signatureIndicatorRef.current.style.top = `${y - 35}px`;
        signatureIndicatorRef.current.style.left = `${x}px`;

        // scroll inner div
        document.getElementsByClassName("pdf-viewer-container")[0].scrollLeft =
          x - 20;
      }
    }

    return () => {};
  }, [elementsNavigationData]);

  useEffect(() => {
    if (elementsNavigationData.activeElementCoordinateId > 0) {
      const indexNoList: Array<number> = [];

      const currentPageElements = activeSignatoriesCoordinateData.filter(
        (item: any, index: number) => {
          if (item.pageNo == pageIndex) {
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

  const sortData = (originalData) => {
    const sortedCoordinateData: any = [
      ...(new Set(
        originalData
          .map((item: any) => item.pageNo)
          .sort((a: number, b: number) => a - b)
      ) as any),
    ];

    const finalData: Array<any> = [];

    sortedCoordinateData.map((currentPageNo: number) => {
      const data = originalData.filter(
        (item: any) => item.pageNo == currentPageNo
      );

      const t = data.sort((a: any, b: any) => {
        return a.y - b.y;
      });
      finalData.push(...t);
    });

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
        API_ROUTES.COMMON_DOCUMENTS_SELFSIGNING_FETCHSIGNATORIES,
        false,
        `tiUUID=${uuid_template_instance}`
      );

      console.log("@@@ responseData: " + JSON.stringify(responseData));

      dispatch(setFullData({ data: responseData }));

      let tempSignatories: { label: string; value: string; coordData: [] }[] =
        [];
      let signatoryList: {
        signatoryName: string;
        signatoryUUID: string;
        value: string;
        totalNoOfFields: number;
        completedNoOfFields: number;
      }[] = [];
      responseData.forEach((ele) => {
        tempSignatories.push({
          label: ele.signatoryName,
          value: ele.signatoryUUID,
          ...ele,
        });
        signatoryList.push({
          signatoryName: ele.signatoryName,
          signatoryUUID: ele.signatoryUUID,
          value: "",
          totalNoOfFields: ele.coordData.filter(
            (coordinate) => coordinate.fieldType !== "Checkbox"
          ).length,
          completedNoOfFields: 0,
        });
      });
      console.log(signatoryList);

      setSignatories(tempSignatories);
      dispatch(setSingatoryList({ signatoryList: signatoryList }));

      const firstSignatoryData = responseData[0].coordData;
      const signatoryUUID = responseData[0].signatoryUUID;
      const signatoryName = responseData[0].signatoryName;

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
      await fetchingUsersResources(signatoryUUID as string);
      const coordList = transformData(responseData);
      dispatch(setCoordinateData({ allCoordinateData: coordList }));
      const finalData = sortData(firstSignatoryData);
      dispatch(
        setActiveSignatoriesCoordinateData({
          activeSignatoriesCoordinateData: finalData,
        })
      );

      // trackDocumentViewed(uuid_template_instance, signatoryUUID);
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

  // const trackDocumentViewed = async (
  //   uuidTemplateInstance: any,
  //   signatoryUniqUUID: any
  // ) => {
  //   try {
  //     const locationData: any = await fetchIpInfo();

  //     const {
  //       data: { data: responseData },
  //     }: AxiosResponse = await postRequest(
  //       API_ROUTES.AUDIT_TRACKDOCUMENTVIEWED,
  //       false,
  //       {
  //         tiUUID: uuidTemplateInstance,
  //         signatoryUUID: signatoryUniqUUID,
  //         location: locationData,
  //       }
  //     );
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

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
      <Container style={{ margin: 30 }}>
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
            <>
              <MenuBar
                rejectSign={() => {}}
                savePdf={handleSavePdf}
                isPdfLoaded={!!file}
                setIsAuditHistoryShown={setIsAuditHistoryShown}
              />
              <div className="pdf-viewer-div">
                {!file || isFetchingCordinatesData ? (
                  <Loading />
                ) : (
                  <div className=" d-flex justify-content-center align-items-center overflow-x-scroll">
                    <div className="inner-container">
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
                              updateViewportHeight={(height:Number)=>setViewportHeight(height)}
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

export default SelfSigningPage;
