function requireLogin(feature) {

    const modal =
        document.getElementById('loginModal');

    const message =
        document.getElementById('modalMessage');


    message.textContent =
        `Please log in or create an account to access ${feature}.`;


    modal.classList.remove('hidden');

    modal.classList.add('flex');

}


function closeLoginModal() {

    const modal =
        document.getElementById('loginModal');


    modal.classList.add('hidden');

    modal.classList.remove('flex');

}


/* =========================================
   CLOSE WHEN CLICKING BACKDROP
========================================= */

document
    .getElementById('loginModal')
    .addEventListener(
        'click',
        function (event) {

            if (event.target === this) {

                closeLoginModal();

            }

        }
    );


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
    'keydown',
    function (event) {

        if (event.key === 'Escape') {

            closeLoginModal();

        }

    }
);


/* =========================================
   DARK MODE
========================================= */

function toggleDarkMode() {

    const html =
        document.documentElement;


    html.classList.toggle('dark');


    const isDark =
        html.classList.contains('dark');


    localStorage.setItem(
        'helpHiveDarkMode',
        isDark
            ? 'dark'
            : 'light'
    );


    updateDarkModeIcon();

}


function updateDarkModeIcon() {

    const icon =
        document.getElementById('darkModeIcon');


    if (
        document.documentElement.classList.contains('dark')
    ) {

        icon.className =
            'fa-solid fa-sun';

    } else {

        icon.className =
            'fa-solid fa-moon';

    }

}


function loadDarkMode() {

    const saved =
        localStorage.getItem('helpHiveDarkMode');


    if (saved === 'dark') {

        document.documentElement.classList.add('dark');

    }


    updateDarkModeIcon();

}


/* =========================================
   PAGE NAVIGATION
========================================= */

function goProtected(page) {

    window.location.href = page;

}


/* =========================================
   INITIAL LOAD
========================================= */

loadDarkMode();



const heroImage = document.querySelector(".hero-image");

const roomImages = [
    "images/dorm1.jpg",
    "images/dorm2.jpg",
    "images/dorm3.jpg",
    "images/bh1.jpg",
    "images/bh2.jpg",
    "images/bh3.jpg"

];

let roomIndex = 0;

function changeHeroImage() {

    if (!heroImage) return;

    // Very subtle fade
    heroImage.style.transition = "opacity 0.3s ease-in-out";
    heroImage.style.opacity = "0.45";

    setTimeout(() => {

        // Next image
        roomIndex++;

        if (roomIndex >= roomImages.length) {
            roomIndex = 0;
        }

        heroImage.src = roomImages[roomIndex];

        // Bring the new image in
        heroImage.style.opacity = "1";

    }, 300);
}

function changeRoomPhoto(button, direction) {
    const gallery = button.closest('.hh-gallery');
    const image = gallery.querySelector('.hh-gallery-image');
    const images = image.dataset.images.split(',');
    let index = Number(image.dataset.index || 0);

    index = (index + direction + images.length) % images.length;
    image.dataset.index = index;
    image.src = images[index].trim();

    gallery.querySelectorAll('.hh-gallery-dots button')
        .forEach((dot, i) => dot.classList.toggle('active', i === index));
}

document.querySelectorAll('.hh-gallery-dots').forEach(dots => {
    dots.querySelectorAll('button').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const gallery = dots.closest('.hh-gallery');
            const image = gallery.querySelector('.hh-gallery-image');
            const images = image.dataset.images.split(',');

            image.dataset.index = index;
            image.src = images[index].trim();

            dots.querySelectorAll('button')
                .forEach((item, i) => item.classList.toggle('active', i === index));
        });
    });
});

function copyListingId(id) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(id)
            .then(() => alert('Listing ID copied: ' + id))
            .catch(() => prompt('Copy listing ID:', id));
    } else {
        prompt('Copy listing ID:', id);
    }
}

function shareRoom(name) {
    if (navigator.share) {
        navigator.share({
            title: name,
            text: 'Check out ' + name + ' on HelpHive.'
        }).catch(() => { });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(name + ' - HelpHive')
            .then(() => alert('Listing name copied.'));
    } else {
        alert(name + ' - HelpHive');
    }
}


/*ROOM MESSAGE MODAL*/

function openRoomMessage(roomName, action) {
    const modal = document.getElementById("loginModal");
    const title = document.querySelector("#loginModal h2");
    const message = document.getElementById("modalMessage");

    if (!modal || !title || !message) {
        console.error("HelpHive message modal was not found.");
        return;
    }

    title.textContent = "Members Only";

    message.textContent =
        `Please log in or create an account to ${action.toLowerCase()} information about ${roomName}.`;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}


// =====================================
// HELP HIVE - RENTED PROPERTIES PORTAL
// =====================================

document.addEventListener("DOMContentLoaded", function () {
    const track = document.getElementById("rentedPropertiesTrack");
    const prevBtn = document.getElementById("rentedPrevBtn");
    const nextBtn = document.getElementById("rentedNextBtn");

    // Carousel navigation

    function scrollCarousel(direction) {
        if (!track) return;

        const card = track.querySelector(".grid > div");
        const distance = card
            ? card.getBoundingClientRect().width + 24
            : track.clientWidth;

        track.scrollBy({
            left: direction * distance,
            behavior: "smooth"
        });
    }

    prevBtn?.addEventListener("click", () => scrollCarousel(-1));
    nextBtn?.addEventListener("click", () => scrollCarousel(1));

    // Create message modal

    const overlay = document.createElement("div");
    overlay.className = "hh-modal-overlay";
    overlay.id = "hhMessageModal";

    overlay.innerHTML = `
        <div class="hh-modal" role="dialog"
             aria-modal="true" aria-labelledby="hhModalTitle">

            <div style="display:flex;justify-content:space-between;
                        align-items:flex-start;gap:12px;">

                <div>
                    <h3 id="hhModalTitle">Share Property</h3>
                    <p id="hhModalDescription"></p>
                </div>

                <button type="button" id="hhModalClose"
                    aria-label="Close"
                    style="border:0;background:none;color:inherit;
                           font-size:26px;cursor:pointer;">
                    &times;
                </button>
            </div>

            <label for="hhModalMessage"
                style="display:block;margin-top:20px;font-size:13px;
                       font-weight:700;">
                Message
            </label>

            <textarea id="hhModalMessage" rows="4"></textarea>

            <p id="hhModalFeedback" role="status"
               style="margin-top:10px;"></p>

            <div style="display:flex;justify-content:flex-end;
                        gap:10px;flex-wrap:wrap;margin-top:18px;">

                <button type="button" class="hh-modal-secondary"
                    id="hhModalCancel">
                    Cancel
                </button>

                <button type="button" class="hh-modal-primary"
                    id="hhModalSend">
                    Continue
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const title = overlay.querySelector("#hhModalTitle");
    const description = overlay.querySelector("#hhModalDescription");
    const message = overlay.querySelector("#hhModalMessage");
    const feedback = overlay.querySelector("#hhModalFeedback");
    const sendBtn = overlay.querySelector("#hhModalSend");

    let currentRoom = "";
    let currentAction = "";

    function openModal(room, action) {
        currentRoom = room;
        currentAction = action;

        const titles = {
            share: "Share Property",
            email: "Email Property",
            facebook: "Share on Facebook",
            whatsapp: "Share on WhatsApp"
        };

        title.textContent = titles[action];
        description.textContent =
            `Share "${room}" with friends through HelpHive.ph.`;

        message.value = `Check out ${room} on HelpHive.ph!`;
        feedback.textContent = "";

        sendBtn.textContent = {
            share: "Share",
            email: "Open Email",
            facebook: "Continue to Facebook",
            whatsapp: "Open WhatsApp"
        }[action];

        overlay.classList.add("is-visible");
        document.body.style.overflow = "hidden";
        message.focus();
    }

    function closeModal() {
        overlay.classList.remove("is-visible");
        document.body.style.overflow = "";
    }

    overlay.querySelector("#hhModalClose")
        .addEventListener("click", closeModal);

    overlay.querySelector("#hhModalCancel")
        .addEventListener("click", closeModal);

    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            overlay.classList.contains("is-visible")
        ) {
            closeModal();
        }
    });

    // Share, email, Facebook and WhatsApp actions

    sendBtn.addEventListener("click", async function () {
        const text = message.value.trim();

        if (!text) {
            feedback.textContent = "Please enter a message.";
            return;
        }

        const pageUrl = window.location.href;
        const fullMessage = `${text}\n${pageUrl}`;

        if (currentAction === "email") {
            const subject = encodeURIComponent(
                `HelpHive Property: ${currentRoom}`
            );

            const body = encodeURIComponent(fullMessage);

            window.location.href =
                `mailto:?subject=${subject}&body=${body}`;

            closeModal();
            return;
        }

        if (currentAction === "facebook") {
            const url =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodeURIComponent(pageUrl);

            window.open(url, "_blank", "noopener,noreferrer");
            closeModal();
            return;
        }

        if (currentAction === "whatsapp") {
            const url =
                "https://wa.me/?text=" +
                encodeURIComponent(fullMessage);

            window.open(url, "_blank", "noopener,noreferrer");
            closeModal();
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: currentRoom,
                    text: text,
                    url: pageUrl
                });

                closeModal();
            } catch (error) {
                if (error.name !== "AbortError") {
                    feedback.textContent =
                        "Unable to share. You can copy the message instead.";
                }
            }

            return;
        }

        try {
            await navigator.clipboard.writeText(fullMessage);
            feedback.textContent = "Message and link copied!";
        } catch (error) {
            message.value = fullMessage;
            message.select();
            feedback.textContent =
                "Please copy the selected message.";
        }
    });

    // Connect to existing HTML onclick buttons

    window.shareRoom = function (room) {
        openModal(room, "share");
    };

    window.emailRoom = function (room) {
        openModal(room, "email");
    };

    window.shareFacebook = function (room) {
        openModal(room, "facebook");
    };

    window.shareWhatsApp = function (room) {
        openModal(room, "whatsapp");
    };
});
// Change every 3.5 seconds
setInterval(changeHeroImage, 2500);
