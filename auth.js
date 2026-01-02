/* ============================================
   GOGOBUS - Authentication JavaScript
   Handles Login, Sign Up, OTP, Profile forms
   ============================================ */

// ===================
// AUTH STATE
// ===================
const AuthState = {
    user: null,
    signupData: {},
    otpResendTimer: null,
    otpResendSeconds: 30
};

// ===================
// LOGIN
// ===================
function handleLogin(event) {
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
    
    // Simulate API call (will be replaced with Supabase)
    setTimeout(() => {
        setButtonLoading(form.querySelector('.btn-submit'), false);
        
        // For demo, just go to home
        AuthState.user = { email };
        localStorage.setItem('gogobus_user', JSON.stringify({ email }));
        showToast('Login successful!');
        goToScreen('home');
    }, 1500);
}

// ===================
// SIGN UP
// ===================
function handleSignup(event) {
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
    
    // Store signup data
    AuthState.signupData = { fullName, email, phone, password };
    
    // Show loading
    setButtonLoading(form.querySelector('.btn-submit'), true);
    
    // Simulate sending OTP
    setTimeout(() => {
        setButtonLoading(form.querySelector('.btn-submit'), false);
        
        // Update OTP screen with email
        document.getElementById('otp-email-display').textContent = email;
        
        showToast('Verification code sent!');
        goToScreen('otp-verification');
        startOTPResendTimer();
        initOTPInputs();
    }, 1500);
}

// ===================
// OTP VERIFICATION
// ===================
function initOTPInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    
    inputs.forEach((input, index) => {
        // Clear previous values
        input.value = '';
        input.classList.remove('filled', 'error');
        
        // Handle input
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Only allow numbers
            e.target.value = value.replace(/[^0-9]/g, '');
            
            if (e.target.value) {
                e.target.classList.add('filled');
                // Move to next input
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            } else {
                e.target.classList.remove('filled');
            }
            
            // Check if all filled
            checkOTPComplete();
        });
        
        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
        
        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
            
            pastedData.split('').forEach((char, i) => {
                if (inputs[i]) {
                    inputs[i].value = char;
                    inputs[i].classList.add('filled');
                }
            });
            
            // Focus last filled or next empty
            const lastIndex = Math.min(pastedData.length, inputs.length) - 1;
            if (lastIndex >= 0) {
                inputs[Math.min(lastIndex + 1, inputs.length - 1)].focus();
            }
            
            checkOTPComplete();
        });
    });
    
    // Focus first input
    setTimeout(() => inputs[0]?.focus(), 300);
}

function inputOTPDigit(digit) {
    const inputs = document.querySelectorAll('.otp-input');
    const emptyInput = Array.from(inputs).find(input => !input.value);
    
    if (emptyInput) {
        emptyInput.value = digit;
        emptyInput.classList.add('filled');
        
        const index = Array.from(inputs).indexOf(emptyInput);
        if (index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
        
        checkOTPComplete();
    }
}

function deleteOTPDigit() {
    const inputs = document.querySelectorAll('.otp-input');
    const filledInputs = Array.from(inputs).filter(input => input.value);
    
    if (filledInputs.length > 0) {
        const lastFilled = filledInputs[filledInputs.length - 1];
        lastFilled.value = '';
        lastFilled.classList.remove('filled');
        lastFilled.focus();
    }
}

function checkOTPComplete() {
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(i => i.value).join('');
    
    if (otp.length === 4) {
        // Auto-submit when complete
        setTimeout(() => handleOTPVerify({ preventDefault: () => {} }), 300);
    }
}

function handleOTPVerify(event) {
    event.preventDefault();
    
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(i => i.value).join('');
    
    if (otp.length !== 4) {
        inputs.forEach(input => input.classList.add('error'));
        showToast('Please enter the complete code');
        return;
    }
    
    // Show loading
    const submitBtn = document.querySelector('#otp-form .btn-submit');
    setButtonLoading(submitBtn, true);
    
    // Simulate verification (will be replaced with Supabase)
    setTimeout(() => {
        setButtonLoading(submitBtn, false);
        
        // For demo, accept any 4-digit code
        // In production, verify with Supabase
        
        // Pre-fill profile form with signup data
        prefillProfileForm();
        
        showToast('Verification successful!');
        goToScreen('complete-profile');
    }, 1500);
}

function startOTPResendTimer() {
    AuthState.otpResendSeconds = 30;
    const resendBtn = document.getElementById('resend-btn');
    const timerSpan = document.getElementById('resend-timer');
    
    resendBtn.disabled = true;
    
    if (AuthState.otpResendTimer) {
        clearInterval(AuthState.otpResendTimer);
    }
    
    AuthState.otpResendTimer = setInterval(() => {
        AuthState.otpResendSeconds--;
        timerSpan.textContent = `(${AuthState.otpResendSeconds}s)`;
        
        if (AuthState.otpResendSeconds <= 0) {
            clearInterval(AuthState.otpResendTimer);
            resendBtn.disabled = false;
            timerSpan.textContent = '';
        }
    }, 1000);
}

function resendOTP() {
    showToast('New code sent!');
    startOTPResendTimer();
    
    // Clear OTP inputs
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
    inputs[0]?.focus();
}

// ===================
// COMPLETE PROFILE
// ===================
function prefillProfileForm() {
    const data = AuthState.signupData;
    
    if (data.fullName) {
        document.getElementById('profile-name').value = data.fullName;
    }
    if (data.email) {
        document.getElementById('profile-email').value = data.email;
    }
    if (data.phone) {
        document.getElementById('profile-phone').value = data.phone;
    }
}

function handleProfileComplete(event) {
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
    
    // Simulate profile save
    setTimeout(() => {
        setButtonLoading(form.querySelector('.btn-submit'), false);
        
        // Save user data
        const userData = {
            fullName,
            email,
            phone,
            province,
            city,
            avatar: AuthState.signupData.avatar || null
        };
        
        AuthState.user = userData;
        localStorage.setItem('gogobus_user', JSON.stringify(userData));
        
        // Show success modal
        showSuccessModal();
    }, 1500);
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
// SOCIAL LOGIN
// ===================
function handleSocialLogin(provider) {
    showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`);
    // Will be implemented with Supabase OAuth
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
function logout() {
    AuthState.user = null;
    localStorage.removeItem('gogobus_user');
    localStorage.removeItem('gogobus_onboarding_complete');
    localStorage.removeItem('gogobus_last_screen');
    showToast('Logged out successfully');
    goToScreen('get-started');
}

// ===================
// CHECK AUTH ON LOAD
// ===================
function checkAuth() {
    const savedUser = localStorage.getItem('gogobus_user');
    if (savedUser) {
        try {
            AuthState.user = JSON.parse(savedUser);
        } catch (e) {
            localStorage.removeItem('gogobus_user');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Expose functions globally
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleOTPVerify = handleOTPVerify;
window.handleProfileComplete = handleProfileComplete;
window.handleSocialLogin = handleSocialLogin;
window.togglePassword = togglePassword;
window.inputOTPDigit = inputOTPDigit;
window.deleteOTPDigit = deleteOTPDigit;
window.resendOTP = resendOTP;
window.previewAvatar = previewAvatar;
window.showToast = showToast;
window.closeModal = closeModal;
window.logout = logout;
