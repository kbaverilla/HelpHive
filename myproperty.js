document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // HelpHive My Listings
    const STORAGE_KEY = "helpHiveMyListings";

    const grid = document.getElementById("hh-listing-grid");
    const emptyState = document.getElementById("hh-empty");
    const countElement = document.getElementById("hh-count");
    const searchInput = document.getElementById("hh-search");
    const filterSelect = document.getElementById("hh-filter");
    const modal = document.getElementById("hh-modal");
    const modalTitle = document.getElementById("hh-modal-title");
    const form = document.getElementById("hh-form");
    const viewContent = document.getElementById("hh-view-content");
    const editFields = document.getElementById("hh-edit-fields");
    const saveButton = document.getElementById("hh-save");
    
    // File inputs for images
    const imageInput = document.getElementById("hh-image");
    const imageInput2 = document.getElementById("hh-image-2");
    const imageInput3 = document.getElementById("hh-image-3");

    let currentId = null;
    let modalMode = "add";
    const slideIndexes = {};
    let activeUploadedImages = []; // Stores the data URLs for multi-image slideshow

    // Escape text before inserting user-entered data into HTML.
    function escapeHTML(value = "") {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function makeId() {
        return "HH-" + Date.now().toString(36).toUpperCase()
            + Math.random().toString(36).slice(2, 6).toUpperCase();
    }

    // Demo properties are added only the first time this script runs.
    function getInitialListings() {
        return [
            {
                id: "HH-BOR001",
                name: "Borongan Student Loft",
                location: "Near City Center, Borongan City",
                price: 3500,
                area: 22,
                room: "Bunk Bed",
                wifi: "Free WiFi",
                bath: "1 bathroom",
                owner: "Maria Santos",
                ownerImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                image: "dorm1.jpg",
                images: ["dorm1.jpg", "dorm2.jpg", "bh3.jpg"],
                status: "verified"
            },
            {
                id: "HH-BOR002",
                name: "Sunrise Boarding House",
                location: "Lalawigan, Borongan City",
                price: 4500,
                area: 18,
                room: "Private Room",
                wifi: "AC Available",
                bath: "5 bathrooms",
                owner: "Maria Santos",
                image: "bh2.jpg",
                images: ["bh2.jpg", "dorm2.jpg"],
                status: "verified"
            },
            {
                id: "HH-BOR003",
                name: "Hive Dormitory Hub",
                location: "Songco, Borongan City",
                price: 2800,
                area: 15,
                room: "Student Bed",
                wifi: "Utilities Included",
                bath: "1 bathroom",
                owner: "Maria Santos",
                image: "bh3.jpg",
                images: ["bh3.jpg", "dorm3.jpg", "dorm1.jpg"],
                status: "featured"
            }
        ];
    }

    function getListings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === null) {
                const initial = getInitialListings();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
                return initial;
            }

            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Could not load HelpHive listings:", error);
            return [];
        }
    }

    let listings = getListings();

    function saveListings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
            return true;
        } catch (error) {
            console.error("Could not save HelpHive listings:", error);
            alert("Unable to save your listing. Check your browser storage.");
            return false;
        }
    }

    function formatPrice(price) {
        return Number(price || 0).toLocaleString("en-PH", {
            maximumFractionDigits: 2
        });
    }

    function getImages(property) {
        let images = [];
        if (Array.isArray(property.images) && property.images.length > 0) {
            images = property.images.filter(Boolean);
        } else if (property.image) {
            images = [property.image];
        }
        return images.length > 0 ? images : ["bh2.jpg"];
    }

    // Handle file selections from all 3 inputs for multi-image slideshow
    function handleImageInputs() {
        const inputs = [imageInput, imageInput2, imageInput3].filter(Boolean);
        if (inputs.length === 0) return;

        let previewBox = document.getElementById("hh-dynamic-previews");
        if (!previewBox) {
            previewBox = document.createElement("div");
            previewBox.id = "hh-dynamic-previews";
            previewBox.className = "flex flex-wrap gap-2 mt-3";
            imageInput.parentNode.appendChild(previewBox);
        }
        previewBox.innerHTML = "";

        activeUploadedImages = [];

        inputs.forEach((input, index) => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    activeUploadedImages[index] = e.target.result;
                    
                    // Re-render previews box
                    previewBox.innerHTML = "";
                    activeUploadedImages.filter(Boolean).forEach(imgSrc => {
                        const thumbImg = document.createElement("img");
                        thumbImg.src = imgSrc;
                        thumbImg.className = "w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-xs";
                        previewBox.appendChild(thumbImg);
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    [imageInput, imageInput2, imageInput3].forEach(input => {
        input?.addEventListener("change", handleImageInputs);
    });

    function renderListings() {
        if (!grid) return;

        const searchTerm = (searchInput?.value || "").trim().toLowerCase();
        const selectedFilter = filterSelect?.value || "all";

        const filtered = listings.filter(property => {
            const searchableText = [
                property.id,
                property.name,
                property.location,
                property.room,
                property.owner,
                property.wifi
            ].join(" ").toLowerCase();

            const matchesSearch = searchableText.includes(searchTerm);
            const matchesFilter =
                selectedFilter === "all" ||
                property.status === selectedFilter;

            return matchesSearch && matchesFilter;
        });

        if (countElement) countElement.textContent = filtered.length;

        grid.innerHTML = filtered.map(property => {
            const images = getImages(property);
            const status = property.status === "featured" ? "Featured" : "Verified";
            const currentIdx = slideIndexes[property.id] || 0;

            const imageSlides = images.map((image, index) => `
                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(property.name)} photo ${index + 1}"
                    class="w-full h-full absolute inset-0 object-cover transition-opacity duration-500 ${index === currentIdx ? 'opacity-100 z-0' : 'opacity-0 z-0'}"
                    onerror="this.style.display='none'">
            `).join("");

            return `
                <article class="bg-white dark:bg-slate-800 rounded-3xl
                    border border-slate-200 dark:border-slate-700
                    overflow-hidden shadow-sm hover:shadow-xl
                    transition flex flex-col">

                    <div class="h-56 relative overflow-hidden bg-slate-900 group">
                        <div id="slides-${escapeHTML(property.id)}" class="relative w-full h-full">
                            ${imageSlides}
                        </div>

                        ${images.length > 1 ? `
                            <button type="button"
                                onclick="moveListingSlide('${escapeHTML(property.id)}', -1)"
                                aria-label="Previous image"
                                class="absolute left-3 top-1/2 -translate-y-1/2
                                w-9 h-9 rounded-full bg-black/60 text-white
                                hover:bg-black/85 cursor-pointer z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>

                            <button type="button"
                                onclick="moveListingSlide('${escapeHTML(property.id)}', 1)"
                                aria-label="Next image"
                                class="absolute right-3 top-1/2 -translate-y-1/2
                                w-9 h-9 rounded-full bg-black/60 text-white
                                hover:bg-black/85 cursor-pointer z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>

                            <!-- Dots Indicator -->
                            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                ${images.map((_, dotIdx) => `
                                    <span class="h-1.5 rounded-full transition-all ${dotIdx === currentIdx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}" data-dot-for="${escapeHTML(property.id)}-${dotIdx}"></span>
                                `).join('')}
                            </div>
                        ` : ""}

                        <span class="absolute top-3 left-3 rounded-full
                            bg-white/95 text-slate-800 px-3 py-1
                            text-xs font-bold shadow z-20">
                            ${status}
                        </span>
                    </div>

                    <div class="p-5 flex-1">
                        <p class="text-xs font-bold text-[#c99400] mb-1">
                            ${escapeHTML(property.id)}
                        </p>

                        <h3 class="text-lg font-bold text-slate-900
                            dark:text-white">
                            ${escapeHTML(property.name)}
                        </h3>

                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            <i class="fa-solid fa-location-dot text-[#d89a00] mr-1"></i>
                            ${escapeHTML(property.location)}
                        </p>

                        <p class="text-2xl font-extrabold text-[#d89a00] mt-4">
                            ₱${formatPrice(property.price)}
                            <span class="text-xs font-medium text-slate-400">/ month</span>
                        </p>

                        <div class="flex flex-wrap gap-2 mt-4 text-xs">
                            <span class="rounded-full bg-amber-50 dark:bg-slate-700 px-3 py-2">
                                <i class="fa-solid fa-bed text-[#d89a00] mr-1"></i>
                                ${escapeHTML(property.room)}
                            </span>

                            <span class="rounded-full bg-amber-50 dark:bg-slate-700 px-3 py-2">
                                <i class="fa-solid fa-wifi text-[#d89a00] mr-1"></i>
                                ${escapeHTML(property.wifi)}
                            </span>

                            <span class="rounded-full bg-amber-50 dark:bg-slate-700 px-3 py-2">
                                <i class="fa-solid fa-bath text-[#d89a00] mr-1"></i>
                                ${escapeHTML(property.bath || "1 bathroom")}
                            </span>

                            <span class="rounded-full bg-amber-50 dark:bg-slate-700 px-3 py-2">
                                <i class="fa-solid fa-ruler-combined text-[#d89a00] mr-1"></i>
                                ${escapeHTML(property.area)} sqm
                            </span>
                        </div>
                    </div>

                    <div class="px-5 pt-3 pb-5 flex gap-3 mt-2">
                        <button type="button"
                            onclick="viewProperty('${escapeHTML(property.id)}')"
                            class="flex-1 rounded-xl bg-amber-50 hover:bg-amber-100
                            text-amber-800 py-3 text-sm font-semibold cursor-pointer">
                            <i class="fa-solid fa-eye mr-1"></i> View
                        </button>

                        <button type="button"
                            onclick="editProperty('${escapeHTML(property.id)}')"
                            class="flex-1 rounded-xl bg-[#d89a00] hover:bg-[#bd8500]
                            text-white py-3 text-sm font-semibold cursor-pointer">
                            <i class="fa-solid fa-pen-to-square mr-1"></i> Edit
                        </button>
                    </div>

                    <div class="px-5 py-4 border-t border-slate-100
                        dark:border-slate-700 flex items-center justify-between
                        bg-slate-50 dark:bg-slate-700/40">
                        <div class="flex items-center gap-3">
                            <img
                                src="${escapeHTML(property.ownerImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80')}"
                                alt="${escapeHTML(property.owner)}"
                                class="w-8 h-8 rounded-full object-cover"
                                onerror="this.style.display='none'"
                            >
                            <div>
                                <h6 class="font-bold text-slate-900 dark:text-slate-100
                                    flex items-center gap-1 text-[11px]">
                                    ${escapeHTML(property.owner)}
                                    ${property.status === "verified"
                                        ? '<i class="fa-solid fa-circle-check text-blue-500 text-[10px]"></i>'
                                        : ''}
                                </h6>
                            </div>
                        </div>

                        <button type="button"
                            onclick="deleteProperty('${escapeHTML(property.id)}')"
                            class="text-sm text-rose-600 hover:text-rose-800 font-semibold cursor-pointer flex items-center gap-1">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </article>
            `;
        }).join("");

        if (emptyState) {
            emptyState.classList.toggle("hidden", filtered.length !== 0);
        }

        filtered.forEach(property => {
            if (slideIndexes[property.id] === undefined) {
                slideIndexes[property.id] = 0;
            }
        });
    }

    function openModal(mode, property = null) {
        if (!modal || !form) return;

        modalMode = mode;
        currentId = property?.id || null;
        form.reset();
        activeUploadedImages = [];
        const previewBox = document.getElementById("hh-dynamic-previews");
        if (previewBox) previewBox.innerHTML = "";

        modal.classList.remove("hidden");
        modal.classList.add("flex");

        const isAdd = mode === "add";

        editFields?.classList.remove("hidden");
        viewContent?.classList.add("hidden");
        saveButton?.classList.remove("hidden");

        if (modalTitle) {
            modalTitle.textContent = isAdd ? "Add New Listing" : "Edit Listing";
        }

        if (property) {
            document.getElementById("hh-name").value = property.name || "";
            document.getElementById("hh-location").value = property.location || "";
            document.getElementById("hh-price").value = property.price || "";
            document.getElementById("hh-area").value = property.area || "";
            document.getElementById("hh-room").value = property.room || "";
            document.getElementById("hh-wifi").value = property.wifi || "";
            document.getElementById("hh-bath").value = property.bath || "";
            document.getElementById("hh-owner").value = property.owner || "";
            document.getElementById("hh-status").value = property.status || "featured";

            if (property.images && property.images.length > 0) {
                activeUploadedImages = [...property.images];
                if (previewBox) {
                    property.images.forEach(imgSrc => {
                        const thumbImg = document.createElement("img");
                        thumbImg.src = imgSrc;
                        thumbImg.className = "w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-xs";
                        previewBox.appendChild(thumbImg);
                    });
                }
            }
        }
    }

    function closeModal() {
        modal?.classList.add("hidden");
        modal?.classList.remove("flex");
        form?.reset();
        currentId = null;
        activeUploadedImages = [];
        const previewBox = document.getElementById("hh-dynamic-previews");
        if (previewBox) previewBox.innerHTML = "";
    }

    window.hhOpenAdd = () => openModal("add");
    window.hhCloseModal = closeModal;

    window.viewProperty = id => {
        window.location.href = `roomdetails.html?id=${id}`;
    };

    window.editProperty = id => {
        const property = listings.find(item => item.id === id);
        if (property) openModal("edit", property);
    };

    window.deleteProperty = id => {
        const property = listings.find(item => item.id === id);
        if (!property) return;

        if (confirm(`Delete "${property.name}" from your listings?`)) {
            const oldListings = listings;
            listings = listings.filter(item => item.id !== id);

            if (saveListings()) {
                delete slideIndexes[id];
                renderListings();
            } else {
                listings = oldListings;
            }
        }
    };

    form?.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("hh-name").value.trim();
        const location = document.getElementById("hh-location").value.trim();
        const price = Number(document.getElementById("hh-price").value);
        const area = Number(document.getElementById("hh-area").value);
        const room = document.getElementById("hh-room").value.trim();
        const wifi = document.getElementById("hh-wifi").value.trim();
        const bath = document.getElementById("hh-bath").value.trim();
        const owner = document.getElementById("hh-owner").value.trim();
        const status = document.getElementById("hh-status").value;

        if (!name || !location || !room || !wifi || !bath || !owner ||
            !Number.isFinite(price) || price <= 0 ||
            !Number.isFinite(area) || area <= 0) {
            alert("Please complete all required fields with valid values.");
            return;
        }

        const existing = listings.find(item => item.id === currentId);

        let finalImages = activeUploadedImages.filter(Boolean);
        if (finalImages.length === 0) {
            finalImages = existing?.images && existing.images.length > 0 
                ? existing.images 
                : ["bh2.jpg"];
        }

        const property = {
            id: existing?.id || makeId(),
            name,
            location,
            price,
            area,
            room,
            wifi,
            bath,
            owner,
            image: finalImages[0],
            images: finalImages,
            status
        };

        const previousListings = [...listings];

        if (existing) {
            listings = listings.map(item =>
                item.id === existing.id ? property : item
            );
        } else {
            listings.unshift(property);
        }

        if (saveListings()) {
            renderListings();
            closeModal();
            alert(existing ? "Listing updated successfully!" : "Listing added successfully!");
        } else {
            listings = previousListings;
        }
    });

    // Search and filter
    searchInput?.addEventListener("input", renderListings);
    filterSelect?.addEventListener("change", renderListings);

    // Image slideshow controls with smooth crossfade & dot updates
    window.moveListingSlide = (id, direction) => {
        const property = listings.find(item => item.id === id);
        if (!property) return;

        const images = getImages(property);
        if (images.length < 2) return;

        const current = slideIndexes[id] || 0;
        const next = (current + direction + images.length) % images.length;
        slideIndexes[id] = next;

        const container = document.getElementById(`slides-${id}`);
        if (!container) return;

        const slideImgs = container.querySelectorAll("img");
        slideImgs.forEach((img, idx) => {
            if (idx === next) {
                img.classList.remove("opacity-0");
                img.classList.add("opacity-100");
            } else {
                img.classList.remove("opacity-100");
                img.classList.add("opacity-0");
            }
        });

        // Update dots
        images.forEach((_, dotIdx) => {
            const dot = document.querySelector(`[data-dot-for="${id}-${dotIdx}"]`);
            if (dot) {
                if (dotIdx === next) {
                    dot.className = "h-1.5 rounded-full transition-all bg-white w-4";
                } else {
                    dot.className = "h-1.5 rounded-full transition-all bg-white/50 w-1.5";
                }
            }
        });
    };

    // Dark mode
    window.toggleDarkMode = () => {
        const isDark = document.documentElement.classList.toggle("dark");
        document.documentElement.classList.toggle("light", !isDark);

        try {
            localStorage.setItem("helpHiveDarkMode", isDark ? "dark" : "light");
        } catch (error) {
            console.warn("Could not save theme preference.", error);
        }
    };

    // Dropdowns
    window.toggleNotifications = () => {
        document.getElementById("notificationDropdown")
            ?.classList.toggle("hidden");
    };

    window.toggleProfileDropdown = () => {
        document.getElementById("profileDropdown")
            ?.classList.toggle("hidden");
    };

    // Hero slideshow
    let heroIndex = 0;
    let heroTimer;

    window.showSlide = index => {
        const slides = document.querySelectorAll(".hero-slide");
        const dots = document.querySelectorAll(".slide-dot");
        if (!slides.length) return;

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.classList.toggle("opacity-100", i === heroIndex);
            slide.classList.toggle("opacity-0", i !== heroIndex);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("bg-white", i === heroIndex);
            dot.classList.toggle("bg-white/50", i !== heroIndex);
        });
    };

    function startHeroSlideshow() {
        clearInterval(heroTimer);
        heroTimer = setInterval(() => {
            window.showSlide(heroIndex + 1);
        }, 5000);
    }

    // Close modal when clicking the backdrop or pressing Escape.
    modal?.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });

    renderListings();
    window.showSlide(0);
    startHeroSlideshow();
});