export default {
  redis: {
    port: 6379,
    host: process.env.REDIS_HOST!,
  },
  bull: {
    arena: {
      port: 4568,
    },
  },
  max_fcm_tokens_per_user: 50,
  login: {
    login_link_prefix: "https://yourdomain.com/?passwordless_token=",
    dynamic_link_url: "https://your_subdomain.page.link",
  },
  ios_app_bundle_id: "com.example.appname",
  android_app_package_name: "com.example.appname",
}
