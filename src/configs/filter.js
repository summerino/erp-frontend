export default {
  isAdvancedSearch: false,
  operator: [
    { 
      text: 'Sama dgn.', 
      value: 'eq', 
      swiftValue: '1', 
      allowedCategoryTypes: ['number', 'datetime', 'text', 'bit'] 
    },
    { 
      text: 'Tdk. sama dgn.', 
      value: 'neq', 
      swiftValue: '2', 
      allowedCategoryTypes: ['number', 'datetime', 'text', 'bit'] 
    },
    { 
      text: 'Dimulai dgn.', 
      value: 'startswith', 
      swiftValue: '3', 
      allowedCategoryTypes: ['text'] 
    },
    { 
      text: 'Diakhiri dgn.', 
      value: 'endswith', 
      swiftValue: '4', 
      allowedCategoryTypes: ['text'] 
    },
    { 
      text: 'Mengandung', 
      value: 'contains', 
      swiftValue: '5', 
      allowedCategoryTypes: ['text'] 
    },
    { 
      text: 'Tdk. mengandung', 
      value: 'doesnotcontain', 
      swiftValue: '6', 
      allowedCategoryTypes: ['text'] 
    },
    { 
      text: 'Lbh. kecil', 
      value: 'lt', 
      swiftValue: '7', 
      allowedCategoryTypes: ['number', 'datetime'] 
    },
    { 
      text: 'Lbh. besar', 
      value: 'gt', 
      swiftValue: '8', 
      allowedCategoryTypes: ['number', 'datetime'] 
    },
    { 
      text: 'Lbh. kecil sama dgn.', 
      value: 'lte', 
      swiftValue: '9', 
      allowedCategoryTypes: ['number', 'datetime'] 
    },
    { 
      text: 'Lbh. besar sama dgn.', 
      value: 'gte', 
      swiftValue: '10', 
      allowedCategoryTypes: ['number', 'datetime'] 
    }
  ],
  mapDataTypeToCategory: [
    {
      category: 'number',
      dataTypes: [
        'bigint',
        'decimal',
        'float',
        'int',
        'money',
        'real',
        'smallint',
        'smallmoney',
        'tinyint'
      ]
    },
    {
      category: 'text',
      dataTypes: [
        'nchar',
        'ntext',
        'nvarchar',
        'text',
        'varchar',
        'char'
      ]
    },
    {
      category: 'datetime',
      dataTypes: [
        'datetime',
        'timestamp',
        'date',
        'time',
        'datetime2'
      ]
    },
    {
      category: 'bit',
      dataTypes: [
        'bit'
      ]
    }
  ],
  fields: [],
  search: '',
  searches: []
}
