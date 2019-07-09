export default {
  redis: {
    port: 6379,
    host: process.env.REDIS_HOST!
  },
  bull: {
    arena: {
      port: 4568
    }
  },
  maxFcmTokensPerUser: 50,
  login: {
    loginLinkPrefix: "https://yourdomain.com/?passwordless_token=",
    dynamicLinkUrl: "https://your_subdomain.page.link"
  },
  iosAppBundleId: "com.example.appname",
  androidAppPackageName: "com.example.appname"
}
