


export const getEmptyColumnIndexes = (sheetToJSONoutput = []) => {
  if (sheetToJSONoutput.length > 0) {

    return sheetToJSONoutput[0].reduce((accCol, colItem, colIndex) => {


      if (sheetToJSONoutput.slice(1).reduce((acc, dataItem, dataIndex) => {





        return acc || !!dataItem[colIndex]


      }, false)) {
        return accCol;
      } else {
        return [...accCol, colIndex]
      }
    }, [])

  } else {
    return []
  }


}

export const getDataWithoutEmptyColumns = (sheetToJSONoutput = []) => {
  if (sheetToJSONoutput.length > 0) {

    return sheetToJSONoutput.slice(1).map(rowItem => {



      return rowItem.filter((eachItem, eachIndex) => {




        return !getEmptyColumnIndexes(sheetToJSONoutput).includes(eachIndex)
      })
    })

  } else {
    return []
  }


}

export const isSingleUpload = (acceptedFiles) => {
  let temp = { value: acceptedFiles.length === 1 }
  if (temp.value) {
    return temp
  } else {
    return { ...temp, reason: 'Only one file can be uploaded at a time' }
  }
}
export const isValidFileType = (acceptedFiles) => {
  const acceptedFileTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']

  let temp = { value: acceptedFileTypes.includes(acceptedFiles[0].type) }
  if (temp.value) {
    return temp
  } else {
    return { ...temp, reason: 'Only csv or Excel files can be uploaded' }
  }
}
export const isDataRowAvailable = (sheetToJSONoutput) => {


  let temp = { value: sheetToJSONoutput.slice(1).length > 0 }
  if (temp.value) {
    return temp
  } else {
    return { ...temp, reason: 'the file must contain at least one data row' }
  }

}
export const isValueColumnComplete = (sheetToJSONoutput, valueColumnName) => {


  let colIndex = sheetToJSONoutput[0].indexOf(valueColumnName);
  let value = sheetToJSONoutput.slice(1).reduce((acc, dataItem, dataIndex) => {





    return acc && !!dataItem[colIndex]


  }, true)


  let temp = { value }
  if (temp.value) {
    return temp
  } else {
    return { ...temp, reason: `Column ${valueColumnName} cannot have blank values` }
  }

}
export const isValueColumnNumeric = (sheetToJSONoutput, valueColumnName) => {


  let colIndex = sheetToJSONoutput[0].indexOf(valueColumnName);
  let value = sheetToJSONoutput.slice(1).reduce((acc, dataItem, dataIndex) => {





    return acc && typeof dataItem[colIndex] === "number"


  }, true)


  let temp = { value }
  if (temp.value) {
    return temp
  } else {
    return { ...temp, reason: `Column ${valueColumnName} must contain numeric values only` }
  }

}
export const completenessCheckofIdentifierColumns = (sheetToJSONoutput, columnName) => {

  let colIndex = sheetToJSONoutput[0].indexOf(columnName);
  let value = sheetToJSONoutput.slice(1).reduce((acc, dataItem, dataIndex) => {





    return acc && !!dataItem[colIndex]


  }, true)


  let temp = { value }
  if (temp.value) {
    return temp
  } else {
    return { ...temp, reason: `Column ${columnName} contain blank values` }
  }
}

export const uniquenessCheckofIdentifierColumns = (sheetToJSONoutput, columnName) => {
  let colIndex = sheetToJSONoutput[0].indexOf(columnName);
  let tempValues = []
  let duplicateValues = []
  sheetToJSONoutput.slice(1).forEach((dataItem, dataIndex) => {


    if (tempValues.includes(dataItem[colIndex])) {
      duplicateValues.push(dataItem[colIndex])
    } else {
      tempValues.push(dataItem[colIndex])
    }


  })


  let temp = { value: duplicateValues.length === 0 }



  if (temp.value) {
    return temp
  } else {
    return { ...temp, reason: `Column ${columnName} non-unique values . Value(s) ${duplicateValues.join(" and ")} are repeated` }
  }

}

export const individualUniquessAndCOmpletenessCheck = (sheetToJSONoutput, columnName) => {

  let completenessCheck = completenessCheckofIdentifierColumns(sheetToJSONoutput, columnName)


  if (completenessCheck.value) {

    let uniquenessCheck = uniquenessCheckofIdentifierColumns(sheetToJSONoutput, columnName);



    return uniquenessCheck



  } else {
    return completenessCheck
  }

}
export const isIdentifierColumnUniqueAndComplete = (sheetToJSONoutput, AColumnName, BColumnName) => {


  const columnNameArray = sheetToJSONoutput[0];

  if (columnNameArray.includes(AColumnName) && !columnNameArray.includes(BColumnName)) {

    return individualUniquessAndCOmpletenessCheck(sheetToJSONoutput, AColumnName)

  } else if (!columnNameArray.includes(AColumnName) && columnNameArray.includes(BColumnName)) {

    return individualUniquessAndCOmpletenessCheck(sheetToJSONoutput, BColumnName)


  } else if (columnNameArray.includes(AColumnName) && columnNameArray.includes(BColumnName)) {

    return individualUniquessAndCOmpletenessCheck(sheetToJSONoutput, AColumnName)


  } else {

    return { value: false, reason: `columns ${AColumnName} and ${BColumnName} not found` }
  }

}

export const isInsideColumnSet = (sheetToJSONoutput, AColumnName, BColumnName, valueColumnName) => {

  const columnNameArray = sheetToJSONoutput[0];



  let temp = { value: ((columnNameArray.includes(AColumnName) && columnNameArray.includes(valueColumnName)) || (columnNameArray.includes(BColumnName) && columnNameArray.includes(valueColumnName))) }
  if (temp.value) {
    return temp
  } else {
    return { ...temp, reason: `Upload must either have columns ${AColumnName} and ${valueColumnName}, or columns ${BColumnName} and ${valueColumnName}.` }
  }

}