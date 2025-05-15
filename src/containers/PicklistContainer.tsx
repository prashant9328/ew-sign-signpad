import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setPicklistData,
  changePicklistData,
} from "redux/slices/picklistReducer";
//
import { RootState } from "redux/store";
import { PicklistPad } from "components/Elements/PicklistPad";

interface Props {
  page: any;
  isFetchingCordinatesData: any;
  // allCordinatesData: any;
}

export const PicklistContainer: React.FC<Props> = ({
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

  const allPicklistElementDataSelector = useSelector(
    (state: RootState) => state.pickList.allPicklistData[currentPageNo]
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
        console.log("catch err at 'PicklistContainer': ", err);
      });
    return () => {};
  }, [page]);

  // useEffect(() => {
  //   var picklistDataPagesWise: any = {};

  //   if (allCordinatesData) {
  //     //
  //     allCordinatesData.map((item: any, i: number) => {
  //       if (item.fieldType === "PickList") {
  //         if (!picklistDataPagesWise[item.pageNo]) {
  //           picklistDataPagesWise[item.pageNo] = [];
  //         }

  //         picklistDataPagesWise[item.pageNo] = [
  //           ...picklistDataPagesWise[item.pageNo],
  //           { ...item, id: item.eleId, index: i },
  //         ];
  //       }
  //     });
  //     dispatch(setPicklistData({ allPicklistData: picklistDataPagesWise }));
  //   }
  //   return () => {};
  // }, [isFetchingCordinatesData]);

  //
  
  
  useEffect(() => {
  const picklistDataPagesWise: any = {};

  if (allCordinatesData) {
    allCordinatesData.forEach((item: any, i: number) => {
      if (item.fieldType === "PickList") {
        const pageNo = item.pageNo;

        if (!picklistDataPagesWise[pageNo]) {
          picklistDataPagesWise[pageNo] = [];
        }

        const previousValue =
          reduxState.pickList.allPicklistData?.[pageNo]?.find(
            (x: any) => x.coordinateId === item.coordinateId
          )?.value;

        picklistDataPagesWise[pageNo].push({
          ...item,
          id: item.eleId,
          index: i,
          value: previousValue ?? item.value ?? "",
        });
      }
    });

    dispatch(setPicklistData({ allPicklistData: picklistDataPagesWise }));
  }
}, [isFetchingCordinatesData, allCordinatesData]);


  const handlePicklistValueChange = (
    // value: any,
    targetElementIndex: number,
    selectedValue: String
  ) => {
    try {
      if (selectedValue) {
        console.log("dispatching selected value : ",selectedValue);
        dispatch(
          changePicklistData({
            elementIndex: targetElementIndex,
            selectedValue: selectedValue?.toString(), //value,
            currentPageNo: currentPageNo,
            reduxState,
          })
        );
      } else {
        console.log("Invalid selectedValue ", selectedValue);
      }
    } catch (err) {
      console.log(" catch err at 'handlePicklistValueChange': ", err);
    }
  };

  return (
    <>
      {allPicklistElementDataSelector
        ? allPicklistElementDataSelector.map((item: any, i: number) => {
            return (
              <PicklistPad
                key={i}
                {...item}
                pickListArray={item.options?.split(',') || []}
                value={item.value}
                handlePicklistValueChange={handlePicklistValueChange}
                picklistElementIndex={item.index}
              />
              
            );
          })
        : null}
    </>
  );
};
