import { readAsArrayBuffer } from "./asyncReader";
import { getAsset } from "./prepareAssets";

import axios from "axios";
import { fetchIpInfo } from "./fetchIpInfo";
// get env variables
const { REACT_SIGNPAD_URL, REACT_APP_API_URL } = process.env;


export async function Save(pdfFile: File, tempState: any) {

  console.log("SAVE FUNTION CALLED.....pdf.js....");

  const PDFLib = await getAsset("PDFLib");
  const download = await getAsset("download");
  let pdfDoc: {
    getPages: () => any[];
    embedFont: (arg0: unknown) => any;
    embedJpg: (arg0: unknown) => any;
    embedPng: (arg0: unknown) => any;
    embedPdf: (arg0: any) => [any] | PromiseLike<[any]>;
    // #changes here
    // embedPdf: (arg0: any) => any;
    save: () => any;
  };

  try {
    pdfDoc = await PDFLib.PDFDocument.load(await readAsArrayBuffer(pdfFile));
    console.log('@@@ pdfDoc::'+pdfDoc);
  } catch (e) {
    console.log("Failed to load PDF.");
    throw e;
  }

  console.log("pageWiseAllData..1");
  /**/
  // loading gif
  const thankYouContainer: HTMLElement = document.getElementById(
    "thankyou-container"
  ) as HTMLElement;
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

    <span class="mb-3"><b>Saving Your Document </b></span>
  </div>
</div>`;


const { signatureList, textList, basicInfoData, emailList, dateList, checkboxList, pickList } =
tempState;   

const base64OfPng = signatureList.encodedImgData;
const signatureDataPagesWise = signatureList.allSignatureData;
  const textDataPagesWise = textList.allTextData;
  const emailDataPagesWise = emailList.allEmailData;
  const dateDataPagesWise = dateList.allDateData;
  const checkboxDataPagesWise = checkboxList.allCheckboxData;
  const picklistDataPagesWise = pickList.allPicklistData;
  
  const totalPages = pdfDoc.getPages().length;
  const pageWiseAllData: any = {};
  
  for (let i = 0; i < totalPages; i++) {
    if (!pageWiseAllData[i]) {
      pageWiseAllData[i] = [];
    }

    var element;

    if (signatureDataPagesWise[i]) {
      element = signatureDataPagesWise[i];
      // console.log('@@@ signatureDataPagesWise::element::'+JSON.stringify(element));

      pageWiseAllData[i].push(
        ...element.map((item: any) => ({
          id: item.coordinateId,
          value: base64OfPng,
        }))
      );
    }

    if (textDataPagesWise[i]) {
      element = textDataPagesWise[i];
      // console.log('@@@ textDataPagesWise::element::'+JSON.stringify(element));

      pageWiseAllData[i].push(
        ...element.map((item: any) => ({
          id: item.coordinateId,
          height: item.height,
          width: item.width,
          value: item.value,
        }))
      );
    }
    if (dateDataPagesWise[i]) {
      element = dateDataPagesWise[i];

      pageWiseAllData[i].push(
        ...element.map((item: any) => ({
          id: item.coordinateId,
          value: item.value,
        }))
      );
    }
    if (checkboxDataPagesWise[i]) {
      element = checkboxDataPagesWise[i];

      pageWiseAllData[i].push(
        ...element.map((item: any) => ({
          id: item.coordinateId,
          value: item.value,
        }))
      );
    }

    //
    if (emailDataPagesWise[i]) {
      element = emailDataPagesWise[i];
      // console.log('@@@ textDataPagesWise::element::'+JSON.stringify(element));

      pageWiseAllData[i].push(
        ...element.map((item: any) => ({
          id: item.coordinateId,
          height: item.height,
          width: item.width,
          value: item.value,
        }))
      );
    }

    //

    console.log("pick list data page wise : ",pickList);
    if (picklistDataPagesWise[i]) {
      element = picklistDataPagesWise[i];

      pageWiseAllData[i].push(
        ...element.map((item: any) => ({
          id: item.coordinateId,
          height : item.height,
          width : item.width,
          value: item.value,
        }))
      );
    }
  }

  console.log("pageWiseAllData::::2 ", pageWiseAllData);
     

  try {
    //

    let locationData: any = await fetchIpInfo();
    console.log("@@@ locationData::" +locationData);

    if (!locationData) {
      locationData = {
        country_code: "IN",
        country_name: "India",
        city: "Navsari",
        postal: "396445",
        latitude: 20.85,
        longitude: 72.9167,
        IPv4: "150.129.112.104",
        state: "Gujarat",
      };
    }

    const bodyContent = {
      uuid: basicInfoData.uuid,
      uuid_signatory: basicInfoData.uuidSignatory,
      uuid_template_instance: basicInfoData.uuidTemplateInstance,
      allElementsData: pageWiseAllData,
      location: locationData,
    };

    console.log("@@@ bodyContent", bodyContent); // ✅ safer, avoids stringifying
    const { data } = await axios.request({
      url: `${process.env.REACT_APP_API_URL}/api/common/saveSignedDoc`,
      method: "POST",
      data: bodyContent,
    });

    const thankYouContainer: HTMLElement = document.getElementById(
      "thankyou-container"
    ) as HTMLElement;

    thankYouContainer.innerHTML = `
      <div
        style="
          position: fixed;
          z-index: 5;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #F4EDE4;
          display: flex;
          justify-content: center;
        "
      >
       <div
      class="parent-container">
      <div class="child-container">
      <div class="preview-container">
      <a
      href="${REACT_SIGNPAD_URL}/viewFinalPdf?uuid=${basicInfoData.uuid}&uuid_template_instance=${basicInfoData.uuidTemplateInstance}"
        target="_blank"
        class="preview"
     >
       Preview Document
     </a>
    <a class="preview" id="downloadDocument" href="#">Download Document</a>

      </div>
        <div class="img-container">   
          <img src="/thankyou.png" alt="Thank You Illustration" class="img-size"/>
          <p class="congrats-text">
            Congratulations! You have successfully completed the signature.
          </p>
          <p class="closer-text">
            We are one step closer to finalizing the document. Please wait for
            the remaining signatories to complete their signatures.
          </p>
        </div>

          
        <div class="footer-parent">
          <div class="footer-child">
            <span>This document has been signed via </span>
              <a
                href="https://www.eruditeworks.com/ew-sign/demo/"
                className="span-one">
                <img 
                  width="80px"
                  alt="ew_sign_small_logo.png"
                  src="/ew_sign_small_logo.png" 
                />
              </a>
          </div>
          <div className="footer-child">
            <span>EW Sign is developed by </span>
            <a
              href="https://www.eruditeworks.com/"
              className="footer_text_org_link">
              Erudite Works
            </a>
          </div>
        </div>
      </div>
    </div>
    `;
    //     "thankyou-container"
    //   ) as HTMLElement;
    //   thankYouContainer.innerHTML = `<div
    //   style="
    //     position: fixed;
    //     z-index: 5;
    //     top: 0;
    //     left: 0;
    //     right: 0;
    //     bottom: 0;
    //     background-color: #F4EDE4;
    //     display:flex;
    //     justify-content:center;
    //   "
    // >
    //   <div
    //     style="
    //       display: flex;
    //       align-items: center;
    //       justify-content: center;
    //       height: 100vh;
    //       width: 90vw;
    //       flex-direction: column;
    //     "
    //   >

    //       <div class="w-100 d-flex justify-content-center">
    //         <svg height="100" width="100" viewBox="-2 -2 24.00 24.00" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-2" y="-2" width="24.00" height="24.00" rx="12" fill="#354259" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 5L8 15l-5-4"></path> </g></svg>
    //       </div>

    //     <span class="my-5">

    //     <h4 class="text-center"><b>Congratulations! you have successfully completed the signature</b></h4>

    //     <h6 class="text-center text-secondary mt-4 text-justify" > We are one step closer to finalizing the document. Please wait for the remaining signatories to complete their signatures.<br/><br/> The final singed pdf will be emailed to you once all signers have finished signing the document. </h6>

    //     <!-- <h6 class="text-center mt-4">For More Information About EwSign  <a target="_blank" href="https://www.eruditeworks.com/ewsign/">Click Here</a> </h6>-->
    //     </span>
    //   </div>
    // </div>`;

    document
      .getElementById("downloadDocument")
      ?.addEventListener("click", async function (event) {
        event.preventDefault(); // Prevent default anchor action

        const pdfUrl = `${REACT_APP_API_URL}/fetchPdfWithCoordinates?uuid=${basicInfoData.uuid}&uuid_template_instance=${basicInfoData.uuidTemplateInstance}&isDownload=true`;

        try {
          const response = await axios.get(pdfUrl, {
            responseType: "blob", // Get the response as a binary blob
          });

          // Create a Blob URL
          const blob = new Blob([response.data], { type: "application/pdf" });
          const blobUrl = window.URL.createObjectURL(blob);

          // Create a temporary download link
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = "Signed_Document.pdf"; // Set the filename
          document.body.appendChild(a);
          a.click(); // Trigger download
          document.body.removeChild(a); // Remove from the DOM

          // Free up memory
          window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.error("Failed to download PDF:", error);
          alert("Error downloading the document. Please try again.");
        }
      });

    localStorage.clear();
  } catch (e) {
    console.log("Failed to save PDF.::::", e);

    const thankYouContainer: HTMLElement = document.getElementById(
      "thankyou-container"
    ) as HTMLElement;
    thankYouContainer.innerHTML = "";
    alert("Something Want Wrong Try Again");
    //

    // console.log(e);
  }
}
