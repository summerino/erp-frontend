import Excel from 'exceljs/dist/exceljs.min.js'
import { saveAs } from 'file-saver'
import { format, parseISO }  from 'date-fns'

class ExcelService {
  getExcelColumns(grid) {
    const result = []
    result.push({
      text: 'No',
      value: 'no',
      isNumber: undefined,
      isBool: false,
      customValues: null
    })
    for (let i = 0; i < grid.columns.length; i++) {
      const column = grid.columns[i].text
      if (column) {
        result.push({
          text: column,
          value: grid.columns[i].value,
          isDateTime: grid.columns[i].isDateTime,
          isNumber: grid.columns[i].isNumber,
          isBool: grid.columns[i].isBool,
          customValues: grid.columns[i].customValues
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
        // ignore column no
        if (j > 0) {
          const value = grid.data[i][columns[j].value]
          const isDateTime = columns[j].isDateTime
          const isBool = columns[j].isBool
          const customValues = columns[j].customValues
          if (isBool) {
            if (customValues) {
              if (value) {
                temp.push(customValues[0].value)
              } else {
                temp.push(customValues[1].value)
              }
            } 

            if (!customValues) {
              if (value) {
                temp.push('Aktif')
              } else {
                temp.push('Tidak Aktif')
              }
            }
          }

          if (!isBool) {
            if (value) {
              if (isDateTime) {
                temp.push(format(parseISO(value), 'dd-MMM-yyyy'))
              } else {
                temp.push(value)
              } 
            } else if (value === 0) {
              temp.push(0)
            } else {
              temp.push('')
            }
          }

          
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
  async export(title, grid, gridDefOpts, filter = null, fromSwift = false) {
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

    let count = 0

    if (filter !== null) {
      let filterRow = 3
      count = Math.ceil(filter.searches.length / 5)
      const maxLength = filter.searches.length >= 5 ? 5 : filter.searches.length
      for (let i = 0; i < count; i++) {
        const filterFontSetting = { 
          size: 9
        }
        let rowText = ''
        for (let j = 0; j < maxLength; j++) {
          const index = j + (i * maxLength)
          let criteria = ''
          let operator = ''
          const keyword = filter.searches[index].keyword
          const searchCriteria = filter.fields.find(x => x.value === filter.searches[index].field)
          if (searchCriteria) {
            criteria = searchCriteria.text
          }
          const searchOp = filter.operator.find(x => x.value === filter.searches[index].operator)
          if (searchOp) {
            operator = searchOp.text
          }
          rowText += `${criteria} ${operator} ${keyword};`
        }
        worksheet.addRow([`${rowText}`])
        worksheet.getCell(`A&${filterRow}`).font = filterFontSetting
        filterRow++
      }
    }
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
        // xSplit: columns.length, 
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
      size: 13,
      bold: true 
    }
    worksheet.getCell('A2').font = subTitleFontSetting

    const pageInfoFontSetting = { 
      size: 8
    }
    const infoRow = filter === null ? 4 : 4 + count    
    const infoRowStr = `A${infoRow}`
    worksheet.getCell(infoRowStr).font = pageInfoFontSetting

    // const pattern = {
    //   type: 'pattern',
    //   pattern:'solid',
    //   fgColor:{argb:'FFFFFF00'},
    //   bgColor:{argb:'999999'}
    // }

    const firstRow = filter === null ? 5 : 5 + count

    //style tulisan
    const headerColumnFontSettings = { 
      //name: 'Arial', 
      //size: 16
      bold: true,
      color: {argb:'FFFFFF'}
    }
    // style align header column
    for (let i = 1; i <= columns.length; i++) {
      worksheet.getCell(firstRow, i).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:  {argb:'787878'}
      }
      worksheet.getCell(firstRow, i).font = headerColumnFontSettings
      worksheet.getCell(firstRow, i).alignment = { vertical: 'middle', horizontal: 'center' }
    }

    worksheet.getRow(firstRow).height = 27
    // style align header column style
    for (let c = 0; c < columns.length; c++) {
      if (columns[c].isNumber) {
        worksheet.getColumn(c + 1).numFmt = '_ * #,##0_ ;_ * -#,##0_ ;_ * "-"_ ;_ @_ '
      } 
    }

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