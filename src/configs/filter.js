export default {
  isAdvancedSearch: false,
  operator: [
    { text: 'Sama dgn.', value: 'eq', allowedCategoryTypes: ['number', 'datetime', 'text', 'bit'] },
    { text: 'Tdk. sama dgn.', value: 'neq', allowedCategoryTypes: ['number', 'datetime', 'text', 'bit'] },
    { text: 'Dimulai dgn.', value: 'startwith', allowedCategoryTypes: ['text'] },
    { text: 'Diakhiri dgn.', value: 'endswith', allowedCategoryTypes: ['text'] },
    { text: 'Mengandung', value: 'contains', allowedCategoryTypes: ['text'] },
    { text: 'Tdk. mengandung', value: 'doesnotcontain', allowedCategoryTypes: ['text'] },
    { text: 'Lbh. kecil', value: 'lt', allowedCategoryTypes: ['number', 'datetime'] },
    { text: 'Lbh. besar', value: 'gt', allowedCategoryTypes: ['number', 'datetime'] },
    { text: 'Lbh. kecil sama dgn.', value: 'lte', allowedCategoryTypes: ['number', 'datetime'] },
    { text: 'Lbh. besar sama dgn.', value: 'gte', allowedCategoryTypes: ['number', 'datetime'] }
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
