export default [
  {
    path: '/human-resource/report/attendance-report',
    name: 'attendance-report',
    component: () => import(/* webpackChunkName: "human-resource" */ '@/views/humanresource/report/AttendanceReport.vue'),
    meta: {
      authRequired: true
    }
  }
]
