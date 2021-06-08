import Excel from 'exceljs/dist/es5/exceljs.browser.js'
import { saveAs } from 'file-saver'

class ExcelService {
  getExcelColumns(grid) {
    const result = []
    result.push('No')
    for (let i = 0; i < grid.columns.length; i++) {
      const column = grid.columns[i].text
      if (column) {
        result.push(column)
      }
    }
    return result
  }
  getExcelDatas(grid, strNumber) {
    const result = []
    let number = Number(strNumber)
    for (let i = 0; i < grid.data.length; i++) {
      const temp = [] 
      const code = grid.data[i].code
      const initial = grid.data[i].initial
      const name = grid.data[i].name
      const address = grid.data[i].address
      const phone = grid.data[i].phone
      const isDefault = grid.data[i].isDefault
      temp.push(
        number,
        code,
        initial,
        name,
        address,
        phone,
        isDefault
      )
      result.push(temp)
      number++
    }
    return result
  }
  getFirstNumber(currentPage, pageSize) {
    return `${Math.ceil((currentPage - 1) * pageSize) + 1}`
  }
  getPageInfo(firstNumber, currentPage, pageSize, totalRow) {
    return `${firstNumber} - ${Math.ceil(currentPage * pageSize)} dari ${totalRow} data`    
  }
  async export(title, grid, gridDefOpts) {
    
    const company = 'Sahassa'
    const currentPage = grid.options.page
    const pageSize = gridDefOpts.pageSize
    const totalRow = grid.total  
    const firstNumber = this.getFirstNumber(currentPage, pageSize)
    const pageInfo = this.getPageInfo(firstNumber, currentPage, pageSize, totalRow)
    const columns = this.getExcelColumns(grid)
    const datas = this.getExcelDatas(grid, firstNumber)
    
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet(title)
    
    // render title
    worksheet.addRow([company])
    worksheet.addRow([title])
    worksheet.addRow([''])
    worksheet.addRow([pageInfo])

    worksheet.addRow(columns)
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

    worksheet.getCell('A5').fill = pattern
    worksheet.getCell('B5').fill = pattern
    worksheet.getCell('C5').fill = pattern
    worksheet.getCell('D5').fill = pattern
    worksheet.getCell('E5').fill = pattern
    worksheet.getCell('F5').fill = pattern
    worksheet.getCell('G5').fill = pattern

    //style tulisan
    const headerColumnFontSettings = { 
      //name: 'Arial', 
      //size: 16
      bold: true 
    }
    worksheet.getCell('A5').font = headerColumnFontSettings
    worksheet.getCell('B5').font = headerColumnFontSettings
    worksheet.getCell('C5').font = headerColumnFontSettings
    worksheet.getCell('D5').font = headerColumnFontSettings
    worksheet.getCell('E5').font = headerColumnFontSettings
    worksheet.getCell('F5').font = headerColumnFontSettings
    worksheet.getCell('G5').font = headerColumnFontSettings

    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A8').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A9').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A10').alignment = { vertical: 'middle', horizontal: 'center' }

    const buf = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buf]), `${title}.xlsx`)
  }

}
export default new ExcelService