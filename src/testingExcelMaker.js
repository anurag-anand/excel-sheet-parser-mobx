
let excel = require('exceljs');

let workbook1 = new excel.Workbook();
workbook1.creator = 'Me';
workbook1.lastModifiedBy = 'Me';
workbook1.created = new Date();
workbook1.modified = new Date();
let sheet1 = workbook1.addWorksheet('Sheet1');
let sheet2 = workbook1.addWorksheet('Sheet2')
let sheet3 = workbook1.addWorksheet('Sheet3')

let columnNameArr = []

// sheet1.columns = reColumns;
let input = process.stdin;
input.setEncoding('utf-8');
const uniquid = require('uniquid')
const abc = () => {

	console.log([...columnNameArr].splice(0, 3), "XXXX", [...columnNameArr].slice(3))
	sheet1.columns = [...columnNameArr].splice(0, 3).map(x => x.replace('\n', '')).map(x => ({ header: x, key: x }))
	sheet2.columns = [...columnNameArr].splice(3, 3).map(x => x.replace('\n', '')).map(x => ({ header: x, key: x }))
	sheet3.columns = [...columnNameArr].slice(6).map(x => x.replace('\n', '')).map(x => ({ header: x, key: x }))

	new Array(5).fill('').forEach(x => {

		let temp = [...columnNameArr].splice(0, 3).map(x => x.replace('\n', '')).reduce((acc, item) => {
			return { ...acc, [item]: item != "X" ? uniquid() : Math.ceil(10000 + Math.random() * 10000) }
		}, {})

		console.log(temp)
		sheet1.addRow(temp);
	})
	new Array(5).fill('').forEach(x => {

		let temp = [...columnNameArr].splice(3, 3).map(x => x.replace('\n', '')).reduce((acc, item) => {
			return { ...acc, [item]: item != "X" ? uniquid() : Math.ceil(10000 + Math.random() * 10000) }
		}, {})

		console.log(temp)
		sheet2.addRow(temp);
	})

	new Array(5).fill('').forEach(x => {

		let temp = [...columnNameArr].slice(6).map(x => x.replace('\n', '')).reduce((acc, item) => {
			return { ...acc, [item]: item != "X" ? uniquid() : Math.ceil(10000 + Math.random() * 10000) }
		}, {})

		console.log(temp)
		sheet3.addRow(temp);
	})

	workbook1.xlsx
		.writeFile(`ex_${columnNameArr.map(x => x.replace('\n', '')).join('_')}.xlsx`)
		.then(function () {
			console.log('xlsx file is written.');
			process.exit();

		});

	// console.log(final);
};

input.on('data', data => {
	if (data === 'exit\n') {
		abc();
	} else {
		columnNameArr.push(data)
	}
});
