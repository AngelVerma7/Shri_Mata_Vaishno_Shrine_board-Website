// Main JavaScript file for Mata Vaishno Devi website

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeGallery();
    initializeFormValidation();
    initializeScrollEffects();
    initializeDateRestrictions();
    
    // Set minimum date for booking to today
    const today = new Date().toISOString().split('T')[0];
    const visitDateInput = document.getElementById('visitDate');
    if (visitDateInput) {
        visitDateInput.setAttribute('min', today);
    }
});

// Navigation functionality
function initializeNavigation() {
    // Highlight active navigation link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Close mobile menu when clicking on a link
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
    }
}

// Gallery functionality
function initializeGallery() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const imageModal = document.getElementById('imageModal');
    
    // Filter functionality
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter gallery items
                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        item.classList.add('fade-in');
                        setTimeout(() => item.classList.add('active'), 100);
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('active');
                    }
                });
            });
        });
    }
    
    // Image modal functionality
    if (imageModal) {
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('imageModalTitle');
        
        document.querySelectorAll('[data-bs-target="#imageModal"]').forEach(button => {
            button.addEventListener('click', function() {
                const imageSrc = this.getAttribute('data-image');
                const title = this.getAttribute('data-title');
                
                if (modalImage && modalTitle) {
                    modalImage.src = imageSrc;
                    modalImage.alt = title;
                    modalTitle.textContent = title;
                }
            });
        });
    }
}

// Form validation functionality
function initializeFormValidation() {
    const yatraForm = document.getElementById('yatraBookingForm');
    
    if (yatraForm) {
        yatraForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Custom validation
            let isValid = true;
            
            // Validate phone number
            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                const phonePattern = /^[0-9]{10}$/;
                if (!phonePattern.test(phoneInput.value)) {
                    phoneInput.setCustomValidity('Please enter a valid 10-digit phone number');
                    isValid = false;
                } else {
                    phoneInput.setCustomValidity('');
                }
            }
            
            // Validate age
            const ageInput = document.getElementById('age');
            if (ageInput) {
                const age = parseInt(ageInput.value);
                if (age < 1 || age > 120) {
                    ageInput.setCustomValidity('Please enter a valid age between 1 and 120');
                    isValid = false;
                } else {
                    ageInput.setCustomValidity('');
                }
            }
            
            // Validate visit date (not in the past)
            const visitDateInput = document.getElementById('visitDate');
            if (visitDateInput) {
                const selectedDate = new Date(visitDateInput.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    visitDateInput.setCustomValidity('Visit date cannot be in the past');
                    isValid = false;
                } else {
                    visitDateInput.setCustomValidity('');
                }
            }
            
            // Check form validity
            if (yatraForm.checkValidity() && isValid) {
                // Show loading state
                const submitBtn = yatraForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="loading"></span> Processing...';
                submitBtn.disabled = true;
                
                // Submit form to API
                const formData = new FormData(yatraForm);
                const bookingData = Object.fromEntries(formData.entries());
                
                // Add checkbox values
                bookingData.wheelchairAccess = document.getElementById('wheelchair').checked;
                bookingData.medicalAssistance = document.getElementById('medicalAssistance').checked;
                bookingData.specialDiet = document.getElementById('specialDiet').checked;
                
                fetch('/api/yatra/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showBookingSuccess(data.referenceId);
                    } else {
                        showAlert(data.message || 'Booking failed. Please try again.', 'danger');
                    }
                })
                .catch(error => {
                    console.error('Booking error:', error);
                    showAlert('Network error. Please check your connection and try again.', 'danger');
                })
                .finally(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    yatraForm.reset();
                    yatraForm.classList.remove('was-validated');
                });
            } else {
                yatraForm.classList.add('was-validated');
            }
        });
        
        // Real-time validation for specific fields
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                const phonePattern = /^[0-9]{10}$/;
                if (phonePattern.test(this.value)) {
                    this.setCustomValidity('');
                } else {
                    this.setCustomValidity('Please enter a valid 10-digit phone number');
                }
            });
        }
    }
}

// Show booking success modal
function showBookingSuccess(refId) {
    const successModal = document.getElementById('successModal');
    const referenceId = document.getElementById('referenceId');
    
    if (successModal && referenceId) {
        referenceId.textContent = refId || 'VD' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
        
        const modal = new bootstrap.Modal(successModal);
        modal.show();
    }
}

// Scroll effects
function initializeScrollEffects() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(184, 134, 11, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.backgroundColor = '';
                navbar.style.backdropFilter = '';
            }
        });
    }
    
    // Fade in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    // Observe elements for fade-in animation
    document.querySelectorAll('.card, .gallery-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Date restrictions for booking
function initializeDateRestrictions() {
    const visitDateInput = document.getElementById('visitDate');
    
    if (visitDateInput) {
        // Set minimum date to today
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        visitDateInput.setAttribute('min', minDate);
        
        // Set maximum date to 6 months from today
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 6);
        visitDateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
        
        // Update duration options based on selected date
        visitDateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const dayOfWeek = selectedDate.getDay();
            const durationSelect = document.getElementById('duration');
            
            if (durationSelect) {
                // Disable longer durations on weekends (example logic)
                const options = durationSelect.querySelectorAll('option');
                options.forEach(option => {
                    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
                        if (parseInt(option.value) > 3) {
                            option.disabled = true;
                        } else {
                            option.disabled = false;
                        }
                    } else {
                        option.disabled = false;
                    }
                });
            }
        });
    }
}

// Utility functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Website Error:', e.error);
    // You could send this to a logging service in production
});

// Service Worker registration (for future PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment when service worker is implemented
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
});

// Print functionality
function printPage() {
    window.print();
}

// Social sharing (if needed in future)
function shareOnSocial(platform, url = window.location.href, text = 'Visit Mata Vaishno Devi') {
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// Export functions for global use
window.VaishnoDeviWebsite = {
    showAlert,
    printPage,
    shareOnSocial
};
