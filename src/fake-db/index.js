import mock from './mock'

import './general'
import './inventory'
import './purchase'
import './sales'
import './user'

mock.onAny().passThrough() // forwards the matched request over network