/* =========================================================
   HELPHIVE ADMIN DASHBOARD — FRONTEND PROTOTYPE
   ---------------------------------------------------------
   IMPORTANT:
   - All records below are fictional sample data.
   - Actions update in-memory arrays only; nothing is saved.
   - This file does not connect to Supabase or authenticate admins.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeNavigation();
    initializeMobileMenu();
    renderUsers();
    renderListings();
    renderReports();
    initializeSearchAndFilters();
    initializeGlobalSearch();
    initializeRecentActivity();
    initializeNotifications();
    initializeAdminLogout();
    initializeMiniTrendCharts();
    initializeDemographicsChart();
    // Wait until the browser has completed its initial layout.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initializeListingsOverviewChart();
        });
    });
});

/* =========================================================
   SAMPLE DATA — REPLACE ONLY AFTER THE BACKEND PLAN IS READY
========================================================= */
const Users = [
    { id: 1, name: "Mia Santos", email: "mia.@example.com", role: "Student", joined: "Oct 02, 2026", status: "Active" },
    { id: 2, name: "Noah Reyes", email: "noah.@example.com", role: "Property owner", joined: "Sep 28, 2026", status: "Active" },
    { id: 3, name: "Ella Cruz", email: "ella.@example.com", role: "Student", joined: "Sep 24, 2026", status: "Active" },
    { id: 4, name: "Liam Garcia", email: "liam.@example.com", role: "Property owner", joined: "Sep 20, 2026", status: "Suspended" },
    { id: 5, name: "Ava Dela Rosa", email: "ava.@example.com", role: "Student", joined: "Sep 16, 2026", status: "Active" }
];

const Listings = [
    { id: 101, title: "Sunny Studio Near Campus", location: "Davao City", owner: "Noah Reyes", rent: 6500, status: "Pending" },
    { id: 102, title: "Shared Student Dorm", location: "Tagum City", owner: "Liam Garcia", rent: 3200, status: "Pending" },
    { id: 103, title: "Cozy Bedspace for Students", location: "Davao City", owner: "Noah Reyes", rent: 2800, status: "Approved" },
    { id: 104, title: "Bright One-Bedroom Apartment", location: "Panabo City", owner: "Liam Garcia", rent: 8500, status: "Rejected" }
];

const Reports = [
    { id: 201, item: "Sunny Studio Near Campus", reason: "Possible inaccurate details", reporter: "Mia Santos", status: "Open" },
    { id: 202, item: "Shared Student Dorm", reason: "Duplicate listing", reporter: "Ella Cruz", status: "Open" },
    { id: 203, item: "Noah Reyes", reason: "Suspicious message", reporter: "Ava Dela Rosa", status: "Open" },
    { id: 204, item: "Cozy Bedspace for Students", reason: "Outdated photos", reporter: "Mia Santos", status: "Resolved" },
    { id: 205, item: "Bright One-Bedroom Apartment", reason: "Missing information", reporter: "Ella Cruz", status: "Open" }
];

/* =========================================================
   THEME TOGGLE — SHARES THE EXISTING HELP HIVE PREFERENCE
========================================================= */
function initializeTheme() {
    const themeButton = document.getElementById("themeToggle");
    themeButton?.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("helpHiveDarkMode", theme);
    });
}

/* =========================================================
   SECTION NAVIGATION
========================================================= */
function initializeNavigation() {
    document.querySelectorAll("[data-section]").forEach((button) => {
        button.addEventListener("click", () => showSection(button.dataset.section));
    });

    document.querySelectorAll("[data-go]").forEach((button) => {
        button.addEventListener("click", () => showSection(button.dataset.go));
    });
}

function showSection(sectionName) {
    const validSections = ["overview", "users", "listings", "reports"];
    if (!validSections.includes(sectionName)) return;

    document.querySelectorAll(".page-section").forEach((section) => section.classList.add("hidden"));
    document.getElementById(`section-${sectionName}`)?.classList.remove("hidden");

    document.querySelectorAll(".nav-link").forEach((button) => {
        button.classList.toggle("nav-active", button.dataset.section === sectionName);
    });

    const titles = { overview: "Overview", users: "User management", listings: "Property listings", reports: "Reports & moderation" };
    document.getElementById("pageTitle").textContent = titles[sectionName];
}

/* =========================================================
   SIDEBAR TOGGLE
========================================================= */
function initializeMobileMenu() {
    const menuButton = document.getElementById("mobileMenuButton");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");

    if (!menuButton || !sidebar || !mainContent) return;
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    function setSidebarState(isOpen) {
        sidebar.classList.toggle("sidebar-open", isOpen);
        sidebar.classList.toggle("sidebar-closed", !isOpen);
        if (desktopQuery.matches) {
            mainContent.style.marginLeft = isOpen ? "16rem" : "0";
        } else {
            mainContent.style.marginLeft = "0";
        }
        menuButton.setAttribute("aria-expanded", String(isOpen));
    }

    // Set the correct initial state before interaction
    setSidebarState(desktopQuery.matches);
    // Toggle the sidebar when the hamburger is clicked
    menuButton.addEventListener("click", () => {
        const isOpen = desktopQuery.matches
            ? !sidebar.classList.contains("sidebar-closed")
            : sidebar.classList.contains("sidebar-open");

        setSidebarState(!isOpen);
    });
    // Recalculate the layout when switching between mobile and desktop
    desktopQuery.addEventListener("change", () => {
        setSidebarState(desktopQuery.matches);
    });
}

// ADMIN LOGOUT
function initializeAdminLogout() {
    const logoutButton = document.getElementById("adminLogoutButton");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", () => {
        const confirmed = window.confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmed) return;

        // Return to the admin login page.
        window.location.href = "../pages/login.html";
    });
}

/* =========================================================
   USERS TABLE + TEMPORARY STATUS ACTION
========================================================= */
function renderUsers(searchTerm = "") {
    const body = document.getElementById("usersTableBody");
    const query = searchTerm.trim().toLowerCase();
    const filteredUsers = Users.filter((user) =>
        [user.name, user.email, user.role, user.status].some((value) => value.toLowerCase().includes(query))
    );

    body.innerHTML = filteredUsers.length ? filteredUsers.map((user) => `
        <tr>
            <td><div class="font-bold">${escapeHTML(user.name)}</div><div class="mt-1 text-xs text-slate-500 dark:text-slate-400">${escapeHTML(user.email)}</div></td>
            <td>${escapeHTML(user.role)}</td>
            <td class="whitespace-nowrap">${escapeHTML(user.joined)}</td>
            <td>${statusBadge(user.status)}</td>
            <td><button class="table-action ${user.status === "Active" ? "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200"}" data-user-toggle="${user.id}">${user.status === "Active" ? "Suspend" : "Reactivate"}</button></td>
        </tr>`).join("") : emptyRow(5, "No users match that search.");

    body.querySelectorAll("[data-user-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            const user = Users.find((item) => item.id === Number(button.dataset.userToggle));
            if (!user) return;
            user.status = user.status === "Active" ? "Suspended" : "Active";
            renderUsers(document.getElementById("userSearch").value);
            showToast(`${user.name}: ${user.status}`);
        });
    });
}

/* =========================================================
   LISTINGS TABLE + APPROVE / REJECT ACTIONS
========================================================= */
function renderListings(searchTerm = "", statusFilter = "all") {
    const body = document.getElementById("listingsTableBody");
    const query = searchTerm.trim().toLowerCase();
    const filtered = Listings.filter((listing) => {
        const matchesSearch = [listing.title, listing.location, listing.owner].some((value) => value.toLowerCase().includes(query));
        return matchesSearch && (statusFilter === "all" || listing.status === statusFilter);
    });

    body.innerHTML = filtered.length ? filtered.map((listing) => `
        <tr>
            <td><div class="font-bold">${escapeHTML(listing.title)}</div><div class="mt-1 text-xs text-slate-500 dark:text-slate-400">${escapeHTML(listing.location)}</div></td>
            <td>${escapeHTML(listing.owner)}</td>
            <td class="whitespace-nowrap">₱${listing.rent.toLocaleString("en-PH")}/mo</td>
            <td>${statusBadge(listing.status)}</td>
            <td class="whitespace-nowrap">${listing.status === "Pending" ? `<button class="table-action bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200" data-listing-action="Approved" data-listing-id="${listing.id}">Approve</button><button class="table-action bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-200" data-listing-action="Rejected" data-listing-id="${listing.id}">Reject</button>` : `<button class="table-action bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200" data-listing-action="Pending" data-listing-id="${listing.id}">Reset</button>`}</td>
        </tr>`).join("") : emptyRow(5, "No listings match these filters.");

    body.querySelectorAll("[data-listing-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const listing = Listings.find((item) => item.id === Number(button.dataset.listingId));
            if (!listing) return;
            listing.status = button.dataset.listingAction;
            renderListings(document.getElementById("listingSearch").value, document.getElementById("listingFilter").value);
            updateOverviewCounts();
            showToast(`Listing marked ${listing.status.toLowerCase()}`);
        });
    });
}

/* =========================================================
   REPORTS TABLE + RESOLVE / REOPEN ACTION
========================================================= */
function renderReports(searchTerm = "") {
    const body = document.getElementById("reportsTableBody");
    const query = searchTerm.trim().toLowerCase();
    const filtered = Reports.filter((report) =>
        [report.item, report.reason, report.reporter, report.status].some((value) => value.toLowerCase().includes(query))
    );

    body.innerHTML = filtered.length ? filtered.map((report) => `
        <tr>
            <td class="font-bold">${escapeHTML(report.item)}</td>
            <td>${escapeHTML(report.reason)}</td>
            <td>${escapeHTML(report.reporter)}</td>
            <td>${statusBadge(report.status)}</td>
            <td><button class="table-action ${report.status === "Open" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"}" data-report-toggle="${report.id}">${report.status === "Open" ? "Resolve" : "Reopen"}</button></td>
        </tr>`).join("") : emptyRow(5, "No reports match that search.");

    body.querySelectorAll("[data-report-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            const report = Reports.find((item) => item.id === Number(button.dataset.reportToggle));
            if (!report) return;
            report.status = report.status === "Open" ? "Resolved" : "Open";
            renderReports(document.getElementById("reportSearch").value);
            updateOverviewCounts();
            showToast(`Report ${report.status.toLowerCase()}`);
        });
    });
}

/* =========================================================
   SEARCH INPUTS + LISTING STATUS FILTER
========================================================= */
function initializeSearchAndFilters() {
    document.getElementById("userSearch").addEventListener("input", (event) => renderUsers(event.target.value));
    document.getElementById("listingSearch").addEventListener("input", () => renderListings(document.getElementById("listingSearch").value, document.getElementById("listingFilter").value));
    document.getElementById("listingFilter").addEventListener("change", () => renderListings(document.getElementById("listingSearch").value, document.getElementById("listingFilter").value));
    document.getElementById("reportSearch").addEventListener("input", (event) => renderReports(event.target.value));
}

/* =========================================================
   SHARED UI HELPERS
========================================================= */
function statusBadge(status) {
    const styles = {
        Active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
        Approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
        Resolved: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        Pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
        Open: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
        Rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
        Suspended: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
    };
    return `<span class="status-pill ${styles[status] || "bg-slate-100 text-slate-700"}">${escapeHTML(status)}</span>`;
}

function emptyRow(columnCount, message) {
    return `<tr><td colspan="${columnCount}" class="py-10 text-center text-sm text-slate-500 dark:text-slate-400">${escapeHTML(message)}</td></tr>`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function updateOverviewCounts() {
    const pending = Listings.filter((listing) => listing.status === "Pending").length;
    const openReports = Reports.filter((report) => report.status === "Open").length;
    document.getElementById("pendingMetric").textContent = pending;
    document.getElementById("reportsMetric").textContent = openReports;
    document.getElementById("pendingQuickCount").textContent = `${pending} pending`;
    document.getElementById("reportsQuickCount").textContent = `${openReports} open`;
}

let toastTimeout;
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.add("hidden"), 2600);
}

/* =========================================================
   RECENT ACTIVITY
   Search, filter by type, and expand/collapse rows
========================================================= */
function initializeRecentActivity() {
    const searchInput = document.getElementById("activitySearch");
    const activityBody = document.getElementById("activityTableBody");
    const seeMoreButton = document.getElementById("seeMoreActivity");
    const emptyState = document.getElementById("activityEmptyState");
    const filterButtons = document.querySelectorAll("[data-activity-filter]");

    if (!searchInput || !activityBody || !seeMoreButton || !emptyState) {
        return;
    }

    const rows = Array.from(activityBody.querySelectorAll(".activity-row"));
    const initialLimit = 4;

    let activeFilter = "all";
    let showAll = false;

    function updateActivityRows() {
        const query = searchInput.value.trim().toLowerCase();

        // Find every row matching both the search and selected type.
        const matchingRows = rows.filter((row) => {
            const matchesSearch = row.textContent.toLowerCase().includes(query);
            const matchesType =
                activeFilter === "all" ||
                row.dataset.activityType === activeFilter;

            return matchesSearch && matchesType;
        });

        // Searching or filtering shows all matching results.
        const showAllMatches = query.length > 0 || activeFilter !== "all" || showAll;
        const visibleRows = showAllMatches
            ? matchingRows
            : matchingRows.slice(0, initialLimit);

        rows.forEach((row) => {
            row.classList.toggle("hidden", !visibleRows.includes(row));
        });

        // Show an empty state if nothing matches.
        emptyState.classList.toggle("hidden", matchingRows.length > 0);

        // The expand button is only needed when more rows are available.
        const canExpand =
            query.length === 0 &&
            activeFilter === "all" &&
            matchingRows.length > initialLimit;

        seeMoreButton.classList.toggle("hidden", !canExpand);
        seeMoreButton.setAttribute("aria-expanded", String(showAll));

        seeMoreButton.innerHTML = showAll
            ? 'Show Less <i class="fa-solid fa-chevron-up ml-1 text-xs"></i>'
            : 'See More Activities <i class="fa-solid fa-chevron-down ml-1 text-xs"></i>';
    }

    // Search across the activity and user columns.
    searchInput.addEventListener("input", updateActivityRows);
    // Select a type and visually highlight the active filter.
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.activityFilter;
            showAll = false;

            filterButtons.forEach((filterButton) => {
                const isActive = filterButton === button;

                filterButton.classList.toggle("filter-active", isActive);
                filterButton.setAttribute("aria-pressed", String(isActive));
            });

            updateActivityRows();
        });
    });
    // Expand or collapse the full activity list.
    seeMoreButton.addEventListener("click", () => {
        showAll = !showAll;
        updateActivityRows();
    });
    // Render the initial four activities.
    updateActivityRows();
}

// ========================================
// NOTIFICATION DROPDOWN
// ========================================
function initializeNotifications() {
    const notificationButton = document.getElementById("notificationButton");
    const notificationPanel = document.getElementById("notificationPanel");
    const closeNotificationButton = document.getElementById("closeNotificationPanel");
    const notificationItems = document.querySelectorAll(".notification-item");

    // Stop safely if the notification HTML is missing.
    if (!notificationButton || !notificationPanel) return;
    // Open or close the dropdown.
    function toggleNotifications() {
        const isOpen = !notificationPanel.classList.contains("hidden");

        notificationPanel.classList.toggle("hidden", isOpen);
        notificationButton.setAttribute("aria-expanded", String(!isOpen));
    }
    // Close the dropdown.
    function closeNotifications() {
        notificationPanel.classList.add("hidden");
        notificationButton.setAttribute("aria-expanded", "false");
    }
    // Bell click.
    notificationButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleNotifications();
    });

    // Clicking inside the panel should not trigger the outside-click handler.
    notificationPanel.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    // Close when clicking anywhere outside the dropdown.
    document.addEventListener("click", (event) => {
        if (
            !notificationPanel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {
            closeNotifications();
        }
    });

    // Close when selecting a notification.
    // The existing data-go navigation handler can handle the destination.
    notificationItems.forEach((item) => {
        item.addEventListener("click", () => {
            closeNotifications();
        });
    });
    // Optional close button, if one exists in the HTML.
    if (closeNotificationButton) {
        closeNotificationButton.addEventListener("click", closeNotifications);
    }
    // Close with Escape for keyboard accessibility.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNotifications();
        }
    });
}
// ========================================
// MINI TREND CHARTS
// ========================================
function initializeMiniTrendCharts() {
    // Make sure Chart.js has loaded before creating charts.
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }

    // Shared styling for all three mini charts.
    const miniChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                display: false,
                beginAtZero: false
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 2
            },
            point: {
                radius: 0,
                hoverRadius: 0
            }
        },
        interaction: {
            intersect: false
        }
    };

    // Helper to create a small line chart.
    function createMiniChart(canvasId, values, lineColor, fillColor) {
        const canvas = document.getElementById(canvasId);

        // Skip this chart if its canvas is missing.
        if (!canvas) {
            console.warn(`Mini chart canvas not found: ${canvasId}`);
            return;
        }
        // Prevent duplicate charts if this function is called again.
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        new Chart(canvas, {
            type: "line",
            data: {
                // These labels are placeholders; the axis is hidden.
                labels: ["1", "2", "3", "4", "5", "6", "7"],
                datasets: [{
                    data: values,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    fill: true,
                    borderCapStyle: "round",
                    borderJoinStyle: "round"
                }]
            },
            options: miniChartOptions
        });
    }

    // Total Users — illustrative upward trend.
    createMiniChart(
        "usersTrendChart",
        [120, 138, 132, 151, 160, 168, 174],
        "#10b981",
        "rgba(16, 185, 129, 0.12)"
    );
    // Total Listings — illustrative upward trend.
    createMiniChart(
        "listingsTrendChart",
        [42, 48, 46, 57, 61, 72, 86],
        "#10b981",
        "rgba(16, 185, 129, 0.12)"
    );
    // Monthly Traffic — illustrative traffic trend.
    createMiniChart(
        "trafficTrendChart",
        [3420, 3550, 3480, 3310, 3380, 3260, 3314],
        "#f59e0b",
        "rgba(245, 158, 11, 0.12)"
    );
}

// ========================================
// USER DEMOGRAPHICS DOUGHNUT CHART
// ========================================
function initializeDemographicsChart() {
    // Make sure Chart.js is available.
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    const canvas = document.getElementById("demographicsChart");
    // Stop if the canvas doesn't exist.
    if (!canvas) {
        console.warn("Demographics chart canvas not found.");
        return;
    }
    // Avoid creating duplicate charts.
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: ["Students", "Owners"],
            datasets: [{
                data: [74, 174],
                backgroundColor: [
                    "#10b981",  // Owners — same green as the mini-chart
                    "#FACC15" // Students — HelpHive yellow
                ],
                hoverBackgroundColor: [
                    "#059669",  // Owners — slightly deeper green
                    "#EAB308" // Students — slightly deeper yellow
                ],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce(
                                (sum, value) => sum + value,
                                0
                            );
                            const value = context.raw;
                            const percentage = Math.round(
                                (value / total) * 100
                            );
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
// ========================================
// LISTINGS OVERVIEW CHART
// ========================================
function initializeListingsOverviewChart() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }
    const canvas = document.getElementById("listingsOverviewChart");
    if (!canvas) {
        console.warn("Listings Overview canvas not found.");
        return;
    }
    // Avoid creating duplicate charts.
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    // Use the existing listing records.
    // Room types are inferred from titles for this demo only.
    function getRoomType(listing) {
        const title = listing.title.toLowerCase();
        if (title.includes("studio")) return "Studio";
        if (title.includes("dorm") || title.includes("shared")) return "Shared Room";
        if (title.includes("bedspace")) return "Bedspace";
        if (title.includes("apartment") || title.includes("one-bedroom")) {
            return "Apartment";
        }
        return "Other";
    }

    // Build chart categories and counts from the demo data.
    function countBy(getCategory) {
        const counts = {};
        Listings.forEach((listing) => {
            const category = getCategory(listing);
            counts[category] = (counts[category] || 0) + 1;
        });
        return {
            labels: Object.keys(counts),
            values: Object.values(counts)
        };
    }

    const chartData = {
        roomType: countBy(getRoomType),
        location: countBy((listing) => listing.location),
        status: countBy((listing) => listing.status)
    };
    const chartColors = {
        roomType: ["#FACC15", "#10b981", "#6366f1", "#f59e0b"],
        location: ["#FACC15", "#10b981", "#6366f1"],
        status: {
            Pending: "#FACC15",
            Approved: "#10b981",
            Rejected: "#f87171"
        }
    };
    const initialData = chartData.roomType;
    const listingsChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: initialData.labels,
            datasets: [{
                label: "Listings",
                data: initialData.values,
                backgroundColor: chartColors.roomType,
                borderRadius: 6,
                maxBarThickness: 48
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            // Animate the bars when the chart first appears.
            animation: {
                duration: 1000,
                easing: "easeOutQuart"
            },
            transitions: {
                active: {
                    animation: {
                        duration: 200
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => ` ${context.parsed.x} listing(s)`
                    }
                }
            },
            scales: {
                x: {
                    type: "linear",
                    min: 0,
                    max: 4,
                    beginAtZero: true,
                    grace: 0,
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                        color: "#64748b"
                    },
                    grid: {
                        drawTicks: true,
                        color: "rgba(148, 163, 184, 0.18)"
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    type: "category",
                    offset: true,
                    ticks: {
                        color: "#64748b",
                        autoSkip: false
                    },
                    grid: {
                        offset: true,
                        drawTicks: false,
                        color: "rgba(148, 163, 184, 0.12)"
                    },
                    border: {
                        display: false
                    }
                }
            }
        }
    });
    // Update the chart when a filter button is clicked.
    const filterButtons = document.querySelectorAll(".listing-chart-filter");
    function setActiveFilter(activeButton) {
        filterButtons.forEach((button) => {
            const isActive = button === activeButton;
            button.setAttribute("aria-pressed", String(isActive));
            // Keep the selected button dark and the others light.
            button.classList.toggle("bg-slate-900", isActive);
            button.classList.toggle("text-white", isActive);
            button.classList.toggle("bg-slate-100", !isActive);
            button.classList.toggle("text-slate-600", !isActive);
            button.classList.toggle("font-semibold", isActive);
            button.classList.toggle("font-medium", !isActive);

            button.classList.toggle("dark:bg-slate-100", isActive);
            button.classList.toggle("dark:text-slate-900", isActive);
            button.classList.toggle("dark:bg-slate-800", !isActive);
            button.classList.toggle("dark:text-slate-300", !isActive);
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedChart = button.dataset.chart;

            if (!chartData[selectedChart]) return;
            const selectedData = chartData[selectedChart];
            let colors;

            if (selectedChart === "status") {
                colors = selectedData.labels.map(
                    (status) => chartColors.status[status] || "#94a3b8"
                );
            } else {
                colors = chartColors[selectedChart];
            }
            listingsChart.data.labels = selectedData.labels;
            listingsChart.data.datasets[0].data = selectedData.values;
            listingsChart.data.datasets[0].backgroundColor = colors;

            // Keep the chart's accessibility description in sync.
            canvas.setAttribute(
                "aria-label",
                `Listings breakdown by ${selectedChart === "roomType"
                    ? "room type"
                    : selectedChart === "location"
                        ? "location"
                        : "approval status"
                }`
            );
            setActiveFilter(button);
            listingsChart.update();
        });
    });
}
// GLOBAL ADMIN SEARCH
function initializeGlobalSearch() {
    const searchInput = document.getElementById("adminGlobalSearch");
    const dropdown = document.getElementById("adminSearchDropdown");
    const resultsContainer = document.getElementById("adminSearchResults");
    let activeResultIndex = -1;

    if (!searchInput || !dropdown || !resultsContainer) return;
    function closeDropdown() {
        dropdown.classList.add("hidden");
        searchInput.setAttribute("aria-expanded", "false");
    }
    function openDropdown() {
        dropdown.classList.remove("hidden");
        searchInput.setAttribute("aria-expanded", "true");
    }

    function getSearchResults(query) {
        const matches = [];
        const searchTerm = query.toLowerCase();
        // Search users.
        Users.forEach((user) => {
            const searchableText = Object.values(user).join(" ").toLowerCase();
            if (searchableText.includes(searchTerm)) {
                matches.push({
                    type: "User",
                    section: "users",
                    title: user.name || user.fullName || "User",
                    description: Object.values(user)
                        .filter((value) => typeof value === "string")
                        .slice(1, 3)
                        .join(" · ")
                });
            }
        });
        // Search listings.
        Listings.forEach((listing) => {
            const searchableText = Object.values(listing).join(" ").toLowerCase();
            if (searchableText.includes(searchTerm)) {
                matches.push({
                    type: "Listing",
                    section: "listings",
                    title: listing.title || "Untitled listing",
                    description: [
                        listing.location,
                        listing.owner,
                        listing.status
                    ].filter(Boolean).join(" · ")
                });
            }
        });
        // Search reports.
        Reports.forEach((report) => {
            const searchableText = Object.values(report).join(" ").toLowerCase();
            if (searchableText.includes(searchTerm)) {
                matches.push({
                    type: "Report",
                    section: "reports",
                    title: report.title || report.reason || "Report",
                    description: [
                        report.status,
                        report.reporter,
                        report.reportedUser
                    ].filter(Boolean).join(" · ")
                });
            }
        });
        return matches;
    }

    function renderResults(query) {
        const trimmedQuery = query.trim();
        resultsContainer.innerHTML = "";
        activeResultIndex = -1;
        if (!trimmedQuery) {
            closeDropdown();
            return;
        }
        const matches = getSearchResults(trimmedQuery);
        if (matches.length === 0) {
            resultsContainer.innerHTML = `
            <div class="flex w-full items-center gap-3 rounded-lg px-3 py-3">
                <span class="min-w-0 flex-1">
                    <span class="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        No results found
                    </span>
                    <span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                        Try another name, listing, location, or report keyword.
                    </span>
                </span>
            </div>
        `;
            openDropdown();
            return;
        }
        resultsContainer.innerHTML = matches.map((result, index) => `
            <button
                type="button"
                class="global-search-result flex w-full items-center gap-3 rounded-lg
                       px-3 py-3 text-left transition
                       hover:bg-slate-100 focus:bg-slate-100 focus:outline-none
                       dark:hover:bg-slate-800 dark:focus:bg-slate-800"
                data-result-index="${index}"
                role="option"
            >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center
                             rounded-lg bg-slate-100 text-xs font-bold text-slate-700
                             dark:bg-slate-800 dark:text-slate-200">
                    ${escapeHTML(result.type.slice(0, 1))}
                </span>
                <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium text-slate-900
                                 dark:text-white">
                        ${escapeHTML(result.title)}
                    </span>
                    <span class="mt-1 block truncate text-xs text-slate-500
                                 dark:text-slate-400">
                        ${escapeHTML(result.description || result.type)}
                    </span>
                </span>
                <span class="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    ${escapeHTML(result.type)}
                </span>
            </button>
        `).join("");
        openDropdown();
        // Clicking a result takes the admin to the matching section.
        resultsContainer.querySelectorAll(".global-search-result").forEach((button) => {
            button.addEventListener("click", () => {
                const result = matches[Number(button.dataset.resultIndex)];
                if (!result) return;
                closeDropdown();
                // Reuse the existing section navigation and filters.
                showSection(result.section);
                if (result.section === "users") {
                    document.getElementById("userSearch").value = trimmedQuery;
                    renderUsers(trimmedQuery);
                } else if (result.section === "listings") {
                    document.getElementById("listingSearch").value = trimmedQuery;
                    document.getElementById("listingFilter").value = "all";
                    renderListings(trimmedQuery, "all");
                } else if (result.section === "reports") {
                    document.getElementById("reportSearch").value = trimmedQuery;
                    renderReports(trimmedQuery);
                }
            });
        });
    }
    // Highlights a result when using the keyboard.
    function highlightResult(index) {
        const resultButtons = resultsContainer.querySelectorAll(
            ".global-search-result"
        );
        if (resultButtons.length === 0) {
            activeResultIndex = -1;
            return;
        }
        // Keep the selected index within the available results.
        activeResultIndex = Math.max(
            0,
            Math.min(index, resultButtons.length - 1)
        );
        resultButtons.forEach((button, buttonIndex) => {
            const isActive = buttonIndex === activeResultIndex;

            button.classList.toggle("bg-slate-100", isActive);
            button.classList.toggle("dark:bg-slate-800", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });
        resultButtons[activeResultIndex].scrollIntoView({
            block: "nearest"
        });
    }

    // Update results while the admin types.
    searchInput.addEventListener("input", () => {
        renderResults(searchInput.value);
    });
    // Enter shows results but does not automatically select one.
    searchInput.addEventListener("keydown", (event) => {
        const resultButtons = resultsContainer.querySelectorAll(
            ".global-search-result"
        );

        if (event.key === "ArrowDown" && !dropdown.classList.contains("hidden")) {
            event.preventDefault();
            highlightResult(activeResultIndex + 1);
        }

        if (event.key === "ArrowUp" && !dropdown.classList.contains("hidden")) {
            event.preventDefault();
            highlightResult(
                activeResultIndex === -1
                    ? resultButtons.length - 1
                    : activeResultIndex - 1
            );
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (
                !dropdown.classList.contains("hidden") &&
                activeResultIndex >= 0 &&
                resultButtons[activeResultIndex]
            ) {
                resultButtons[activeResultIndex].click();
            } else {
                renderResults(searchInput.value);
            }
        }

        if (event.key === "Escape") {
            closeDropdown();
        }
    });
    // Close when clicking elsewhere on the page.
    document.addEventListener("click", (event) => {
        if (
            !searchInput.contains(event.target) &&
            !dropdown.contains(event.target)
        ) {
            closeDropdown();
        }
    });
}