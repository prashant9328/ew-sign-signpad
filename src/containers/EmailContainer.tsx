import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

//
import { TextPad } from "components/Elements/TextPad";
import { changeEmailData, setEmailData } from "redux/slices/emailReducer";
//
import { RootState } from "redux/store";
import { EmailPad } from "components/Elements/EmailPad";

interface Props {
  page: any;
  isFetchingCordinatesData: any;
  // allCordinatesData: any;
}

export const EmailContainer: React.FC<Props> = ({
  page,
  isFetchingCordinatesData,
  // allCordinatesData,
}) => {
  const [currentPageNo, setCurrentPageNo] = useState(0);

  const allCordinatesData = useSelector(
    (state: RootState) => state.coordinatesList.allCoordinateData
  );

  const recordData = useSelector(
    (state: RootState) => state.coordinatesList.recordData
  );

  const allEmailElementDataSelector = useSelector(
    (state: RootState) => state.emailList.allEmailData[currentPageNo]
  );
  const reduxState = useSelector((state: RootState) => state);

  const dispatch = useDispatch();

  useEffect(() => {
    page
      .then((data: any) => {
        const { pageIndex } = data;
        setCurrentPageNo(pageIndex);
      })
      .catch((err: any) => {
        console.log(err);
      });
    return () => {};
  }, [page]);

  // useEffect(() => {
  //   var emailDataPagesWise: any = {};

  //   if (allCordinatesData) {
  //     //
  //     allCordinatesData.map((item: any, i: number) => {
  //       if (item.fieldType === "Email") {
  //         if (!emailDataPagesWise[item.pageNo]) {
  //           emailDataPagesWise[item.pageNo] = [];
  //         }

  //         emailDataPagesWise[item.pageNo] = [
  //           ...emailDataPagesWise[item.pageNo],
  //           { ...item, id: item.eleId, index: i },
  //         ];
  //       }
  //     });
  //     console.log("emailDataPagesWise",emailDataPagesWise);
  //     console.log("emailDataPagesWise",JSON.stringify(emailDataPagesWise));
  //     dispatch(setEmailData({ allEmailData: emailDataPagesWise }));

  //     // localStorage.setItem(
  //     //   "textDataPagesWise",
  //     //   JSON.stringify(textDataPagesWise)
  //     // );
  //   }
  //   return () => {};
  // }, [isFetchingCordinatesData]);

  //

  useEffect(() => {
  let emailDataPagesWise: any = {};

  if (allCordinatesData) {
    allCordinatesData.forEach((item: any, i: number) => {
      if (item.fieldType === "Email") {
        const pageNo = item.pageNo;

        if (!emailDataPagesWise[pageNo]) {
          emailDataPagesWise[pageNo] = [];
        }

        const previousValue =
          reduxState.emailList.allEmailData?.[pageNo]?.find(
            (x: any) => x.coordinateId === item.coordinateId
          )?.value;

        emailDataPagesWise[pageNo].push({
          ...item,
          id: item.eleId,
          index: i,
          value: previousValue ?? item.value ?? "",
        });
      }
    });

    console.log("emailDataPagesWise", emailDataPagesWise);
    dispatch(setEmailData({ allEmailData: emailDataPagesWise }));
  }
}, [isFetchingCordinatesData, allCordinatesData]);


  const handleTextChange = (e: any, targetElementIndex: number) => {
    try {
      const value = e.target.value;

      dispatch(
        changeEmailData({
          elementIndex: targetElementIndex,
          textValue: value,
          currentPageNo: currentPageNo,
          reduxState,
        })
      );
      
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {allEmailElementDataSelector
        ? allEmailElementDataSelector.map((item: any, i: number) => {
            return (
              <EmailPad
                key={i}
                {...item}
                handleTextChange={handleTextChange}
                textElementIndex={item.index}
              />
            );
          })
        : null}
    </>
  );
};
