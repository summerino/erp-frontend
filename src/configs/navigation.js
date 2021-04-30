import menuGeneral from './menus/general.menu'
import menuInventories from './menus/inventory.menu'
import menuPurchases from './menus/purchase.menu'
import menuSales from './menus/sales.menu'
import menuAccounting from './menus/accounting.menu'
import menuParameter from './menus/parameter.menu'
import menuSystemManagement from './menus/systemmanagement.menu'

export default {
  // main navigation - side menu
  menu: [
    {
      text: '',
      items: [
        {
          icon: 'mdi-view-dashboard-outline',
          text: 'Dashboard',
          link: 'dashboard'
        },
        { icon: 'mdi-file-outline', text: 'Blank Page', link: 'blank' }
      ]
    },
    {
      text: 'General',
      items: menuGeneral
    },
    {
      text: 'Inventory',
      items: menuInventories
    },
    {
      text: 'Purchase',
      items: menuPurchases
    },
    {
      text: 'Sales',
      items: menuSales
    },
    {
      text: 'Accounting',
      items: menuAccounting
    },
    {
      text: 'System Management',
      items: menuSystemManagement
    },
    {
      text: 'Parameter',
      items: menuParameter
    }
  ]
}
