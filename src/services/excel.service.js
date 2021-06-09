import Excel from 'exceljs/dist/exceljs.min.js'
import { saveAs } from 'file-saver'

class ExcelService {
  getExcelColumns(grid) {
    const result = []
    result.push({
      text: 'No',
      value: 'no'
    })
    for (let i = 0; i < grid.columns.length; i++) {
      const column = grid.columns[i].text
      if (column) {
        result.push({
          text: column,
          value: grid.columns[i].value
        })
      }
    }
    return result
  }
  getExcelField(grid) {
    const result = []
    result.push('No')
    for (let i = 0; i < grid.columns.length; i++) {
      const column = grid.columns[i].value
      if (column && column !== 'sw_action') {
        result.push(column)
      }
    }
    return result
  }
  getExcelDatas(grid, columns, strNumber) {
    const result = []
    let number = Number(strNumber)
    
    for (let i = 0; i < grid.data.length; i++) {
      const temp = [] 
      temp.push(number)
      for (let j = 0; j < columns.length; j++) {

        const value = grid.data[i][columns[j].value]
        if (value) {
          temp.push(value)
        }
      }
      result.push(temp)
      number++
    }
    return result
  }
  getFirstNumber(currentPage, pageSize) {
    return `${Math.ceil((currentPage - 1) * pageSize) + 1}`
  }
  getPageInfo(firstNumber, currentPage, pageSize, totalRow) {
    const num = totalRow < Math.ceil(currentPage * pageSize) ? totalRow : Math.ceil(currentPage * pageSize)
    return `${firstNumber} - ${num} dari ${totalRow} data`    
  }
  async export(title, grid, gridDefOpts, fromSwift = false) {
    debugger
    const company = 'Sahassa'    
    const currentPage = grid.options.page
    const pageSize = gridDefOpts.pageSize
    const totalRow = !fromSwift ? grid.total : grid.rowCount  
    const firstNumber = this.getFirstNumber(currentPage, pageSize)
    const pageInfo = this.getPageInfo(firstNumber, currentPage, pageSize, totalRow)
    const columns = this.getExcelColumns(grid)
    const datas = this.getExcelDatas(grid, columns, firstNumber)
    
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet(title)
    
    // render title
    worksheet.addRow([company])
    worksheet.addRow([title])
    worksheet.addRow([''])
    worksheet.addRow([pageInfo])
    const columnOnly = columns.map(x => {
      return x.text
    })
    worksheet.addRow(columnOnly)
    datas.forEach(data => {
      worksheet.addRow(data)
    })

    worksheet.views = [
      {
        state: 'frozen', 
        xSplit: columns.length, 
        ySplit: 5 
        //topLeftCell: 'G10', 
        //activeCell: 'A1'
      }
    ]
    const titleFontSetting = { 
      //name: 'Arial', 
      size: 18,
      bold: true 
    }
    worksheet.getCell('A1').font = titleFontSetting

    const subTitleFontSetting = { 
      //name: 'Arial', 
      size: 14,
      bold: true 
    }
    worksheet.getCell('A2').font = subTitleFontSetting

    const pageInfoFontSetting = { 
      size: 9
    }
    worksheet.getCell('A4').font = pageInfoFontSetting

    const pattern = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'FFFFFF00'},
      bgColor:{argb:'6e6e6e'}
    }

    //style tulisan
    const headerColumnFontSettings = { 
      //name: 'Arial', 
      //size: 16
      bold: true 
    }

    // style align header column
    for (let i = 1; i <= columns.length; i++) {
      worksheet.getCell(5, i).fill = pattern
      worksheet.getCell(5, i).font = headerColumnFontSettings
      worksheet.getCell(5, i).alignment = { vertical: 'middle', horizontal: 'center' }
    }
    const firstRow = 5
    // style align column number
    for (let i = 0; i <= datas.length; i++) {
      worksheet.getCell(i + firstRow, 1).alignment = { vertical: 'middle', horizontal: 'center' }
    }
    
    // apply col width
    const col = grid.columns
    for (let i = 0; i < col.length; i++) {
      const colWidth = col[i].excelColWidth
      if (colWidth) {
        worksheet.columns[i].width = colWidth
      } else {
        worksheet.columns[i].width = 10 // default col
      }
    }
    const buf = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buf]), `${title}.xlsx`)
  }
}
export default new ExcelService