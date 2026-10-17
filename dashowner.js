```javascript
/* =========================================
   HELPHIVE DASHOWNER.JS
   Works with the supplied dashowner.html
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadDarkMode();
    initializeHeroSlider();
    initializeCardSliders();
    initializeRentedCarousel();
    initializeDropdowns();
});

/* =========================================
   DARK MODE
========================================= */

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");

    const isDark =
        document.documentElement.classList.contains("dark");

    localStorage.setItem(
        "helpHiveDarkMode",
        isDark ? "dark" : "light"
    );
}

function loadDarkMode() {
    const mode = localStorage.getItem("helpHiveDarkMode");

    document.documentElement.classList.toggle(
        "dark",
        mode === "dark"
    );
}

/* =========================================
   PROFILE DROPDOWN
========================================= */

function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");

    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

/* =========================================
   NOTIFICATIONS DROPDOWN
========================================= */

function toggleNotifications() {
    const dropdown = document.getElementById("notificationDropdown");

    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

/* Close dropdowns when clicking outside */
function initializeDropdowns() {
    document.addEventListener("click", function (event) {
        const profileDropdown =
            document.getElementById("profileDropdown");

        const notificationDropdown =
            document.getElementById("notificationDropdown");

        const profileButton =
            event.target.closest(
                '[onclick="toggleProfileDropdown()"]'
            );

        const notificationButton =
            event.target.closest(
                '[onclick="toggleNotifications()"]'
            );

        if (
            profileDropdown &&
            !profileDropdown.contains(event.target) &&
            !profileButton
        ) {
            profileDropdown.classList.add("hidden");
        }

        if (
            notificationDropdown &&
            !notificationDropdown.contains(event.target) &&
            !notificationButton
        ) {
            notificationDropdown.classList.add("hidden");
        }
    });
}

/* =========================================
   HERO SLIDESHOW
========================================= */

let currentSlide = 0;
let heroSlideTimer = null;

function initializeHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");

    if (!slides.length) return;

    showSlide(0);

    if (heroSlideTimer) {
        clearInterval(heroSlideTimer);
    }

    heroSlideTimer = setInterval(function () {
        nextSlide();
    }, 5000);
}

function showSlide(index) {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".slide-dot");

    if (!slides.length) return;

    currentSlide =
        ((index % slides.length) + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
        slide.style.opacity = i === currentSlide ? "1" : "0";
        slide.style.pointerEvents =
            i === currentSlide ? "auto" : "none";
    });

    dots.forEach(function (dot, i) {
        dot.style.backgroundColor =
            i === currentSlide
                ? "white"
                : "rgba(255, 255, 255, 0.5)";
    });
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

/* =========================================
   FEATURED PROPERTY PHOTO GALLERIES
========================================= */

const cardIndices = {
    1: 0,
    2: 0,
    3: 0
};

const totalCardSlides = 3;

function initializeCardSliders() {
    [1, 2, 3].forEach(function (cardId) {
        updateCardSlider(cardId);
    });
}

function moveCardSlide(cardId, direction) {
    const slider = document.querySelector(
        `.card-slider[data-card="${cardId}"] .card-slides`
    );

    if (!slider) return;

    if (typeof cardIndices[cardId] !== "number") {
        cardIndices[cardId] = 0;
    }

    const images = slider.querySelectorAll("img");
    const total = images.length || totalCardSlides;

    cardIndices[cardId] =
        (cardIndices[cardId] + direction + total) % total;

    updateCardSlider(cardId);
}

function updateCardSlider(cardId) {
    const container = document.querySelector(
        `.card-slider[data-card="${cardId}"]`
    );

    if (!container) return;

    const slider = container.querySelector(".card-slides");

    if (!slider) return;

    const images = slider.querySelectorAll("img");
    const total = images.length;

    if (!total) return;

    const index = cardIndices[cardId] || 0;

    slider.style.transform =
        `translateX(-${index * (100 / total)}%)`;

    const dots = container.querySelectorAll(
        `.card-dot-${cardId}`
    );

    dots.forEach(function (dot, i) {
        dot.style.opacity = i === index ? "1" : "0.5";
    });
}

/* =========================================
   SEARCH ROOMS
========================================= */

function searchRooms() {
    const locationInput =
        document.getElementById("dashboardLocation");

    const typeInput =
        document.getElementById("dashboardRoomType");

    const budgetInput =
        document.getElementById("dashboardBudget");

    const location = locationInput
        ? locationInput.value.trim()
        : "";

    const type = typeInput
        ? typeInput.value.trim()
        : "";

    let budget = budgetInput
        ? budgetInput.value.trim()
        : "";

    // Accept examples such as ₱2,500 or 2500/month.
    budget = budget
        .replace(/[₱,\s]/g, "")
        .replace(/\/.*$/, "");

    const params = new URLSearchParams();

    if (location) {
        params.set("location", location);
    }

    if (type) {
        params.set("type", type);
    }

    if (budget && Number.isFinite(Number(budget))) {
        params.set("budget", budget);
    }

    const query = params.toString();

    window.location.href =
        "findroom.html" + (query ? `?${query}` : "");
}

/* =========================================
   RENTED PROPERTIES CAROUSEL
   Fixes the nested grid in the supplied HTML.
========================================= */

function initializeRentedCarousel() {
    const track = document.getElementById(
        "rentedPropertiesTrack"
    );

    const previousButton = document.getElementById(
        "rentedPrevBtn"
    );

    const nextButton = document.getElementById(
        "rentedNextBtn"
    );

    if (!track) return;

    // The supplied HTML places the cards inside a grid.
    // Make the cards direct children of the scrolling track.
    const nestedGrid = track.querySelector(":scope > .grid");

    if (nestedGrid) {
        const cards = Array.from(nestedGrid.children);

        cards.forEach(function (card) {
            if (card.tagName !== "BUTTON") {
                track.insertBefore(card, nestedGrid);
            }
        });

        nestedGrid.remove();
    }

    // Move the Next button outside the scrolling track.
    if (nextButton && nextButton.parentElement === track) {
        track.parentElement.insertBefore(nextButton, track.nextSibling);
    }

    // Set the track and cards up for horizontal scrolling.
    track.style.display = "flex";
    track.style.flexWrap = "nowrap";
    track.style.overflowX = "auto";
    track.style.scrollBehavior = "smooth";
    track.style.scrollSnapType = "x mandatory";
    track.style.gap = "1.5rem";
    track.style.padding = "0.5rem 0.25rem 1rem";

    const cards = Array.from(track.children).filter(function (child) {
        return child.tagName !== "BUTTON";
    });

    cards.forEach(function (card) {
        card.style.flex = "0 0 calc(33.333% - 1rem)";
        card.style.minWidth = "260px";
        card.style.scrollSnapAlign = "start";
    });

    function getScrollAmount() {
        const firstCard = cards[0];

        if (!firstCard) {
            return track.clientWidth * 0.8;
        }

        return firstCard.getBoundingClientRect().width + 24;
    }

    if (previousButton) {
        previousButton.addEventListener("click", function () {
            track.scrollBy({
                left: -getScrollAmount(),
                behavior: "smooth"
            });
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            track.scrollBy({
                left: getScrollAmount(),
                behavior: "smooth"
            });
        });
    }

    // Adapt card widths to smaller screens.
    function updateCardWidths() {
        const width = window.innerWidth;

        let cardWidth;

        if (width < 640) {
            cardWidth = "88%";
        } else if (width < 1024) {
            cardWidth = "48%";
        } else {
            cardWidth = "calc(33.333% - 1rem)";
        }

        cards.forEach(function (card) {
            card.style.flex = `0 0 ${cardWidth}`;
        });
    }

    updateCardWidths();
    window.addEventListener("resize", updateCardWidths);
}

/* =========================================
   SHARE PROPERTY
========================================= */

async function shareRoom(name) {
    const data = {
        title: "HelpHive Room",
        text: `Check out ${name} on HelpHive!`,
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(data);
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(
                `${name} - HelpHive\n${window.location.href}`
            );

            alert("Room information copied!");
        } else {
            window.prompt(
                "Copy this property link:",
                window.location.href
            );
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Unable to share property:", error);
        }
    }
}

/* =========================================
   EMAIL PROPERTY
========================================= */

function emailRoom(name) {
    const subject = encodeURIComponent(
        `Inquiry about ${name}`
    );

    const body = encodeURIComponent(
        `Hi, I found ${name} on HelpHive and would like to know more about this room.`
    );

    window.location.href =
        `mailto:?subject=${subject}&body=${body}`;
}

/* =========================================
   SHARE ON FACEBOOK
========================================= */

function shareFacebook(name) {
    const url = encodeURIComponent(window.location.href);

    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank",
        "noopener,noreferrer"
    );
}

/* =========================================
   SHARE ON WHATSAPP
========================================= */

function shareWhatsApp(name) {
    const text = encodeURIComponent(
        `Check out ${name} on HelpHive!\n${window.location.href}`
    );

    window.open(
        `https://wa.me/?text=${text}`,
        "_blank",
        "noopener,noreferrer"
    );
}

/* =========================================
   FAQ ACCORDION
   Works if FAQ buttons are added later.
========================================= */

function toggleFaq(button) {
    if (!button) return;

    const content = button.nextElementSibling;

    if (!content) return;

    const icon = button.querySelector("i");
    const isHidden = content.classList.contains("hidden");

    content.classList.toggle("hidden", !isHidden);

    if (icon) {
        icon.style.transform =
            isHidden ? "rotate(180deg)" : "rotate(0deg)";
    }

    button.setAttribute(
        "aria-expanded",
        isHidden ? "true" : "false"
    );
}

/* =========================================
   SAFE MODAL CLOSER
   The supplied HTML has no welcomeModal,
   so do nothing when it is absent.
========================================= */

function closeModal() {
    const modal = document.getElementById("welcomeModal");

    if (modal) {
        modal.style.display = "none";
        modal.classList.add("hidden");
    }
}
```
