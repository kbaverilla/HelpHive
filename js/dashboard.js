import { supabase } from './supabaseconfig.js';

/* ===== HERO SLIDESHOW ===== */

let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".slide-dot");

function showSlide(index) {
    if (slides.length === 0) return;

    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    slides.forEach((slide) => {
        slide.classList.remove("opacity-100");
        slide.classList.add("opacity-0");
    });

    dots.forEach((dot) => {
        dot.classList.remove("bg-white");
        dot.classList.add("bg-white/50");
    });

    slides[currentSlide].classList.remove("opacity-0");
    slides[currentSlide].classList.add("opacity-100");

    if (dots.length > 0) {
        dots[currentSlide].classList.remove("bg-white/50");
        dots[currentSlide].classList.add("bg-white");
    }
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

showSlide(0);

setInterval(() => {
    nextSlide();
}, 5000);

/* ===== PROPERTY SEARCH ===== */

function searchProperties() {
    const locationInput = document.getElementById("locationSearch");
    const roomTypeInput = document.getElementById("propertyType");
    const budgetInput = document.getElementById("budgetSearch");
    const properties = document.querySelectorAll(".property-card");

    const location = locationInput?.value.trim().toLowerCase() || "";
    const roomType = roomTypeInput?.value.trim().toLowerCase() || "";
    const budgetValue = budgetInput?.value.trim();
    const budget = budgetValue === "" ? null : Number(budgetValue);

    let visibleCount = 0;

    properties.forEach((property) => {
        const propertyLocation =
            (property.dataset.location || "").toLowerCase();

        const propertyType =
            (property.dataset.type || "").trim().toLowerCase();

        const propertyPrice =
            Number(property.dataset.price || 0);

        let showProperty = true;

        if (
            location !== "" &&
            !propertyLocation.includes(location)
        ) {
            showProperty = false;
        }

        if (
            roomType !== "" &&
            propertyType !== roomType
        ) {
            showProperty = false;
        }

        if (budget !== null && !Number.isNaN(budget)) {
            const lowerBudget = Math.floor(budget / 1000) * 1000;
            const upperBudget = lowerBudget + 900;

            if (
                propertyPrice < lowerBudget ||
                propertyPrice > upperBudget
            ) {
                showProperty = false;
            }
        }

        if (showProperty) {
            property.style.display = "";
            visibleCount++;
        } else {
            property.style.display = "none";
        }
    });

    updateResultsCount(
        visibleCount,
        location,
        roomType,
        budget
    );

    const noResults = document.getElementById("noResults");

    if (noResults) {
        noResults.style.display =
            visibleCount === 0 ? "block" : "none";
    }
}

/* ===== RESULTS COUNT ===== */
function formatLocation(location) {
    return location
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function updateResultsCount(visibleCount, location, roomType, budget) {
    const resultCount = document.getElementById("resultsCount");
    const activeFilters = document.getElementById("activeFilterText");
    const roomTypeInput = document.getElementById("propertyType");

    if (resultCount) {
        resultCount.textContent =
            `${visibleCount} ${visibleCount === 1 ? "property" : "properties"} found`;
    }

    if (activeFilters) {
        const filters = [];

        if (location) {
            const locationText =
                document.getElementById("locationSearch")?.value.trim() || location;

            filters.push(`Location: ${formatLocation(locationText)}`);
        }

        if (roomType) {
            const roomTypeText =
                roomTypeInput?.options[roomTypeInput.selectedIndex]?.text || roomType;

            filters.push(`Room: ${roomTypeText}`);
        }

        if (budget !== null && !Number.isNaN(budget)) {
            const lowerBudget =
                Math.floor(budget / 1000) * 1000;

            const upperBudget =
                lowerBudget + 900;

            filters.push(
                `Budget: ₱${lowerBudget.toLocaleString()} - ₱${upperBudget.toLocaleString()}`
            );
        }

        activeFilters.textContent =
            filters.length > 0
                ? filters.join(" • ")
                : "Showing all boarding houses";
    }
}

/* ===== RESET FILTERS ===== */

function resetFilters() {
    const locationInput = document.getElementById("locationSearch");
    const roomTypeInput = document.getElementById("propertyType");
    const budgetInput = document.getElementById("budgetSearch");

    if (locationInput) locationInput.value = "";
    if (roomTypeInput) roomTypeInput.value = "";
    if (budgetInput) budgetInput.value = "";

    searchProperties();
}

/* ===== ENTER KEY SEARCH ===== */

const searchInputs = [
    document.getElementById("locationSearch"),
    document.getElementById("budgetSearch")
];

searchInputs.forEach((input) => {
    if (input) {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                searchProperties();
            }
        });
    }
});

/* ===== FAVORITES ===== */

function getSavedFavorites() {
    return JSON.parse(
        localStorage.getItem("helphiveFavorites") || "[]"
    );
}

function saveFavorites(favorites) {
    localStorage.setItem(
        "helphiveFavorites",
        JSON.stringify(favorites)
    );
}

function toggleFavorite(button, propertyName) {
    let favorites = getSavedFavorites();
    const icon = button.querySelector("i");

    if (favorites.includes(propertyName)) {
        favorites = favorites.filter(name => name !== propertyName);
        button.classList.remove("text-red-500");
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
    } else {
        favorites.push(propertyName);
        button.classList.add("text-red-500");
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
    }

    saveFavorites(favorites);
}

function restoreFavorites() {
    const favorites = getSavedFavorites();

    document.querySelectorAll(".favorite-button").forEach((button) => {
        const propertyName = button.dataset.property;
        const icon = button.querySelector("i");

        if (favorites.includes(propertyName)) {
            button.classList.add("text-red-500");
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
        }
    });
}

function setActiveNav(activeButton) {
    const buttons = [
        document.getElementById("findHomeButton"),
        document.getElementById("savedFavoritesButton")
    ];

    buttons.forEach((button) => {
        if (!button) return;

        button.classList.remove(
            "text-[#c99400]",
            "font-semibold",
            "border-b-2",
            "border-[#d89a00]"
        );

        button.classList.add("text-slate-600");
    });

    if (activeButton) {
        activeButton.classList.remove("text-slate-600");
        activeButton.classList.add(
            "text-[#c99400]",
            "font-semibold",
            "border-b-2",
            "border-[#d89a00]"
        );
    }
}

function showAllProperties() {
    setActiveNav(document.getElementById("findHomeButton"));

    document.querySelectorAll(".property-card").forEach((property) => {
        property.style.display = "";
    });

    document.getElementById("noResults")?.classList.add("hidden");
    document.getElementById("noFavorites")?.classList.add("hidden");

    document.getElementById("properties")?.scrollIntoView({
        behavior: "smooth"
    });
}

function showSavedFavorites() {
    setActiveNav(document.getElementById("savedFavoritesButton"));

    const favorites = getSavedFavorites();
    const properties = document.querySelectorAll(".property-card");
    let visibleCount = 0;

    properties.forEach((property) => {
        const propertyName =
            property.querySelector(".favorite-button")?.dataset.property;

        if (favorites.includes(propertyName)) {
            property.style.display = "";
            visibleCount++;
        } else {
            property.style.display = "none";
        }
    });

    document.getElementById("noResults")?.classList.add("hidden");

    const noFavorites = document.getElementById("noFavorites");

    if (noFavorites) {
        noFavorites.classList.toggle("hidden", visibleCount !== 0);
    }

    document.getElementById("properties")?.scrollIntoView({
        behavior: "smooth"
    });
}

/* ===== VIEW PROPERTY ===== */

function viewProperty(propertyName) {
    alert(
        `You selected ${propertyName}. Property details can be added here later.`
    );
}

/* ===== MAKE FUNCTIONS AVAILABLE TO HTML ONCLICK ===== */

window.showSlide = showSlide;
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.searchProperties = searchProperties;
window.resetFilters = resetFilters;
window.toggleFavorite = toggleFavorite;
window.viewProperty = viewProperty;

document.getElementById("findHomeButton")?.addEventListener("click", (event) => {
    event.preventDefault();
    showAllProperties();
});

document.getElementById("savedFavoritesButton")?.addEventListener("click", (event) => {
    event.preventDefault();
    showSavedFavorites();
});

// Successfully Rented Properties carousel
const rentedTrack = document.getElementById("rentedPropertiesTrack");
const rentedPrevBtn = document.getElementById("rentedPrevBtn");
const rentedNextBtn = document.getElementById("rentedNextBtn");

if (rentedTrack && rentedPrevBtn && rentedNextBtn) {
    const scrollRentedProperties = (direction) => {
        const firstCard = rentedTrack.querySelector(":scope > div");

        if (!firstCard) return;

        const cardWidth = firstCard.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(rentedTrack).columnGap) || 0;

        rentedTrack.scrollBy({
            left: direction * (cardWidth + gap),
            behavior: "smooth"
        });
    };

    rentedPrevBtn.addEventListener("click", () => {
        scrollRentedProperties(-1);
    });

    rentedNextBtn.addEventListener("click", () => {
        scrollRentedProperties(1);
    });
}

/* ===== START ===== */

restoreFavorites();

console.log("🐝 HelpHive dashboard.js is working!");