/* ============================================
   GOGOBUS - Authentication JavaScript
   Handles Login, Sign Up, OTP, Profile forms
   ============================================ */

// ===================
// AUTH STATE
// ===================
const AuthState = {
    user: null,
    signupData: {}
};

// Helper function to load signupData from localStorage
function loadSignupDataFromStorage() {
    const savedSignupData = localStorage.getItem('gogobus_signupData');
    if (savedSignupData) {
        try {
            AuthState.signupData = JSON.parse(savedSignupData);
            return AuthState.signupData;
        } catch (e) {
            console.error('Error parsing signupData from localStorage:', e);
            localStorage.removeItem('gogobus_signupData');
            return null;
        }
    }
    return null;
}

// ===================
// LOGIN
// ===================
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    
    // Validate
    if (!validateEmail(email)) {
        showInputError(form.email, 'Please enter a valid email');
        return;
    }
    
    if (password.length < 6) {
        showInputError(form.password, 'Password must be at least 6 characters');
        return;
    }
    
    // Show loading
    setButtonLoading(form.querySelector('.btn-submit'), true);
    
    try {
        // Sign in with Supabase
        const { data, error } = await window.SupabaseAuth.signIn(email, password);
        
        if (error) throw error;
        
        // Get user profile if exists
        let profile = null;
        if (data.user) {
            try {
                profile = await window.SupabaseProfile.getProfile(data.user.id);
            } catch (profileError) {
                // Profile might not exist yet, that's okay
                console.log('Profile not found, user can complete it later');
            }
        }
        
        // Update auth state
        AuthState.user = {
            id: data.user.id,
            email: data.user.email,
            ...profile
        };
        localStorage.setItem('gogobus_user', JSON.stringify(AuthState.user));
        
        showToast('Login successful!');
        goToScreen('home');
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed. Please check your credentials.');
        showInputError(form.password, error.message || 'Invalid credentials');
    } finally {
        setButtonLoading(form.querySelector('.btn-submit'), false);
    }
}

// ===================
// SIGN UP
// ===================
async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    
    // Validate
    if (fullName.length < 2) {
        showInputError(form.fullName, 'Please enter your full name');
        return;
    }
    
    if (!validateEmail(email)) {
        showInputError(form.email, 'Please enter a valid email');
        return;
    }
    
    if (!validatePhone(phone)) {
        showInputError(form.phone, 'Please enter a valid phone number');
        return;
    }
    
    if (password.length < 8) {
        showInputError(form.password, 'Password must be at least 8 characters');
        return;
    }
    
    // Store signup data in memory and localStorage
    AuthState.signupData = { fullName, email, phone, password };
    localStorage.setItem('gogobus_signupData', JSON.stringify(AuthState.signupData));
    
    // Show loading
    setButtonLoading(form.querySelector('.btn-submit'), true);
    
    try {
        // Send magic link to email (Supabase signInWithOtp sends a link by default)
        await sendOTPCode(email);
        
        // Update verification screen with email
        document.getElementById('otp-email-display').textContent = email;
        
        showToast('Verification link sent to your email!');
        goToScreen('otp-verification');
    } catch (error) {
        console.error('Signup error:', error);
        showToast(error.message || 'Failed to send verification link. Please try again.');
    } finally {
        setButtonLoading(form.querySelector('.btn-submit'), false);
    }
}

// ===================
// EMAIL VERIFICATION (Magic Link)
// ===================
// Note: Magic link authentication is handled automatically by Supabase
// When user clicks the link in their email, they'll be redirected back
// and the auth state change will be detected by setupAuthListener

// ===================
// SEND MAGIC LINK
// ===================
async function sendOTPCode(email) {
    try {
        // Send magic link via Supabase (signInWithOtp sends a link by default)
        const { data, error } = await window.SupabaseAuth.sendOTP(email);
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Send magic link error:', error);
        throw error;
    }
}

async function resendOTP() {
    const email = AuthState.signupData?.email || document.getElementById('otp-email-display')?.textContent;
    
    if (!email) {
        showToast('Unable to resend link. Please try signing up again.');
        return;
    }
    
    const resendBtn = document.getElementById('resend-btn');
    const originalText = resendBtn.innerHTML;
    
    // Show loading state
    resendBtn.disabled = true;
    resendBtn.innerHTML = 'Sending...';
    
    try {
        // Send new magic link via Supabase
        await sendOTPCode(email);
        
        // Show success message
        showToast('New verification link sent!');
    } catch (error) {
        console.error('Resend magic link error:', error);
        showToast(error.message || 'Failed to resend link. Please try again.');
    } finally {
        // Restore button
        resendBtn.disabled = false;
        resendBtn.innerHTML = originalText;
    }
}

// ===================
// COMPLETE PROFILE
// ===================
function prefillProfileForm() {
    // Try to get signupData from memory first, then localStorage
    let data = AuthState.signupData;
    if (!data) {
        const savedSignupData = localStorage.getItem('gogobus_signupData');
        if (savedSignupData) {
            try {
                data = JSON.parse(savedSignupData);
                AuthState.signupData = data; // Also set in memory for consistency
            } catch (e) {
                console.error('Error parsing signupData from localStorage:', e);
            }
        }
    }
    
    if (data && data.fullName) {
        document.getElementById('profile-name').value = data.fullName;
    }
    if (data && data.email) {
        document.getElementById('profile-email').value = data.email;
    }
    if (data && data.phone) {
        document.getElementById('profile-phone').value = data.phone;
    }
}

async function handleProfileComplete(event) {
    event.preventDefault();
    
    const form = event.target;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const province = form.province.value;
    const city = form.city.value;
    
    // Validate
    if (fullName.length < 2) {
        showInputError(form.fullName, 'Please enter your full name');
        return;
    }
    
    if (!validateEmail(email)) {
        showInputError(form.email, 'Please enter a valid email');
        return;
    }
    
    if (!province) {
        showToast('Please select your province');
        return;
    }
    
    if (!city) {
        showToast('Please select your city');
        return;
    }
    
    // Show loading
    setButtonLoading(form.querySelector('.btn-submit'), true);
    
    try {
        // Get current user
        const session = await window.SupabaseAuth.getSession();
        if (!session || !session.user) {
            throw new Error('User not authenticated');
        }
        
        const userId = session.user.id;
        
        // Prepare profile data
        const profileData = {
            full_name: fullName,
            email: email,
            phone: phone,
            province: province,
            city: city
        };
        
        // Upload avatar if provided (check both memory and localStorage)
        let signupData = AuthState.signupData;
        if (!signupData) {
            const savedSignupData = localStorage.getItem('gogobus_signupData');
            if (savedSignupData) {
                try {
                    signupData = JSON.parse(savedSignupData);
                } catch (e) {
                    console.error('Error parsing signupData:', e);
                }
            }
        }
        
        if (signupData && signupData.avatar) {
            // If avatar is a data URL, we need to convert it to a file
            // For now, we'll store it as metadata or upload it
            // This is a simplified version - you might want to upload to Supabase Storage
            profileData.avatar_url = signupData.avatar;
        }
        
        // Update or create profile in Supabase
        let profile;
        try {
            // Try to update existing profile
            profile = await window.SupabaseProfile.updateProfile(userId, profileData);
        } catch (updateError) {
            // If profile doesn't exist, create it
            // Note: This should ideally be handled by a database trigger
            // For now, we'll try to insert
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .insert({ id: userId, ...profileData })
                .select()
                .single();
            
            if (error) throw error;
            profile = data;
        }
        
        // Update auth state
        AuthState.user = {
            id: userId,
            email: session.user.email,
            ...profile
        };
        localStorage.setItem('gogobus_user', JSON.stringify(AuthState.user));
        
        // Clear signupData from localStorage and memory since profile is now complete
        localStorage.removeItem('gogobus_signupData');
        AuthState.signupData = {};
        
        // Show success modal
        showSuccessModal();
    } catch (error) {
        console.error('Profile completion error:', error);
        showToast(error.message || 'Failed to save profile. Please try again.');
    } finally {
        setButtonLoading(form.querySelector('.btn-submit'), false);
    }
}

function previewAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('avatar-preview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
        AuthState.signupData.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ===================
// FORGOT PASSWORD
// ===================
async function handleForgotPassword() {
    const email = document.getElementById('login-email')?.value.trim();
    
    if (!email) {
        showToast('Please enter your email address first');
        document.getElementById('login-email')?.focus();
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address');
        document.getElementById('login-email')?.focus();
        return;
    }
    
    try {
        // Send password reset email via Supabase
        await window.SupabaseAuth.resetPassword(email);
        showToast(`Password reset link sent to ${email}`);
    } catch (error) {
        console.error('Password reset error:', error);
        showToast(error.message || 'Failed to send reset email. Please try again.');
    }
}

// ===================
// SOCIAL LOGIN
// ===================
async function handleSocialLogin(provider) {
    try {
        // Sign in with OAuth provider via Supabase
        const { data, error } = await window.SupabaseAuth.signInWithProvider(provider);
        
        if (error) throw error;
        
        // OAuth will redirect, so we don't need to handle the response here
        showToast(`Redirecting to ${provider}...`);
    } catch (error) {
        console.error('Social login error:', error);
        showToast(error.message || `Failed to sign in with ${provider}. Please try again.`);
    }
}

// ===================
// MODAL
// ===================
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');
}

function closeModal(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// ===================
// PASSWORD TOGGLE
// ===================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    const eyeOpen = button.querySelector('.eye-open');
    const eyeClosed = button.querySelector('.eye-closed');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

// ===================
// VALIDATION HELPERS
// ===================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Allow various formats, minimum 7 digits
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
}

function showInputError(input, message) {
    const wrapper = input.closest('.input-wrapper');
    wrapper.classList.add('error');
    
    // Remove existing error message
    const existingError = wrapper.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Add error message
    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    wrapper.parentElement.appendChild(errorEl);
    
    // Focus input
    input.focus();
    
    // Remove error on input
    const removeError = () => {
        wrapper.classList.remove('error');
        errorEl.remove();
        input.removeEventListener('input', removeError);
    };
    input.addEventListener('input', removeError);
}

// ===================
// UI HELPERS
// ===================
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const messageEl = toast.querySelector('.toast-message');
    
    messageEl.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ===================
// LOGOUT
// ===================
async function logout() {
    try {
        // Sign out from Supabase
        await window.SupabaseAuth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Clear local state
    AuthState.user = null;
    AuthState.signupData = {};
    localStorage.removeItem('gogobus_user');
    localStorage.removeItem('gogobus_signupData');
    localStorage.removeItem('gogobus_onboarding_complete');
    localStorage.removeItem('gogobus_last_screen');
    
    showToast('Logged out successfully');
    goToScreen('get-started');
}

// ===================
// CHECK AUTH ON LOAD
// ===================
async function checkAuth() {
    try {
        // Load signupData from localStorage if available
        loadSignupDataFromStorage();
        
        // Handle magic link redirect (check URL hash for access_token)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
            // User just clicked magic link, clear hash
            window.location.hash = '';
        }
        
        // Check Supabase session
        const session = await window.SupabaseAuth.getSession();
        
        if (session && session.user) {
            // Get user profile
            let profile = null;
            try {
                profile = await window.SupabaseProfile.getProfile(session.user.id);
            } catch (profileError) {
                // Profile might not exist yet
                console.log('Profile not found');
            }
            
            AuthState.user = {
                id: session.user.id,
                email: session.user.email,
                ...profile
            };
            localStorage.setItem('gogobus_user', JSON.stringify(AuthState.user));
            
            // If user already has a profile, clear any stale signupData
            if (profile) {
                localStorage.removeItem('gogobus_signupData');
                AuthState.signupData = {};
            }
            
            // If user just verified and has signup data, navigate to complete profile
            if (accessToken && AuthState.signupData && Object.keys(AuthState.signupData).length > 0 && !profile) {
                prefillProfileForm();
                goToScreen('complete-profile');
            }
        } else {
            // Fallback to localStorage
            const savedUser = localStorage.getItem('gogobus_user');
            if (savedUser) {
                try {
                    AuthState.user = JSON.parse(savedUser);
                } catch (e) {
                    localStorage.removeItem('gogobus_user');
                }
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
        // Fallback to localStorage
        const savedUser = localStorage.getItem('gogobus_user');
        if (savedUser) {
            try {
                AuthState.user = JSON.parse(savedUser);
            } catch (e) {
                localStorage.removeItem('gogobus_user');
            }
        }
    }
}

// ===================
// AUTH STATE LISTENER
// ===================
async function handleAuthSuccess(session) {
    if (!session || !session.user) return;
    
    try {
        // Load signupData from localStorage if not already in memory
        if (!AuthState.signupData || Object.keys(AuthState.signupData).length === 0) {
            loadSignupDataFromStorage();
        }
        
        // Get user profile if exists
        let profile = null;
        try {
            profile = await window.SupabaseProfile.getProfile(session.user.id);
        } catch (profileError) {
            // Profile might not exist yet
            console.log('Profile not found');
        }
        
        AuthState.user = {
            id: session.user.id,
            email: session.user.email,
            ...profile
        };
        localStorage.setItem('gogobus_user', JSON.stringify(AuthState.user));
        
        // If user came from signup and has signup data, go to complete profile
        if (AuthState.signupData && Object.keys(AuthState.signupData).length > 0 && !profile) {
            prefillProfileForm();
            showToast('Email verified successfully!');
            goToScreen('complete-profile');
        } else {
            showToast('Welcome back!');
            goToScreen('home');
        }
    } catch (error) {
        console.error('Error handling auth success:', error);
        showToast('Authentication successful, but there was an error loading your profile.');
    }
}

function setupAuthListener() {
    if (window.SupabaseAuth && window.SupabaseAuth.onAuthStateChange) {
        window.SupabaseAuth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
                // User signed in (likely from magic link)
                await handleAuthSuccess(session);
            } else if (event === 'SIGNED_OUT') {
                // User signed out
                AuthState.user = null;
                localStorage.removeItem('gogobus_user');
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Supabase to be ready
    if (window.SupabaseAuth && window.supabaseClient) {
        checkAuth();
        setupAuthListener();
    } else {
        // Retry after a short delay if Supabase isn't loaded yet
        setTimeout(() => {
            if (window.SupabaseAuth && window.supabaseClient) {
                checkAuth();
                setupAuthListener();
            } else {
                console.error('Supabase not loaded. Make sure supabase-config.js is loaded before auth.js');
            }
        }, 100);
    }
});

// Expose functions globally
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleProfileComplete = handleProfileComplete;
window.handleSocialLogin = handleSocialLogin;
window.handleForgotPassword = handleForgotPassword;
window.togglePassword = togglePassword;
window.resendOTP = resendOTP;
window.previewAvatar = previewAvatar;
window.showToast = showToast;
window.closeModal = closeModal;
window.logout = logout;
