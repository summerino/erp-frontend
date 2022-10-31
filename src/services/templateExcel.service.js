import Excel from 'exceljs/dist/exceljs.min.js'
import { saveAs } from 'file-saver'

class TemplateExcelService {
  getExcelColumns(grid) {
    const result = []
    result.push({
      text: 'No',
      value: 'no',
      isNumber: undefined,
      isBool: false,
      customValues: null
    })
    for (let i = 0; i < grid.template.length; i++) {
      const column = grid.template[i].text
      if (column) {
        result.push({
          text: column,
          value: grid.template[i].value,
          isDateTime: grid.template[i].isDateTime,
          isTimeOnly: grid.template[i].isTimeOnly,
          isNumber: grid.template[i].isNumber,
          isBool: grid.template[i].isBool,
          customValues: grid.template[i].customValues
        })
      }
    }
    return result
  }
  getExcelField(grid) {
    const result = []
    result.push('No')
    for (let i = 0; i < grid.template.length; i++) {
      const column = grid.template[i].value
      if (column && column !== 'sw_action') {
        result.push(column)
      }
    }
    return result
  }
  async export(title, grid) {
    const columns = this.getExcelColumns(grid)
    
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet(title)

    const columnOnly = columns.map(x => {
      return x.text
    })
    worksheet.addRow(columnOnly)

    //style tulisan
    const headerColumnFontSettings = { 
      //name: 'Arial', 
      //size: 16
      bold: true,
      color: {argb:'000000'}
    }

    // style column format
    for (let c = 0; c < columns.length; c++) {
      if (columns[c].isNumber) {
        worksheet.getColumn(c + 1).numFmt = '_ * #,##0_ ;_ * -#,##0_ ;_ * "-"_ ;_ @_ '
      } 
      if (columns[c].isDateTime) {
        //worksheet.getColumn(c + 1).numFmt = 'dd-MMM-yyyy' 
        worksheet.getColumn(c + 1).alignment = { vertical: 'middle', horizontal: 'right' }
      } 
    }

    // style align header column
    for (let i = 1; i <= columns.length; i++) {
      worksheet.getCell(1, i).border = {
        left: {style:'thick'},
        bottom: {style:'thick'},
        right: {style:'thick'}
      }
      worksheet.getCell(1, i).font = headerColumnFontSettings
      worksheet.getCell(1, i).alignment = { vertical: 'middle', horizontal: 'center' }
    }
    worksheet.getRow(1).height = 50

    // apply column width
    for (let i = 0; i < grid.template.length; i++) {
      const colWidth = grid.template[i].excelColWidth
      if (colWidth) {
        worksheet.columns[i].width = colWidth
      } else {
        worksheet.columns[i].width = 10 // default col
      }
    }
    
    worksheet.getCell('H2').value = 'Notes:'
    worksheet.getCell('H2').font = headerColumnFontSettings
    worksheet.getCell('H2').alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.getCell('H3').value = 'Format "Nilai" tidak boleh menggunakan format Indonesia. Contoh: 5000000.00, 220000.00'
    worksheet.getCell('H3').font = headerColumnFontSettings
    worksheet.getCell('H3').alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.getCell('H4').value = 'Format "Tanggal" tidak boleh menggunakan format Indonesia. Contoh: mm/dd/yyyy, mm-dd-yyyy'
    worksheet.getCell('H4').font = headerColumnFontSettings
    worksheet.getCell('H4').alignment = { vertical: 'middle', horizontal: 'left' }

    const buf = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buf]), `${title}.xlsx`)
  }

  async extractData(file) {
    const workbook = new Excel.Workbook()
    const values = []
    const result = []
    await workbook.xlsx.load(file)
    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        if (row.values[1] !== undefined) {
          values.push(row.values)
        }
      })
    })

    for (let index = 0; index < values.length; index++) {
      values[index].shift()
    }

    const header = values.shift()

    for (let i = 0; i < values.length; i++) {
      const obj = new Object()
      for (let j = 0; j < header.length; j++) {
        obj[header[j].toLowerCase().replace(/[ ,.]/g, '')] = values[i][j]
      }
      obj['mark'] = false
      result.push(obj)
    }
  
    return result
  }
}
export default new TemplateExcelService