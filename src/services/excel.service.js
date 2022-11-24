import Excel from 'exceljs/dist/exceljs.min.js'
import { saveAs } from 'file-saver'
import { format, parseISO }  from 'date-fns'

class ExcelService {
  getExcelColumns(grid, addColumNo) {
    const result = []
    if (addColumNo) {
      result.push({
        text: 'No',
        value: 'no',
        isNumber: undefined,
        isCurrency: undefined,
        isBool: false,
        customValues: null
      })
    }
    for (let i = 0; i < grid.columns.length; i++) {
      const column = grid.columns[i].text
      if (column) {
        result.push({
          text: column,
          value: grid.columns[i].value,
          isDateTime: grid.columns[i].isDateTime,
          isFullDateTime: grid.columns[i].isFullDateTime,
          isTimeOnly: grid.columns[i].isTimeOnly,
          isNumber: grid.columns[i].isNumber,
          isCurrency: grid.columns[i].isCurrency,
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
  renderColumnDatas(worksheet, countHeaderRow, grid, columns, number) {
    number = Number(number)

    for (let i = 0; i < grid.data.length; i++) {
      const row = worksheet.getRow(countHeaderRow + i + 1)
      if (number > 0) {
        row.getCell(1).value = number
        number++
      }

      for (let j = 0; j < columns.length; j++) {
        if (columns[j].value === 'no') continue

        const value = grid.data[i][columns[j].value]
        const isBold = grid.data[i]['isBold'] ?? false
        const isDateTime = columns[j].isDateTime
        const isFullDateTime = columns[j].isFullDateTime
        const isTimeOnly = columns[j].isTimeOnly
        const isBool = columns[j].isBool
        const customValues = columns[j].customValues
        
        let cellValue = ''
        if (isBool) {
          if (customValues) {
            if (value) {
              cellValue = customValues[0].value
            } else {
              cellValue = customValues[1].value
            }
          }

          if (!customValues) {
            if (value) {
              cellValue = 'Aktif'
            } else {
              cellValue = 'Tidak Aktif'
            }
          }
        }

        if (!isBool) {
          if (value) {
            if (isDateTime) {
              cellValue = format(parseISO(value), 'dd-MMM-yyyy')
              row.getCell(j + 1).alignment = { horizontal: 'right' }
            } else if (isFullDateTime) {
              cellValue = format(parseISO(value), 'dd-MMM-yyyy HH:mm:ss')
              row.getCell(j + 1).alignment = { horizontal: 'right' }
            } else if (isTimeOnly) {
              cellValue = format(parseISO(value), 'HH:mm')
            } else if (customValues) {
              for (let v = 0; v < customValues.length; v++) {
                cellValue += ` - ${grid.data[i][customValues[v]]}`
              }
              cellValue = cellValue.substr(3)
            } else {
              cellValue = value
            }
          } else if (value === 0) {
            cellValue = 0
          }
        }

        row.getCell(j + 1).value = cellValue
        if (isBold) {
          row.getCell(j + 1).font = { bold: true }
        }
      }
    }
  }
  getFirstNumber(currentPage, pageSize) {
    return `${Math.ceil((currentPage - 1) * pageSize) + 1}`
  }
  getPageInfo(firstNumber, currentPage, pageSize, totalRow) {
    const num = totalRow < Math.ceil(currentPage * pageSize) ? totalRow : Math.ceil(currentPage * pageSize)
    return `${firstNumber} - ${num} dari ${totalRow} data`
  }
  async export(company, title, grid, gridDefOpts, filter = null, fromSwift = false) {
    const currentPage = grid?.options?.page
    const pageSize = grid?.options?.itemsPerPage || gridDefOpts.pageSize

    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet(title)

    // Render title
    worksheet.addRow([company])
    worksheet.getCell('A1').font = {
      size: 18,
      bold: true
    }

    worksheet.addRow([title])
    worksheet.getCell('A2').font = {
      size: 13,
      bold: true
    }

    let countHeaderRow = 2
    if (filter !== null) {
      const count = Math.ceil(filter.searches.length / 5)
      const maxLength = filter.searches.length >= 5 ? 5 : filter.searches.length
      for (let i = 0; i < count; i++) {
        let rowText = ''
        for (let j = 0; j < maxLength; j++) {
          const index = j + (i * maxLength)
          let criteria = ''
          let operator = ''
          if (filter.searches[index]) {
            const keyword = filter.searches[index].keyword
            const searchCriteria = filter.fields.find(x => x.value === filter.searches[index].field)
            if (searchCriteria) {
              criteria = searchCriteria.text
            }
            const searchOp = filter.operator.find(x => x.value === filter.searches[index].operator)
            if (searchOp) {
              operator = searchOp.text
            }
            rowText += `; ${criteria} ${operator} ${keyword}`
          }
        }
        if (rowText.length > 0) {
          rowText = rowText.substring(2)
        }
        countHeaderRow++
        worksheet.getCell(countHeaderRow, 1).value = rowText
        worksheet.getCell(`A&${countHeaderRow}`).font = { size: 9 }
      }
    }

    worksheet.addRow([''])
    countHeaderRow++

    let firstNumber = 0
    if (currentPage && pageSize > 0) {
      const totalRow = !fromSwift ? grid.total : grid.rowCount
      firstNumber = this.getFirstNumber(currentPage, pageSize)
      const pageInfo = this.getPageInfo(firstNumber, currentPage, pageSize, totalRow)
      worksheet.addRow([pageInfo])
      countHeaderRow++

      worksheet.getCell(`A${countHeaderRow}`).font = { size: 8 }
    }

    // Render header columns
    const columns = this.getExcelColumns(grid, currentPage && pageSize > 0)
    const columnOnly = columns.map(x => {
      return x.text
    })
    worksheet.addRow(columnOnly)
    countHeaderRow++

    // Render column datas
    this.renderColumnDatas(worksheet, countHeaderRow, grid, columns, firstNumber)

    // Header columns style
    for (let i = 0; i < columns.length; i++) {
      // Border & align
      worksheet.getCell(countHeaderRow, i + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor:  { argb:'787878' }
      }
      worksheet.getCell(countHeaderRow, i + 1).font = {
        bold: true,
        color: { argb:'FFFFFF' }
      }
      worksheet.getCell(countHeaderRow, i + 1).alignment = { vertical: 'middle', horizontal: 'center' }

      // Format cell
      if (columns[i].isNumber) {
        worksheet.getColumn(i + 1).numFmt = '#,##0'
      } else if (columns[i].isCurrency) {
        worksheet.getColumn(i + 1).numFmt = '#,##0.00'
      // } else if (columns[i].isDateTime) {
      //   worksheet.getColumn(i + 1).numFmt = 'dd-MMM-yyyy'
      //   worksheet.getColumn(i + 1).alignment = { vertical: 'middle', horizontal: 'right' }
      // } else if (columns[i].isFullDateTime) {
      //   worksheet.getColumn(i + 1).numFmt = 'dd-MMM-yyyy HH:mm:ss'
      //   worksheet.getColumn(i + 1).alignment = { vertical: 'middle', horizontal: 'right' }
      }
    }
    worksheet.getRow(countHeaderRow).height = 27

    // Style align column number
    // for (let i = 0; i <= datas.length; i++) {
    //   worksheet.getCell(i + countHeaderRow, 1).alignment = { vertical: 'middle', horizontal: 'center' }
    // }

    // Apply column width
    for (let i = 0; i < grid.columns.length; i++) {
      const colWidth = grid.columns[i].excelColWidth
      if (colWidth) {
        worksheet.columns[i].width = colWidth
      } else {
        worksheet.columns[i].width = 10 // default col
      }
    }

    // Frozen column
    worksheet.views = [{
      state: 'frozen',
      ySplit: countHeaderRow
    }]

    const buf = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buf]), `${title}.xlsx`)
  }
}
export default new ExcelService