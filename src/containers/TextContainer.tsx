import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

//
import { TextPad } from "components/Elements/TextPad";
import { changeTextData, setTextData } from "redux/slices/textReducer";
//
import { RootState } from "redux/store";

interface Props {
  page: any;
  isFetchingCordinatesData: any;
  // allCordinatesData: any;
}

export const TextContainer: React.FC<Props> = ({
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

  const allTextElementDataSelector = useSelector(
    (state: RootState) => state.textList.allTextData[currentPageNo]
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
  //   var textDataPagesWise: any = {};

  //   if (allCordinatesData) {
  //     //
  //     allCordinatesData.map((item: any, i: number) => {
  //       if (item.fieldType == "Text") {
  //         if (!textDataPagesWise[item.pageNo]) {
  //           textDataPagesWise[item.pageNo] = [];
  //         }

  //         textDataPagesWise[item.pageNo] = [
  //           ...textDataPagesWise[item.pageNo],
  //           { ...item, id: item.eleId, index: i },
  //         ];
  //       }
  //     });
  //     console.log("textDataPagesWise",textDataPagesWise);
  //     console.log("textDataPagesWise",JSON.stringify(textDataPagesWise));
  //     dispatch(setTextData({ allTextData: textDataPagesWise }));

  //     // localStorage.setItem(
  //     //   "textDataPagesWise",
  //     //   JSON.stringify(textDataPagesWise)
  //     // );
  //   }
  //   return () => {};
  // }, [isFetchingCordinatesData]);

  //


  useEffect(() => {
  let textDataPagesWise: any = {};

  if (allCordinatesData) {
    allCordinatesData.forEach((item: any, i: number) => {
      if (item.fieldType === "Text") {
        const pageNo = item.pageNo;

        if (!textDataPagesWise[pageNo]) {
          textDataPagesWise[pageNo] = [];
        }

        // Get previously stored value for this coordinate
        const previousValue =
          reduxState.textList.allTextData?.[pageNo]?.find(
            (x: any) => x.coordinateId === item.coordinateId
          )?.value;

        textDataPagesWise[pageNo].push({
          ...item,
          id: item.eleId,
          index: i,
          value: previousValue ?? item.value ?? "",
        });
      }
    });

    console.log("textDataPagesWise", textDataPagesWise);
    dispatch(setTextData({ allTextData: textDataPagesWise }));
  }
}, [isFetchingCordinatesData, allCordinatesData]);


  const handleTextChange = (e: any, targetElementIndex: number) => {
    try {
      const value = e.target.value;

      dispatch(
        changeTextData({
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
      {allTextElementDataSelector
        ? allTextElementDataSelector.map((item: any, i: number) => {
            return (
              <TextPad
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
