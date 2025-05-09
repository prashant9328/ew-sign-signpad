import React, { useEffect, useState, useRef } from "react";

import ProgressBar from "@ramonak/react-progress-bar";

import { useSelector } from "react-redux";
import { Document, Page, pdfjs } from "react-pdf/dist/esm/entry.webpack";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
//
import { RootState } from "redux/store";

interface Props {
  isPdfLoaded: boolean;
  savingPdfStatus: boolean;
  savePdf: () => void;
  rejectSign: (commentText: string) => void;
  setIsAuditHistoryShown: any;
}

export const MenuBar: React.FC<Props> = ({
  isPdfLoaded,
  savingPdfStatus,
  savePdf,
  rejectSign,
  setIsAuditHistoryShown,
}) => {
  const [isRejectMenuOpen, setIsRejectMenuOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [documentLiveUrl, setDocumentLiveUrl] = useState("");
  //
  const [isFinishAlertShown, setIsFinishAlertShown] = useState(false);
  const [isAgreeCheckBoxChecked, setIsAgreeCheckBoxChecked] = useState(false);
  const [isIncompleteFieldsAlertShown, setIsIncompleteFieldsAlertShown] = useState(false);

  //
  const [commentText, setCommentText] = useState("");
  const [pdfLiveUrl, setPdfLiveUrl] = useState("");
  const [brandLogo, setBrandLogo] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropDown = () => setDropdownOpen((prevState) => !prevState);

  const trackerData = useSelector(
    (state: RootState) => state.allFinalDataReducer
  );

  const validateAllRequireFieds = () => {
    if (trackerData.completedNoOfFields === trackerData.totalNoOfFields) {
      setIsFinishAlertShown(true);
    } else {
      setIsIncompleteFieldsAlertShown(true);
    }
  };

  console.log("trackerData", trackerData);

  const basicInfoData = useSelector((state: RootState) => state.basicInfoData);

  const textList = useSelector((state: RootState) => state.textList);
  console.log("textList:", textList);

  const dateListt = useSelector((state: RootState) => state.dateList);
  console.log("dateList:", dateListt);

  useEffect(() => {
    if (basicInfoData) {
      console.log("basicInfo", basicInfoData);
      const { uuid, uuidTemplateInstance, salesforceOrgId } = basicInfoData;

      // Set the URLs
      const newPdfLiveUrl = `${process.env.REACT_APP_API_URL}/fetchpdf?uuid=${uuid}&uuid_template_instance=${uuidTemplateInstance}`;
      const newDocumentLiveUrl = `${process.env.REACT_APP_API_URL}/fetchPdfWithCoordinates?uuid=${uuid}&uuid_template_instance=${uuidTemplateInstance}`;

      setPdfLiveUrl(newPdfLiveUrl);
      setDocumentLiveUrl(newDocumentLiveUrl);
      setBrandLogo(
        `${process.env.REACT_APP_API_URL}/api/admin/branding/fetchBrandLogo?orgId=${salesforceOrgId}`
      );

      // Log the new URLs
      console.log("PdfLiveUrl", newPdfLiveUrl);
      console.log("DocumentLiveUrl", newDocumentLiveUrl);
    }
  }, [basicInfoData]);

  const handleRejection = () => {
    if (commentText) {
      rejectSign(commentText);
      setIsRejectMenuOpen(false);
    }
  };

  const closeCurrentModal = () => {
    setIsRejectMenuOpen(false);
    setIsFinishAlertShown(false);
    setIsIncompleteFieldsAlertShown(false);
  };

  const handleViewPdf = async () => {
    try {
      setIsPdfViewerOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePrintPdf = async () => {
    try {
      window.open(pdfLiveUrl, "_blank", "");
    } catch (err) {
      console.log(err);
    }
  };
  const handleDownloadPdf = () => {
    try {
      const a = document.createElement("a");
      a.href = `${pdfLiveUrl}&isDownload=true`;
      a.download = "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.log(err);
    }
  };

  const handleViewDocument = async () => {
    try {
      setIsDocumentViewerOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownloadDocument = () => {
    try {
      const a = document.createElement("a");
      a.href = `${documentLiveUrl}&isDownload=true`;
      a.download = "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="menubar-container p-2 px-3 ">
        <div
          className="d-flex menubar-inner-container"
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={brandLogo} className="logo" alt="logo img" />

          <div className="custom-progressbar-container">
            {/*  */}

            <ProgressBar
              completed={trackerData.completedNoOfFields}
              maxCompleted={trackerData.totalNoOfFields}
              isLabelVisible={false}
              height="5px"
              bgColor="#ece5c7"
              baseBgColor="#878479"
            />
            <div className="text-center mb-1" style={{ color: "#1d1c1cb3" }}>
              {trackerData.completedNoOfFields} of {trackerData.totalNoOfFields}{" "}
              required fields completed
            </div>

            {/*  */}
          </div>
        </div>

        <div className="d-flex justify-content-center align-items-center header-main-container gap-sm-2 ">
          {isPdfLoaded && (
            <>
              <button
                className="submit-btn btn"
                // onClick={savePdf}
                onClick={validateAllRequireFieds}
              >
                Submit Document
              </button>

              <Dropdown
                isOpen={dropdownOpen}
                toggle={toggleDropDown}
                direction={"down"}
              >
                <DropdownToggle
                  caret
                  style={{ backgroundColor: "#354259", color: "white" }}
                  color="black"
                  className="fw-bold"
                >
                  Options
                </DropdownToggle>
                <DropdownMenu style={{ minWidth: 150 }}>
                  {/* <DropdownItem header>Header</DropdownItem> */}
                  <DropdownItem onClick={() => setIsRejectMenuOpen(true)}>
                    Reject
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      handlePrintPdf();
                    }}
                  >
                    Print
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      setIsAuditHistoryShown(true);
                    }}
                  >
                    View History
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      window.open("https://www.eruditeworks.com/", "_blank");
                    }}
                  >
                    Help & Support
                  </DropdownItem>
                  {/* <DropdownItem text>Asign To Someone Else</DropdownItem> */}
                  {/* <DropdownItem disabled>Action (disabled)</DropdownItem> */}
                  <DropdownItem divider />
                  <DropdownItem
                    onClick={() => {
                      handleViewPdf();
                    }}
                  >
                    View Unsigned Document
                  </DropdownItem>
                  <DropdownItem onClick={() => handleDownloadPdf()}>
                    Download Unsigned Document
                  </DropdownItem>
                  <DropdownItem onClick={handleViewDocument}>
                    View Signed Document
                  </DropdownItem>
                  <DropdownItem onClick={handleDownloadDocument}>
                    Download Signed Document
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* <button
                className="submit-btn btn"
                onClick={() => setIsRejectMenuOpen(true)}
              >
                Reject
              </button> */}
            </>
          )}
        </div>
      </div>

      {/*  */}
      <PdfViewer
        isPdfViewerOpen={isPdfViewerOpen}
        setIsPdfViewerOpen={setIsPdfViewerOpen}
        pdfLiveUrl={pdfLiveUrl}
        handleDownloadPdf={handleDownloadPdf}
      />
      <DocumentViewer
        isDocumentViewerOpen={isDocumentViewerOpen}
        setIsDocumentViewerOpen={setIsDocumentViewerOpen}
        documentLiveUrl={documentLiveUrl}
        handleDownloadDocument={handleDownloadDocument}
      />

      {/*  */}

      {/* check to agree modal */}
      <Modal
        isOpen={isFinishAlertShown}
        onClosed={closeCurrentModal}
        centered
        className="modal-container"
        toggle={closeCurrentModal}
        fade={false}
        size={"lg"}
      >
        <ModalHeader>Do You Agree ?</ModalHeader>
        <ModalBody>
          <div>
            <div className="form-group mb-0">
              <div className="d-flex gap-2">
                <input
                  type="checkbox"
                  className="inline d-flex align-self-start mt-1"
                  id="terms"
                  defaultValue="false"
                  onChange={(e) => {
                    setIsAgreeCheckBoxChecked(e.target.checked);
                  }}
                />
                <label
                  className="x-small font-weight-normal mx-2"
                  htmlFor="terms"
                >
                  By clicking this checkbox, I agree that this mark will serve
                  as my signature for the document. I also understand that
                  recipients of documents I sign will be able to see my signing
                  details, including but not limited to my Email ID, Phone
                  Number.
                </label>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button className="btn " onClick={closeCurrentModal}>
            Cancel
          </button>
          <span className="px-2"> </span>
          <button
            onClick={() => {
              savePdf();
              closeCurrentModal();
            }}
            className={`btn custom-btn1 ${
              !isAgreeCheckBoxChecked ? "text-dark bg-secondary" : null
            }`}
            disabled={!isAgreeCheckBoxChecked}
          >
            Done
          </button>
        </ModalFooter>
      </Modal>

      <Modal
      isOpen={isIncompleteFieldsAlertShown}
      onClosed={closeCurrentModal}
      centered
      className="modal-container"
      toggle={closeCurrentModal}
      fade={false}
      size={"lg"}
      >
        <ModalHeader>Incomplete Fields</ModalHeader>
        <ModalBody>
        <div>
            <p>Please complete all required fields before submitting the document.</p>
          </div>
        </ModalBody>
        <ModalFooter>
        <button
            onClick={() => {
              closeCurrentModal();
            }}
            className='btn custom-btn1 text-dark bg-secondary'
          >
            Done
          </button>
        </ModalFooter>
      </Modal>
      {/*  */}

      {/*  */}
      {/* reject to sign */}
      <Modal
        isOpen={isRejectMenuOpen}
        onClosed={closeCurrentModal}
        centered
        className="modal-container"
        toggle={closeCurrentModal}
        fade={false}
        size={"lg"}
      >
        <ModalHeader>Reject To Sign</ModalHeader>
        <ModalBody>
          <div>
            <FormGroup>
              <Label for="exampleText" className="text-dark">
                You're about to reject to sign,
                <br /> Note that all the changes you've made to this document
                will be lost. We advise you to carefully review this again.
              </Label>

              <h6 className="fw-bold my-3" style={{ fontSize: "1rem" }}>
                Please provide your reason for declining here:
              </h6>
              <Input
                type="textarea"
                name="text"
                id="exampleText"
                style={{ minHeight: 150 }}
                placeholder="Reason For Reject"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </FormGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <button className="btn " onClick={closeCurrentModal}>
            Cancel
          </button>
          <span className="px-2"> </span>
          <button
            onClick={handleRejection}
            className={`btn custom-btn1 ${
              !commentText ? "text-dark bg-secondary" : null
            }`}
            disabled={!commentText}
          >
            Done
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

const DocumentViewer = ({
  isDocumentViewerOpen,
  setIsDocumentViewerOpen,
  documentLiveUrl,
  handleDownloadDocument,
}: {
  isDocumentViewerOpen: boolean;
  setIsDocumentViewerOpen: (open: boolean) => void;
  documentLiveUrl: string;
  handleDownloadDocument: () => void;
}) => {
  const [numPages, setNumPages] = useState(0);
  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth);
  const zoomContainerRef = useRef<any>(null);

  const zoomControl = (operation: string) => {
    switch (operation) {
      case "in":
        zoomContainerRef.current.zoomIn(0.1);
        break;
      case "out":
        zoomContainerRef.current.zoomOut();
        break;

      default:
        break;
    }
  };

  return (
    <Modal
      isOpen={isDocumentViewerOpen}
      onClosed={() => setIsDocumentViewerOpen(false)}
      centered
      className="modal-container"
      toggle={() => setIsDocumentViewerOpen(false)}
      fade={false}
      fullscreen
    >
      <ModalBody>
        <div
          className="document-viewer-header d-flex justify-content-center gap-3 py-2 text-light mb-2"
          style={{
            fontSize: "1rem",
            backgroundColor: "#354259",
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
        >
          <span>
            <i
              className="fa-solid fa-download cursor-pointer"
              onClick={() => handleDownloadDocument()}
            ></i>
          </span>
          <span>
            <i className="fa-solid fa-print cursor-pointer"></i>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "5px",
            padding: "10px",
          }}
        >
          <TransformWrapper
            maxScale={3}
            initialScale={1}
            disablePadding
            wheel={{ disabled: true }}
            // disabled={deviceWidth <= 600}
            ref={zoomContainerRef}
          >
            <TransformComponent>
              <Document
                file={documentLiveUrl}
                onLoadSuccess={({ numPages }) => {
                  setNumPages(numPages);
                }}
                renderMode="canvas"
              >
                {[...Array(numPages)].map((_, index) => (
                  <div key={index} className="page-div-signed">
                    <Page
                      pageNumber={index + 1}
                      className="page-section-signed"
                    />
                    <div style={{ textAlign: "right", marginRight:"10px"}} className="fw-bold">
                      {index + 1} of {numPages}
                    </div>
                  </div>
                ))}
              </Document>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          className="btn custom-btn1"
          onClick={() => setIsDocumentViewerOpen(false)}
        >
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

const PdfViewer = ({
  isPdfViewerOpen,
  setIsPdfViewerOpen,
  pdfLiveUrl,
  handleDownloadPdf,
}: {
  isPdfViewerOpen: any;
  setIsPdfViewerOpen: any;
  pdfLiveUrl: any;
  handleDownloadPdf: any;
}) => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  //
  const [numPages, setNumPages] = useState(0);
  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth);
  const zoomContainerRef = useRef<any>(null);

  const zoomControl = (operation: string) => {
    switch (operation) {
      case "in":
        zoomContainerRef.current.zoomIn(0.1);
        break;
      case "out":
        zoomContainerRef.current.zoomOut();
        break;

      default:
        break;
    }
  };

  return (
    <Modal
      isOpen={isPdfViewerOpen}
      onClosed={() => setIsPdfViewerOpen(false)}
      centered
      // className="modal-container"
      toggle={() => setIsPdfViewerOpen(false)}
      fade={false}
      // size={"xl"}
      fullscreen
    >
      {/* <ModalHeader>Total Pages :- {numPages === 0 ? "" : numPages}</ModalHeader> */}
      <ModalBody>
        <div
          className="pdfviewer-header d-flex justify-content-center gap-3 py-2 text-light mb-2"
          style={{
            fontSize: "1rem",
            backgroundColor: "#354259",
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
        >
          {deviceWidth >= 600 && (
            <>
              <span>
                <i
                  className="fa-solid fa-magnifying-glass-plus cursor-pointer"
                  onClick={() => zoomControl("in")}
                ></i>
              </span>
              <span>
                <i
                  className="fa-solid fa-magnifying-glass-minus cursor-pointer"
                  onClick={() => zoomControl("out")}
                ></i>
              </span>
            </>
          )}
          <span>
            <i
              className="fa-solid fa-download cursor-pointer"
              onClick={() => handleDownloadPdf()}
            ></i>
          </span>
          <span>
            <i className="fa-solid fa-print"></i>
          </span>
        </div>
        <div className="d-flex justify-content-center print-pdf-main-container">
          <TransformWrapper
            maxScale={3}
            initialScale={1}
            disablePadding
            wheel={{ disabled: true }}
            disabled={deviceWidth <= 600}
            ref={zoomContainerRef}
          >
            <TransformComponent>
              <Document
                file={pdfLiveUrl}
                onLoadSuccess={({ numPages }) => {
                  setNumPages(numPages);
                }}
                renderMode="canvas"
                // style={{ overflowX: "scroll" }}
              >
                {[...Array(numPages)].map((_, index) => {
                  return (
                    <div
                      key={index}
                      className="page-div"
                      // className="m-0 p-0 mb-5 my-3"
                    >
                      <Page
                        pageNumber={index + 1}
                        className="page-section"
                        // style={{ overflowX: "scroll" }}
                      />
                      <div style={{ textAlign: "right" }} className="fw-bold">
                        {index + 1} of {numPages}
                      </div>
                    </div>
                  );
                })}
              </Document>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          className="btn custom-btn1"
          onClick={() => setIsPdfViewerOpen(false)}
        >
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};
