let isSignUpMode = false;

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    document.getElementById('submitAuthBtn').innerText = isSignUpMode ? 'Create Account' : 'Sign In';
    document.getElementById('toggleModeBtn').innerText = isSignUpMode ? 'Existing Identity? Sign In' : 'New User? Create Account';
}

async function handleAuthenticationAction(e) {
    e.preventDefault();
    const phone = document.getElementById('authPhone').value.trim();
    const password = document.getElementById('authPassword').value;
    
    // Convert mobile number into custom internal email pseudo format mapping logic requirement specification 
    const pseudoEmail = `${phone}@app.com`;
    
    if(isSignUpMode) {
        // Sign Up Sequence Trigger System Loop
        const { data: authData, error: signUpError } = await _supabase.auth.signUp({
            email: pseudoEmail,
            password: password
        });

        if(signUpError) { showToast(`Auth Registration Error: ${signUpError.message}`); return; }

        if(authData && authData.user) {
            // Seed Profile Configuration Data Objects Atomically 
            const generativeRefCode = `LX${phone.substring(6)}${Math.floor(100 + Math.random() * 900)}`;
            const payloadProfile = {
                id: authData.user.id,
                phone_number: phone,
                referral_code: generativeRefCode,
                referred_by_code: localStorage.getItem('active_referral_token') || null
            };

            const { error: profileError } = await _supabase.from('profiles').insert([payloadProfile]);
            if(profileError) {
                showToast(`Profile Sync Warning: ${profileError.message}`);
            } else {
                showToast('Registration complete! Identity established.');
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            }
        }
    } else {
        // Sign In Sequence Processing Loop Execution System Check
        const { data: signInData, error: signInError } = await _supabase.auth.signInWithPassword({
            email: pseudoEmail,
            password: password
        });

        if(signInError) { showToast(`Credentials invalid: ${signInError.message}`); }
        else {
            showToast('Authorization authorized! Access granted.');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        }
    }
}
