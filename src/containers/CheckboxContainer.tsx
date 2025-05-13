import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

//
import {
  changeCheckboxData,
  setCheckBoxData,
} from "redux/slices/checkboxReducer";
import { CheckboxPad } from "components/Elements/CheckboxPad";

//
import { RootState } from "redux/store";

interface Props {
  page: any;
  isFetchingCordinatesData: any;
}

export const CheckboxContainer: React.FC<Props> = ({
  page,
  isFetchingCordinatesData,
}) => {
  const [currentPageNo, setCurrentPageNo] = useState(0);

  const reduxState = useSelector((state: RootState) => state);

  const allCordinatesData = useSelector(
    (state: RootState) => state.coordinatesList.allCoordinateData
  );

  const allCheckboxElementDataSelector = useSelector(
    (state: RootState) => state.checkboxList.allCheckboxData[currentPageNo]
  );

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
  //   var checkboxDataPagesWise: any = {};

  //   if (allCordinatesData) {
  //     //
  //     allCordinatesData.map((item: any, i: number) => {
  //       if (item.fieldType === "Checkbox") {
  //         if (!checkboxDataPagesWise[item.pageNo]) {
  //           checkboxDataPagesWise[item.pageNo] = [];
  //         }

  //         checkboxDataPagesWise[item.pageNo] = [
  //           ...checkboxDataPagesWise[item.pageNo],
  //           { ...item, id: item.eleId, index: i },
  //         ];
  //       }
  //     });

  //     dispatch(setCheckBoxData({ allCheckboxData: checkboxDataPagesWise }));
  //   }
  //   return () => {};
  // }, [isFetchingCordinatesData]);

  //
  
  useEffect(() => {
  const checkboxDataPagesWise: any = {};

  if (allCordinatesData) {
    allCordinatesData.forEach((item: any, i: number) => {
      if (item.fieldType === "Checkbox") {
        const pageNo = item.pageNo;

        if (!checkboxDataPagesWise[pageNo]) {
          checkboxDataPagesWise[pageNo] = [];
        }

        const previousValue =
          reduxState.checkboxList.allCheckboxData?.[pageNo]?.find(
            (x: any) => x.coordinateId === item.coordinateId
          )?.value;

        checkboxDataPagesWise[pageNo].push({
          ...item,
          id: item.eleId,
          index: i,
          value: previousValue ?? item.value ?? false,
        });
      }
    });

    dispatch(setCheckBoxData({ allCheckboxData: checkboxDataPagesWise }));
  }
}, [isFetchingCordinatesData, allCordinatesData]);

  
  const handleTextChange = (e: any, targetElementIndex: number) => {
    try {
      const value = e.target.checked;

      dispatch(
        changeCheckboxData({
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
      {allCheckboxElementDataSelector
        ? allCheckboxElementDataSelector.map((item: any, i: number) => {
            return (
              <CheckboxPad
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
