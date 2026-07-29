/**
 * js/email.js
 * ─────────────────────────────────────────────────────────────
 * EmailJS integration for the contact / inquiry form.
 * Note: EMAILJS_PUBLIC_KEY is declared in payment.js (loads first).
 * ─────────────────────────────────────────────────────────────
 */

// Contact-form specific service / template
const CONTACT_EMAILJS_SERVICE_ID  = 'service_izzdi9q';
const CONTACT_EMAILJS_TEMPLATE_ID = 'template_ifo088f';
const EMAILJS_PUBLIC_KEY          = '7FfjlSx153cbVbZyr';

// Initialize EmailJS for inquiry submissions
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Handle the contact/inquiry form submission.
 * Sends the form data via EmailJS and shows success/error feedback.
 * @param {Event} event - The form submit event.
 */
function handleInquiry(event) {
    event.preventDefault();

    const form         = document.getElementById('inquiryForm');
    const submitBtn    = document.getElementById('submitBtn');
    const submitText   = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const formMessages = document.getElementById('form-messages');

    if (!form || !submitBtn) return;

    // Reset previous messages and enter loading state
    formMessages.innerHTML = '';
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    if (submitSpinner) submitSpinner.classList.remove('hidden');

    emailjs.sendForm(CONTACT_EMAILJS_SERVICE_ID, CONTACT_EMAILJS_TEMPLATE_ID, form)
        .then(() => {
            formMessages.innerHTML = `
                <div class="form-message success">
                    <i class="fas fa-check-circle mr-3"></i>
                    Thank you! Your proposal has been sent successfully.
                </div>
            `;

            // Celebrate with confetti
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.5 },
                    colors: ['#D4AF37', '#ffffff', '#000B3D']
                });
            }

            form.reset();
        })
        .catch(error => {
            console.error('EmailJS error:', error);
            formMessages.innerHTML = `
                <div class="form-message error">
                    <i class="fas fa-exclamation-circle mr-3"></i>
                    Oops! Something went wrong. Please try again later.
                </div>
            `;
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitText.textContent = 'Send Proposal';
            if (submitSpinner) submitSpinner.classList.add('hidden');
        });
}
