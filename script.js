// Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
      const isExpanded =
        mobileMenuButton.getAttribute("aria-expanded") === "true";
      mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
    });
  }

  // Close mobile menu when clicking on a link
  const mobileLinks = document.querySelectorAll("#mobile-menu a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", function () {
      mobileMenu.classList.add("hidden");
      mobileMenuButton.setAttribute("aria-expanded", "false");
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // Initialize any sliders or carousels
  initializeFeaturedProjectsSlider();

  // Add animation classes when elements come into view
  setupIntersectionObserver();

  // Newsletter subscription is now handled by the footer component itself
});

function initializeFeaturedProjectsSlider() {
  // This would be replaced with actual slider initialization code
  // For example, using Swiper.js or another library
  console.log("Initialize project slider here");
}

function setupIntersectionObserver() {
  const animateElements = document.querySelectorAll(".fade-in, .slide-up");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  animateElements.forEach((el) => observer.observe(el));
}

// Form Validation Example
function validateContactForm(form) {
  let isValid = true;
  const name = form.querySelector("#name");
  const email = form.querySelector("#email");
  const message = form.querySelector("#message");

  if (!name.value.trim()) {
    isValid = false;
    name.classList.add("border-red-500");
  } else {
    name.classList.remove("border-red-500");
  }

  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    isValid = false;
    email.classList.add("border-red-500");
  } else {
    email.classList.remove("border-red-500");
  }

  if (!message.value.trim()) {
    isValid = false;
    message.classList.add("border-red-500");
  } else {
    message.classList.remove("border-red-500");
  }

  return isValid;
}

function waitForFirebase() {
  return new Promise((resolve) => {
    const checkFirebase = () => {
      if (window.db && window.firebase) {
        resolve();
      } else {
        setTimeout(checkFirebase, 100);
      }
    };
    checkFirebase();
  });
}
