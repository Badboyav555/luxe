// URL Trapper Interceptor Pipeline configuration mapping module
function captureAndPersistReferralTokens() {
    const URLQueryParamConfig = new URLSearchParams(window.location.search);
    const incomingRefCodeToken = URLQueryParamConfig.get('ref');

    if(incomingRefCodeToken) {
        // Storing data to link the referral loop during product purchases
        localStorage.setItem('active_referral_token', incomingRefCodeToken.trim());
        showToast('Referral badge tracked active.');
    }
}

// Immediately self-invoke to intercept navigation entry points
captureAndPersistReferralTokens();
