import menuInventories from './menus/inventory.menu'
import menuPurchases from './menus/purchase.menu'
import menuSales from './menus/sales.menu'
import menuParameter from './menus/parameter.menu'

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
      text: 'Parameter',
      items: menuParameter
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
    }
  ]
}
