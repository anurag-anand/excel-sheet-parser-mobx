import React, { useCallback } from "react";
import { Table, Dropdown, Button } from "semantic-ui-react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import { useDropzone } from 'react-dropzone'
import XLSX from 'xlsx';
import './App.css';
import { isSingleUpload, isValidFileType, isDataRowAvailable, isInsideColumnSet, isIdentifierColumnUniqueAndComplete, isValueColumnComplete, isValueColumnNumeric, getEmptyColumnIndexes, getDataWithoutEmptyColumns } from './commonFunctions'
const uniquid = require('uniquid')


const fileBaseStore = {
  allSheetsData: {
  },
  sheetNames: [],
  currentSheet: -1,
  workbook: null,
  fileName: null,
  fileRejected: false,
  rejectionReason: '',
  hasData: (sheetName) => {
    return (fileStore.allSheetsData[sheetName].data.length && fileStore.fileName)
  },
  first10Rows: (sheetName) => {
    return fileStore.hasData(sheetName) ? fileStore.allSheetsData[sheetName].data.filter((item, index) => index < 10) : []
  }
}

const fileStore = observable(fileBaseStore);

const reinitialise = action(() => {
  fileStore.allSheetsData = {};
  fileStore.sheetNames = [];
  fileStore.currentSheet = -1;
  fileStore.workbook = null;
  fileStore.fileName = null;

})

const setsheetNames = action((sheetNames = []) => {
  fileStore.sheetNames = sheetNames;
  fileStore.allSheetsData = sheetNames.reduce((acc, item, index) => {
    let temp = {
      data: [],
      columnNames: [],
      fileRejected: false,
      rejectionReason: ''
    }
    return { ...acc, [item]: temp }
  }, {})
})
const setCurrentSheet = action((sheetIndex) => {
  fileStore.currentSheet = sheetIndex;
  AllValidationforAsheet(fileStore.sheetNames[sheetIndex], 'A', 'B', 'X')

})
const AllValidationforAsheet = action((sheetName, columnAName, columnBName, ValueColumnName) => {
  const ws = fileStore.workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });
  const dataRowAvailCheck = isDataRowAvailable(data)
  if (dataRowAvailCheck.value && !fileStore.allSheetsData[sheetName].fileRejected) {
    const insideColumnSetCheck = isInsideColumnSet(data, columnAName, columnBName, ValueColumnName);
    if (insideColumnSetCheck.value && !fileStore.allSheetsData[sheetName].fileRejected) {
      const uniquenessNCompletnessCheck = isIdentifierColumnUniqueAndComplete(data, columnAName, columnBName)
      if (uniquenessNCompletnessCheck.value && !fileStore.allSheetsData[sheetName].fileRejected) {
        const completenessNumericCheck = isValueColumnComplete(data, ValueColumnName)
        if (completenessNumericCheck.value && !fileStore.allSheetsData[sheetName].fileRejected) {
          const numericValueColumnCheck = isValueColumnNumeric(data, ValueColumnName)
          if (numericValueColumnCheck.value && !fileStore.allSheetsData[sheetName].fileRejected) {
            const EmptyColumnsIndexes = getEmptyColumnIndexes(data)
            const dataWithoutEmptyColumns = getDataWithoutEmptyColumns(data)

            setFileContents(sheetName, data[0].filter((item, index) => !EmptyColumnsIndexes.includes(index)), dataWithoutEmptyColumns)
          } else {
            if (!fileStore.allSheetsData[sheetName].fileRejected) {
              setFileRejection(sheetName, numericValueColumnCheck.reason)
            }
          }
        } else {
          if (!fileStore.allSheetsData[sheetName].fileRejected) {
            setFileRejection(sheetName, completenessNumericCheck.reason)
          }
        }
      } else {
        if (!fileStore.allSheetsData[sheetName].fileRejected) {
          setFileRejection(sheetName, uniquenessNCompletnessCheck.reason)
        }
      }
    } else {
      if (!fileStore.allSheetsData[sheetName].fileRejected) {
        setFileRejection(sheetName, insideColumnSetCheck.reason)
      }
    }
  } else {
    if (!fileStore.allSheetsData[sheetName].fileRejected) {
      setFileRejection(sheetName, dataRowAvailCheck.reason)
    }
  }
})



const setFileContents = action((sheetName, columnNames = [], excelData = []) => {
  // extract first row from excelData.  this is the columnNames
  // the remaining rows are the actual data

  // set all the properties in the store.  One example below.

  fileStore.allSheetsData[sheetName].columnNames = columnNames

  fileStore.allSheetsData[sheetName].data = excelData

})
const setWorkBook = action((workbook) => {
  // extract first row from excelData.  this is the columnNames
  // the remaining rows are the actual data

  // set all the properties in the store.  One example below.
  fileStore.workbook = workbook;


})
const setFileRejection = action((sheetName, rejectionReason = '') => {
  // extract first row from excelData.  this is the columnNames
  // the remaining rows are the actual data

  // set all the properties in the store.  One example below.
  fileStore.allSheetsData[sheetName].fileRejected = !!rejectionReason;
  fileStore.allSheetsData[sheetName].rejectionReason = rejectionReason

})
const setFileRejectionGlobal = action((rejectionReason = '') => {
  // extract first row from excelData.  this is the columnNames
  // the remaining rows are the actual data

  // set all the properties in the store.  One example below.
  fileStore.fileRejected = !!rejectionReason;
  fileStore.rejectionReason = rejectionReason

})
const setFileName = action((fileName = null) => {
  fileStore.fileName = fileName;
})



const Main = observer(function Main() {
  const { currentSheet, fileName, first10Rows, fileRejected, rejectionReason, allSheetsData, sheetNames } = fileStore;

  const onDrop = useCallback(acceptedFiles => {
    const reader = new FileReader()

    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    const rABS = !!reader.readAsBinaryString
    if (fileStore.sheetNames.length > 0) {
      reinitialise()
      setFileRejectionGlobal()
    }
    reader.onload = (e) => {
      const singleUploadCheck = isSingleUpload(acceptedFiles)
      if (singleUploadCheck.value) {
        const fileTypeCheck = isValidFileType(acceptedFiles);
        if (fileTypeCheck.value && !fileStore.fileRejected) {
          const bstr = e.target.result;
          const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' })
          setFileName(acceptedFiles[0].name)
          setWorkBook(wb)
          setsheetNames(wb.SheetNames)
        } else {
          if (!fileStore.fileRejected) {
            setFileRejectionGlobal(fileTypeCheck.reason)
          }
        }
      } else {
        setFileRejectionGlobal(singleUploadCheck.reason)
      }
    }
    if (rABS) {
      if (!!acceptedFiles[0]) {
        reader.readAsBinaryString(acceptedFiles[0])
      } else {
        alert("given file type cannot be parsed")
      }
    }
    else reader.readAsArrayBuffer(acceptedFiles[0])
    // acceptedFiles.forEach(file => reader.readAsArrayBuffer(file))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: '.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' })

  return (
    <div>
      <div {...getRootProps()} style={{ padding: '0 20vw' }}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 30vw' }}>
        <div>File Name</div>
        <div>{fileName}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '5vh 30vw' }}>
        {fileRejected ? `This file cannot be uploaded. Reason:${rejectionReason}` : !!rejectionReason ? 'File passed all validation tests' : ''}

      </div>
      {currentSheet > -1 && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '5vh 30vw' }}>
        {allSheetsData[sheetNames[currentSheet]].fileRejected ? `This file cannot be uploaded. Reason:${allSheetsData[sheetNames[currentSheet]].rejectionReason}` : 'File passed all validation tests'}

      </div>}

      <div style={{ marginLeft: '5vw', width: '20%', marginBottom: '5vh' }}>
        {(!fileRejected && !!fileName) && (
          <Dropdown
            placeholder="Select Sheet"
            search
            selection
            fluid
            onChange={(e, data) => setCurrentSheet(data.value)}
            options={sheetNames.map((item, index) => ({ text: item, value: index }))}
          />
        )
        }
      </div>
      <div style={{ width: '100vw', maxHeight: '80vh', overflowX: 'scroll' }}>
        <Table celled  >
          <Table.Header>
            <Table.Row>
              {currentSheet > -1 && allSheetsData[sheetNames[currentSheet]].columnNames.map(abc => abc.toString()).map((item) => (
                <Table.HeaderCell key={uniquid(item)}> {item}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {currentSheet > -1 && first10Rows(sheetNames[currentSheet]).map((item, index) => (
              <Table.Row key={uniquid(index)}>
                {item.map((item1) => (
                  <Table.Cell key={uniquid(item1)}>{item1}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      {currentSheet > -1 &&
        !allSheetsData[sheetNames[currentSheet]].fileRejected
        &&
        <div>
          <Button content="Proceed" primary />
        </div>}
    </div>
  )
})

export default Main
