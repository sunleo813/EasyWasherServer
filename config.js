var config = {
    //APP_ID: '2018062660487015',
    ALIPAY_APP_ID: '2016091400507437',
    //ALIPAY_APP_GATEWAY_URL: 'http://ec2-34-219-4-10.us-west-2.compute.amazonaws.com/alipay/rec_notify',
    ALIPAY_APP_GATEWAY_URL: 'http://182.93.37.108/aliNotify.html',
    //APP_GATEWAY_URL: 'http://www.alipay.com',
    //APP_PRIVATE_KEY_PATH: './pem/Alipay_App_Prikey2048.pem',
    ALIPAY_APP_PRIVATE_KEY_PATH: './pem/Sandbox/AppPrivateKey.txt',
    ALIPAY_PUBLIC_KEY_PATH: './pem/Sandbox/alipay_public_key.txt',
    //ALIPAY_GATEWAY: 'https://openapi.alipay.com/gateway.do?',
    ALIPAY_GATEWAY: 'https://openapi.alipaydev.com/gateway.do?',
    SERVICE_AMT: '15.00'
};

module.exports = config;