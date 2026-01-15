module.exports = function handler(req, res) {
  try {
    // Firebase config from environment variables
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    // Paystack config
    const paystackConfig = {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY
    };

    // reCAPTCHA config
    const recaptchaConfig = {
      siteKey: process.env.RECAPTCHA_SITE_KEY
    };

    // Check if required Firebase config is available
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      return res.status(500).json({
        error: 'Firebase configuration not available'
      });
    }

    res.status(200).json({
      firebase: firebaseConfig,
      paystack: paystackConfig,
      recaptcha: recaptchaConfig
    });
  } catch (error) {
    console.error('Config API error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}