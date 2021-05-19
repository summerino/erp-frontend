export default {
  isAdvancedSearch: false,
  operator: [
    { text: 'Equal', value: 'eq', allowedCategoryTypes: ['number', 'datetime', 'text', 'bit'] },
    { text: 'Not Equal', value: 'neq', allowedCategoryTypes: ['number', 'datetime', 'text', 'bit'] },
    { text: 'Start With', value: 'startwith', allowedCategoryTypes: ['text'] },
    { text: 'End With', value: 'endswith', allowedCategoryTypes: ['text'] },
    { text: 'Contains', value: 'contains', allowedCategoryTypes: ['text'] },
    { text: 'Not Contains', value: 'doesnotcontain', allowedCategoryTypes: ['text'] },
    { text: 'Less than', value: 'lt', allowedCategoryTypes: ['number', 'datetime'] },
    { text: 'Greater than', value: 'gt', allowedCategoryTypes: ['number', 'datetime'] },
    { text: 'Less than equal', value: 'lte', allowedCategoryTypes: ['number', 'datetime'] },
    { text: 'Greater than equal', value: 'gte', allowedCategoryTypes: ['number', 'datetime'] }
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
