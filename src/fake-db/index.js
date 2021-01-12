import mock from './mock'

import './data/currency'
import './data/customer'
import './data/inventory'
import './data/salesman'
import './data/user'

mock.onAny().passThrough() // forwards the matched request over network