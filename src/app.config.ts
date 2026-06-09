export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/access/index',
    'pages/service/index',
    'pages/resource/index',
    'pages/message/index',
    'pages/visitor-apply/index',
    'pages/ticket-submit/index',
    'pages/ticket-detail/index',
    'pages/meeting-book/index',
    'pages/desk-book/index',
    'pages/message-detail/index',
    'pages/booking-detail/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '智慧楼宇',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#165DFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/access/index',
        text: '通行'
      },
      {
        pagePath: 'pages/service/index',
        text: '服务'
      },
      {
        pagePath: 'pages/resource/index',
        text: '资源'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      }
    ]
  }
})
