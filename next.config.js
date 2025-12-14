/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config, { isServer }) => {
    // whatsapp-web.js için özel yapılandırma
    if (!isServer) {
      // Client-side'da whatsapp-web.js'i tamamen ignore et
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      }
      
      // whatsapp-web.js'i externals'a ekle
      config.externals.push('whatsapp-web.js', 'qrcode-terminal')
    } else {
      // Server-side için whatsapp-web.js'i externals'a ekle
      config.externals = [...config.externals, 'whatsapp-web.js']
    }
    
    // Tüm WAWebX modüllerini ignore et
    config.resolve.alias = {
      ...config.resolve.alias,
      'WAWebPollsVotesSchema': false,
      'WAWebMsgInfoSchema': false,
      'WAWebMsgInfoStore': false,
      'WAWebMsgKey': false,
      'WAWebMsgStore': false,
      'WAWebPresenceStore': false,
      'WAWebProfilePicThumbStore': false,
      'WAWebStatusStore': false,
      'WAWebUserPrefsStore': false,
    }
    
    return config
  }
}

module.exports = nextConfig

