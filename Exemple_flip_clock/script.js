// FOR DOWNLOADING THIS APPP
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function() {
//     navigator.serviceWorker.register('/service-worker.js').then(function(registration) {}, function(err) {});
// });
// }

// PREVIEW IN ADS CONTAINER
// const up_preview = document.getElementById('up_preview');
// const down_preview = document.getElementById('down_preview');

// up_preview.onclick = function () {
//     document.querySelector("#ampm").style.top = "0%";
// };
// down_preview.onclick = function () {
//     document.querySelector("#ampm").style.top = "75%";
// };

// MENU
const menuToggle = document.getElementById("menu_toggle");
const menuClose = document.getElementById("menu_close");
const controls = document.getElementById("controls");

// MENU
menuToggle.style.display = "block";
menuClose.style.display = "none";
controls.style.display = "none";

const themesContainer = document.getElementsByClassName("themes_container")[0];
const themes_toggle = document.getElementsByClassName("themes_toggle")[0];
const themes_close_toggle = document.getElementById("themes_close_toggle");

const subscriptionToggle1 = document.getElementsByClassName("subscription")[0];
const subscriptionToggle2 = document.getElementsByClassName("subscription")[1];

// LOFI
const lofi_button = document.getElementById("lofi_button");
const lofi_player = document.getElementById("lofi_player");
const lofi_container = document.getElementById("lofi_container");
const lofi_close_button = document.getElementById("lofi_close_button");
document.getElementById("lofi_name").textContent = LOFI.name;

const fullSc = document.querySelector(".full");

// CLOSE FLIP CLOCK ADS BAR
const targetDiv = document.getElementsByClassName("ad_container")[0];
const close_button_ads = document.getElementById("close_ads");

close_button_ads.onclick = function () {
    targetDiv.style.display = "none";
};

// PARTNER AD CONTAINER CLOSE BUTTON
const ad_container_partner = document.getElementsByClassName("ad_container_partner")[0];
const close_partner_ad = document.getElementById("close_partner_ad");

close_partner_ad.onclick = function () {
    ad_container_partner.style.display = "none";
};

// var leaderboard_trigger = document.getElementById("leaderboard_trigger");
// var close_leaderboard = document.getElementById("close_leaderboard");
// var leaderboard = document.getElementsByClassName("leaderboard")[0];

// leaderboard.style.display = "none";
// leaderboard_trigger.addEventListener('mouseover', function handleMouseOver() {
//     leaderboard.style.display = 'block';
// });

// close_leaderboard.onclick = function () {
//     leaderboard.style.display = "none";
// };

// URL CLOCK CONFIG SETTINGS
let url = new URL(window.location.href);
let url_clock_config = new URLSearchParams(url.search);

for (const [key, value] of url_clock_config) {
    console.log(key, value);
    switch (key) {
        case "size":
            const clock_container = document.querySelector(".container");
            clock_container.style.transform = "scale(" + value / 100 + ")";
            break;

        case "format":
            if (value === "24") {
                document.getElementById("toggleButton24h").checked = true;
            } else {
                document.getElementById("toggleButton24h").checked = false;
            }
            break;

        case "theme":
            if (value === "dark") {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("data-theme", "dark");
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("data-theme", "light");
            }
            break;
    }
}

// CUSTOM SIZE FOR CLOCK WHEN ZOOMING OUT
var clock_container = document.querySelector(".container");
window.addEventListener("resize", () => {
    const browserZoomLevel = Math.round(window.devicePixelRatio * 100 - 100);

    // scale the clock_container
    if (window.innerWidth > 1000) {
        // if (browserZoomLevel) {
        //     clock_container.style.transform = `scale(${browserZoomLevel / 100})`;
        // }
        if (browserZoomLevel / 100 <= 0) {
            clock_container.style.transform = "scale(0.8)";
        }
        // if (browserZoomLevel >= 100) {
        //     clock_container.style.transform = "scale(1)";
        // }
    } else {
        clock_container.style.transform = "scale(1)";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (url_clock_config.size <= 0) {
        let clockScale = localStorage.getItem("clock_scale");

        if (clockScale) {
            document.getElementById("size_range_slider").value = clockScale;
            clock_container.style.transform = "scale(" + clockScale / 100 + ")";
        }
    }
});

function clock_size() {
    var size_range_slider = document.getElementById("size_range_slider").value;

    clock_container.style.transform = "scale(" + size_range_slider / 100 + ")";

    localStorage.setItem("clock_scale", size_range_slider);
}

// POLL COOL INTERACTINON
// document.getElementById("sharing_polls").addEventListener('mouseover', function handleMouseOver() {
//     document.getElementById("sharing_polls").style.opacity = "0";
//     document.getElementById("sharing_polls").style.cursor = "pointer";
//     setTimeout(function () {
//         document.getElementById("sharing_polls").style.opacity = "1";
//         document.getElementById("sharing_polls").innerHTML = "Cool 👌";
//     }, 500);
//     setTimeout(function () {
//         document.getElementById("sharing_polls").style.transform = "scale(1.5)";
//         document.getElementById("sharing_polls").style.opacity = "0";
//     }, 1500);
// });

const feature_pop = document.getElementsByClassName("features_popup")[0];
const feature_close = document.getElementById("feature_toggle");
const feature_close1 = document.getElementById("feature_toggle1");

feature_close.onclick = function () {
    feature_pop.style.display = "none";
};

feature_close1.onclick = function () {
    feature_pop.style.display = "none";
};

document.getElementsByClassName("features_popup")[0].style.display = "none";

// SIMPLE ANALYTICS STATS
// const API_KEY = "sa_api_key_jAh46tZrHanCgaOwO64FMgfDUYDL6NQfAyGS"
// async function getCurrentLivePeople() {
//     await fetch("https://dashboard.simpleanalytics.com/flipclock.app.json?period=day&count=1&interval=hour", {
//         headers: {
//             'Content-Type': 'application/json',
//             'Api-Key': API_KEY,
//         }
//     })
//         .then(response => response.json())
//         .then(data => console.log(data))
//         .catch(err => console.log(err))
// }
// document.getElementById('yes_button').addEventListener('click', function (e) {
//     getCurrentLivePeople()
// })

// COUNTRAPI POLL
let website = "https://countrapi.vercel.app";
var current_poll = "flipclock_timer_feature";
const show_poll = false;

async function initializePoll() {
    const response = await fetch(`${website}/counts`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: current_poll,
            initialValue: 0,
            poll: { upvote: 0, downvote: 0 },
        }),
    });

    // Add error handling
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
}

if (show_poll) {
    document.getElementById("yes_button").addEventListener("click", async function (e) {
        const yes_response = await fetch(`${website}/counts/${current_poll}/upvote`, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: current_poll,
                initialValue: 0,
                poll: { upvote: 0, downvote: 0 },
            }),
        });
        const yes_data = await yes_response.json();
        document.getElementById("yes_button").innerText = `❤️  ${yes_data.poll.upvote}`;

        const get_no_value = await fetch(`${website}/counts/${current_poll}`, { method: "GET", headers: { "Content-Type": "application/json" } });
        const no_value = await get_no_value.json();
        document.getElementById("no_button").innerText = `👎  ${no_value.poll.downvote}`;

        setTimeout(function () {
            document.getElementById("yes_button").disabled = true;
            document.getElementById("yes_button").style.cursor = "not-allowed";

            document.getElementById("no_button").disabled = true;
            document.getElementById("no_button").style.cursor = "not-allowed";
        }, 1000);
    });
}
// if (show_poll) {

// document.getElementById('no_button').addEventListener('click', async function (e) {
//     const no_response = await fetch(`${website}/counts/${current_poll}/downvote`, {
//         method: 'POST',
//         mode: 'cors',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             name: current_poll, initialValue: 0,
//             poll: { upvote: 0, downvote: 0 }
//         })
//     });
//     const no_data = await no_response.json();
//     document.getElementById('no_button').innerText = `👎  ${no_value.poll.downvote}`;

//     const get_yes_value = await fetch(`${website}/counts/${current_poll}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
//     const yes_value = await get_yes_value.json();
//     document.getElementById('yes_button').innerText = `👍  ${yes_data.poll.upvote}`;

//     setTimeout(function () {
//         document.getElementById('no_button').disabled = true;
//         document.getElementById('no_button').style.cursor = 'not-allowed';

//         document.getElementById('yes_button').disabled = true;
//         document.getElementById('yes_button').style.cursor = 'not-allowed';
//     }, 0);
// })
// }

// AD LINK ANALYTICS COUNTER
// var current_ad = "best_internet_tools_prelaunch_ad";
// document.getElementById('ad_link_click_counter').addEventListener('click', function(e){
//     var ad_link_click_request = new XMLHttpRequest();
//     ad_link_click_request.open("GET", `https://api.countapi.xyz/hit/${website}/${current_ad}`);
//     ad_link_click_request.responseType = "json";
//     ad_link_click_request.send();
// })

// PARTNER AD LINK ANALYTICS COUNTER
// var current_partnership = "brainstorm_bureau";
// document.getElementById('partner_ad_link').addEventListener('click', function(e){
//     var ad_link_click_partner_request = new XMLHttpRequest();
//     ad_link_click_partner_request.open("GET", `https://api.countapi.xyz/hit/${website}/${current_partnership}`);
//     ad_link_click_partner_request.responseType = "json";
//     ad_link_click_partner_request.send();
// })

// DISPLAY NONE FLIP CLOCKS
document.getElementsByClassName("flip_container")[0].style.display = "none";
document.getElementsByClassName("flip_container")[1].style.display = "none";
document.getElementsByClassName("flip_container")[2].style.display = "block";

// DISPLAY DEFAULT CLOCKS
document.getElementById("hours").style.display = "block";
document.getElementById("minutes").style.display = "block";
document.getElementById("seconds").style.display = "none";

const toggleButton24h = document.getElementById("toggleButton24h");
const secondsOnIcon = document.getElementById("seconds_on");
const secondsOffIcon = document.getElementById("seconds_off");
const mainClockContainer = document.querySelector(".container");

let showSeconds = localStorage.getItem("show_seconds") === "true";
function applySecondsVisibility() {
    if (showSeconds) {
        mainClockContainer.classList.add("show-seconds");
        secondsOnIcon.style.display = "block";
        secondsOffIcon.style.display = "none";
    } else {
        mainClockContainer.classList.remove("show-seconds");
        secondsOnIcon.style.display = "none";
        secondsOffIcon.style.display = "block";
    }
}

secondsOnIcon.onclick = function () {
    showSeconds = false;
    localStorage.setItem("show_seconds", "false");
    applySecondsVisibility();
    showTime();
};

secondsOffIcon.onclick = function () {
    showSeconds = true;
    localStorage.setItem("show_seconds", "true");
    applySecondsVisibility();
    showTime();
};

applySecondsVisibility();

// GET COOKIES
const user_status = ("; " + document.cookie).split(`; status=`).pop().split(";")[0];
const date_subscribed = ("; " + document.cookie).split(`; date_subscribed=`).pop().split(";")[0];
const lifetime_status = localStorage.getItem("lifetime_status");

setInterval(showTime, 1000);
function showTime() {
    // console.log('chechking')

    let time = new Date();
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();

    let hour24 = time.getHours();
    let min24 = time.getMinutes();
    let sec24 = time.getSeconds();

    if (hour > 12) {
        hour -= 12;
    }
    if (hour == 0) {
        hour = 12;
    }

    // NO FLIP ANIMATION
    function defaultClock() {
        hour = hour < 10 ? "" + hour : hour;
        min = min < 10 ? "0" + min : min;
        sec = sec < 10 ? "0" + sec : sec;

        hour24 = hour24 < 10 ? "" + hour24 : hour24;
        min24 = min24 < 10 ? "0" + min24 : min24;
        sec24 = sec24 < 10 ? "0" + sec24 : sec24;

        if (toggleButton24h.checked) {
            document.getElementById("hours").innerHTML = hour24;
            document.getElementById("minutes").innerHTML = min24;
            document.getElementById("seconds").innerHTML = sec24;
        } else {
            document.getElementById("hours").innerHTML = hour;
            document.getElementById("minutes").innerHTML = min;
            document.getElementById("seconds").innerHTML = sec;
        }

        document.getElementById("minutes").style.display = "block";
        document.getElementById("hours").style.display = "block";
        document.getElementById("seconds").style.display = showSeconds ? "block" : "none";
    }

    // FLIP ANIMATION
    function flipClock() {
        let clockHourTens = document.getElementById("data-hour-tens");
        let clockMinuteTens = document.getElementById("data-minute-tens");
        let clockSecondTens = document.getElementById("data-second-tens");

        if (min < 10) {
            document.querySelector(".hidden_0").classList.remove("hide");
            document.getElementsByClassName("flip_container")[1].style.marginLeft = "16vw";
        } else {
            document.querySelector(".hidden_0").classList.add("hide");
            document.getElementsByClassName("flip_container")[1].style.marginLeft = "0";
        }
        if (min24 < 10) {
            document.querySelector(".hidden_0").classList.remove("hide");
            document.getElementsByClassName("flip_container")[1].style.marginLeft = "16vw";
        } else {
            document.querySelector(".hidden_0").classList.add("hide");
            document.getElementsByClassName("flip_container")[1].style.marginLeft = "0";
        }
        if (sec < 10) {
            document.querySelector(".hidden_seconds_0").classList.remove("hide");
            document.getElementsByClassName("flip_container")[2].style.marginLeft = "16vw";
        } else {
            document.querySelector(".hidden_seconds_0").classList.add("hide");
            document.getElementsByClassName("flip_container")[2].style.marginLeft = "0";
        }
        if (sec24 < 10) {
            document.querySelector(".hidden_seconds_0").classList.remove("hide");
            document.getElementsByClassName("flip_container")[2].style.marginLeft = "16vw";
        } else {
            document.querySelector(".hidden_seconds_0").classList.add("hide");
            document.getElementsByClassName("flip_container")[2].style.marginLeft = "0";
        }

        if (toggleButton24h.checked) {
            flip(clockHourTens, hour24);
            flip(clockMinuteTens, min24);
            if (showSeconds) {
                flip(clockSecondTens, sec24);
            }
        } else {
            flip(clockHourTens, hour);
            flip(clockMinuteTens, min);
            if (showSeconds) {
                flip(clockSecondTens, sec);
            }
        }

        document.getElementsByClassName("flip_container")[0].style.display = "block";
        document.getElementsByClassName("flip_container")[1].style.display = "block";
        document.getElementsByClassName("flip_container")[2].style.display = "block";

        document.getElementById("hours").style.display = "none";
        document.getElementById("minutes").style.display = "none";
        document.getElementById("seconds").style.display = "none";
    }

    if (user_status == "") {
        // defaultClock();

        // PRO PLAN FREE
        flipClock();
    } else if (user_status == "You have subscribed to FlipClock BASIC" || lifetime_status == "You have subscribed to FlipClock BASIC | Lifetime") {
        defaultClock();
    } else if (user_status == "You have subscribed to FlipClock PRO" || lifetime_status == "You have subscribed to FlipClock PRO | Lifetime") {
        flipClock();
    }
}
showTime();

// FLIP ANIMATIONS MAIN FUNCTION
function flip(flipCard, newNumber) {
    const topHalf = flipCard.querySelector(".top");
    const startNumber = parseInt(topHalf.textContent);
    if (newNumber === startNumber) return;

    const bottomHalf = flipCard.querySelector(".bottom");
    const topFlip = document.createElement("div");
    topFlip.classList.add("top-flip");
    const bottomFlip = document.createElement("div");
    bottomFlip.classList.add("bottom-flip");

    topHalf.textContent = startNumber;
    bottomHalf.textContent = startNumber;
    topFlip.textContent = startNumber;
    bottomFlip.textContent = newNumber;

    topFlip.addEventListener("animationstart", (e) => {
        topHalf.textContent = newNumber;
    });
    topFlip.addEventListener("animationend", (e) => {
        topFlip.remove();
    });
    bottomFlip.addEventListener("animationend", (e) => {
        bottomHalf.textContent = newNumber;
        bottomFlip.remove();
    });
    flipCard.append(topFlip, bottomFlip);
}

// MENU
// TIME ZONE
function defaultTimeZone() {
    let time = new Date();
    let hour = time.getHours();

    let am_pm;

    if (hour >= 12) {
        am_pm = "PM";
    } else {
        am_pm = "AM";
    }

    document.getElementById("ampm").innerHTML = am_pm;
}

function time_zone() {
    var time_zone_element = document.getElementById("ampm");
    var time_zone = new Date();
    time_zone_element.innerHTML = time_zone.toLocaleString("en-US", { hour: "numeric", hour12: true }).slice(2, 5);
}

// SHOW BASIC FEATURE
function showBasicFeatures() {
    // var visited = localStorage.getItem('visited');
    // if (visited) {
    //     document.getElementById("basic_feature").style.display = "none";
    //     localStorage.setItem('visited', true);
    // }
    // else {
    document.getElementsByClassName("features_popup")[0].style.display = "block";
    document.getElementById("basic_feature").style.display = "block";
    localStorage.setItem("visited", false);
    // }
}
// SHOW PRO FEATURE
function showProFeatures() {
    // var visited = localStorage.getItem('visited');
    // if (visited) {
    //     document.getElementById("pro_feature").style.display = "none";
    //     localStorage.setItem('visited', true);
    // }
    // else {
    document.getElementsByClassName("features_popup")[0].style.display = "block";
    document.getElementById("pro_feature").style.display = "block";
    localStorage.setItem("visited", false);
    // }
}

// console.clear();
if (user_status == "" && lifetime_status == null) {
    // // LIVE ----------------------------------------------------------------
    // console.warn("You have not subscribed to FlipClock Subscription");
    // // LIVE ----------------------------------------------------------------

    // document.querySelector('.themes_container').style.display = "none";
    // document.querySelector('#pro_subscription').style.display = "none";
    // document.querySelector('#pro_plus_subscription').style.display = "none";

    // // DEFAULT TIME ZONE
    // defaultTimeZone();

    console.log("FEATURES: \n • Themes \n • Time Zone \n • Flip Animation");

    // ALLOW THEMES / FLIP ANIMATION / TIME ZONES
    document.querySelector("#pro_plus_subscription").style.display = "none";
    document.querySelector("#upgrade").style.display = "none";

    // TIME ZONE
    setInterval(time_zone, 1000);
    time_zone();

    document.getElementById("basic_feature").style.display = "none";
    showProFeatures();
}

// IF USER PAID FOR PRO SUBSCRIPTION
else if (user_status == "You have subscribed to FlipClock BASIC" || lifetime_status == "You have subscribed to FlipClock BASIC | Lifetime") {
    if (lifetime_status == "You have subscribed to FlipClock BASIC | Lifetime") {
        console.log(lifetime_status);
    } else {
        console.log(date_subscribed.slice(0, 42));
        console.log(user_status);
    }

    console.log("FEATURES: \n • Themes");

    // ALLOW THEMES ONLY
    document.querySelector("#pro_subscription").style.display = "block";
    document.querySelector("#upgrade").style.display = "none";

    defaultTimeZone();
    document.getElementById("pro_feature").style.display = "none";
    showBasicFeatures();
}

// IF USER PAID FOR PRO PLUS SUBSCRIPTION
else if (user_status == "You have subscribed to FlipClock PRO" || lifetime_status == "You have subscribed to FlipClock PRO | Lifetime") {
    if (lifetime_status == "You have subscribed to FlipClock PRO | Lifetime") {
        console.log(lifetime_status);
    } else {
        console.log(date_subscribed.slice(0, 42));
        console.log(user_status);
    }

    console.log("FEATURES: \n • Themes \n • Time Zone \n • Flip Animation");

    // ALLOW THEMES / FLIP ANIMATION / TIME ZONES
    document.querySelector("#pro_plus_subscription").style.display = "block";
    document.querySelector("#upgrade").style.display = "none";

    // TIME ZONE
    setInterval(time_zone, 1000);
    time_zone();

    document.getElementById("basic_feature").style.display = "none";
    showProFeatures();
}

menuToggle.onclick = function () {
    menuToggle.style.display = "none";
    menuClose.style.display = "block";

    controls.classList.remove("close");
    controls.style.display = "flex";
};
menuClose.onclick = function () {
    menuToggle.style.display = "block";
    menuClose.style.display = "none";

    controls.classList.add("close");
};

// LOFI CONTAINER
lofi_close_button.onclick = function () {
    document.querySelector("#lofi_container").classList.add("hide");
    document.querySelector("#lofi_player").src = "";
};
lofi_button.onclick = function ToggleThing(event) {
    document.querySelector("#lofi_player").src = `https://www.youtube.com/embed/${LOFI.code}`;
    lofi_container.classList.remove("hide");
};

// THEMES TOGGLE
themes_toggle.addEventListener("click", () => {
    themesContainer.classList.remove("close");
    themesContainer.style.display = "grid";

    themes_toggle.style.display = "none";
    themes_close_toggle.style.display = "block";
});
themes_close_toggle.addEventListener("click", () => {
    themesContainer.classList.add("close");

    themes_toggle.style.display = "block";
    themes_close_toggle.style.display = "none";
});

// FULL SCREEN
fullSc.onclick = function DoFullscreen(event) {
    document.documentElement.requestFullscreen();

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
};

// LIVE ----------------------------------------------------------------

// DIFF MENU FOR MOBILE AND DESKTOP
// if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
//     menu.onclick = function ToggleThing(event) {
//         hiddenDiv.classList.toggle("hidden");
//     };
//     subscriptionToggle1.onclick = function ToggleThing(event) {
//         themesContainer.classList.toggle("hidden_theme");
//     };
//     subscriptionToggle2.onclick = function ToggleThing(event) {
//         themesContainer.classList.toggle("hidden_theme");
//     };
//     themes_toggle.onclick = function ToggleThing(event) {
//         themesContainer.classList.toggle("hidden_theme");
//     };

//     // LOFI BUTTON
//     // lofi_button.addEventListener('mouseover', function handleMouseOver() {
//     //     document.querySelector("#lofi_player").src = `https://www.youtube.com/embed/${lofi_video_link}`;
//     //     lofi_container.classList.remove("hide");
//     // });

//     lofi_button.onclick = function ToggleThing(event) {
//         document.querySelector("#lofi_player").src = `https://www.youtube.com/embed/${lofi_video_link}`;
//         lofi_container.classList.remove("hide");
//     };
// } else {
//     // LOFI BUTTON
//     // lofi_button.addEventListener('mouseover', function handleMouseOver() {
//     //     document.querySelector("#lofi_player").src = `https://www.youtube.com/embed/${lofi_video_link}`;
//     //     lofi_container.classList.remove("hide");
//     // });
//     lofi_button.onclick = function ToggleThing(event) {
//         document.querySelector("#lofi_player").src = `https://www.youtube.com/embed/${lofi_video_link}`;
//         lofi_container.classList.remove("hide");
//     };
//     themesContainer.addEventListener("mouseout", function handleMouseOut() {
//         themesContainer.style.display = "none !important";
//     });

//     themes_toggle.onclick = function ToggleThing(event) {
//         console.log("toggle");
//         themesContainer.style.display = "none";
//         themesContainer.classList.toggle("hidden_theme");
//     };

//     // if (window.innerHeight >= 700) {
//     //     menu.addEventListener('mouseover', function handleMouseOver() {
//     //         hiddenDiv.style.display = 'flex';
//     //     });
//     //     hiddenDiv.addEventListener('mouseover', function handleMouseOver() {
//     //         hiddenDiv.style.display = 'flex';
//     //     });
//     //     hiddenDiv.addEventListener('mouseout', function handleMouseOut() {
//     //         hiddenDiv.style.display = 'none';
//     //     })
//     // } else {
//     menu.onclick = function ToggleThing(event) {
//         hiddenDiv.classList.toggle("hidden_theme");
//     };

//     clock_container.addEventListener("click", function () {
//         hiddenDiv.classList.remove("hidden");
//     });
//     // }

//     subscriptionToggle1.addEventListener("mouseover", function handleMouseOver() {
//         themesContainer.style.display = "grid";
//     });
//     subscriptionToggle2.addEventListener("mouseover", function handleMouseOver() {
//         themesContainer.style.display = "grid";
//     });
//     // themes_toggle.addEventListener('mouseover', function handleMouseOver() {
//     //     themesContainer.style.display = 'grid';
//     // });
//     themesContainer.addEventListener("mouseover", function handleMouseOver() {
//         themesContainer.style.display = "grid";
//     });
// }

// MAKE LOFI CONTAINER DRAGGABLE
let isDragging = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let offsetX = 0;
let offsetY = 0;

lofi_container.addEventListener("mousedown", (e) => {
    isDragging = true;
    initialX = e.clientX;
    initialY = e.clientY;
    offsetX = currentX;
    offsetY = currentY;
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        currentX = offsetX + (e.clientX - initialX);
        currentY = offsetY + (e.clientY - initialY);
        lofi_container.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// remove localStorage THEME on reload
window.onbeforeunload = function () {
    localStorage.removeItem("current_theme");
};

// LIGHT MODE / DARK MODE / THEMES
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("data-theme", "dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("data-theme", "light");
    }

    // THEME 1
    if (document.documentElement.getAttribute("data-theme") == "dark" && localStorage.getItem("current_theme") == "theme1") {
        document.body.style.setProperty("--background", "#0F140F");
        document.body.style.setProperty("--holder", "#1A1F1A");
        document.body.style.setProperty("--text", "#C4EBC1");
    }
    if (document.documentElement.getAttribute("data-theme") == "light" && localStorage.getItem("current_theme") == "theme1") {
        document.body.style.setProperty("--background", "#E8FFE8");
        document.body.style.setProperty("--holder", "#D6F5D6");
        document.body.style.setProperty("--text", "#546654");
    }

    // THEME 2
    if (document.documentElement.getAttribute("data-theme") == "dark" && localStorage.getItem("current_theme") == "theme2") {
        document.body.style.setProperty("--background", "#131315");
        document.body.style.setProperty("--holder", "#1B1C20");
        document.body.style.setProperty("--text", "#C5C8F8");
    }
    if (document.documentElement.getAttribute("data-theme") == "light" && localStorage.getItem("current_theme") == "theme2") {
        document.body.style.setProperty("--background", "#EFF2FF");
        document.body.style.setProperty("--holder", "#E4E7FE");
        document.body.style.setProperty("--text", "#222843");
    }

    // THEME 3
    if (document.documentElement.getAttribute("data-theme") == "dark" && localStorage.getItem("current_theme") == "theme3") {
        document.body.style.setProperty("--background", "#1B1616");
        document.body.style.setProperty("--holder", "#271E1E");
        document.body.style.setProperty("--text", "#EF6666");
    }
    if (document.documentElement.getAttribute("data-theme") == "light" && localStorage.getItem("current_theme") == "theme3") {
        document.body.style.setProperty("--background", "#FFF4F4");
        document.body.style.setProperty("--holder", "#FFEDED");
        document.body.style.setProperty("--text", "#FF8F8F");
    }

    // THEME 4
    if (document.documentElement.getAttribute("data-theme") == "dark" && localStorage.getItem("current_theme") == "theme4") {
        document.body.style.setProperty("--background", "#16120B");
        document.body.style.setProperty("--holder", "#221E17");
        document.body.style.setProperty("--text", "#FFAC45");
    }
    if (document.documentElement.getAttribute("data-theme") == "light" && localStorage.getItem("current_theme") == "theme4") {
        document.body.style.setProperty("--background", "#FFF7EC");
        document.body.style.setProperty("--holder", "#FFEED6");
        document.body.style.setProperty("--text", "#FDC97B");
    }

    // THEME 5
    if (document.documentElement.getAttribute("data-theme") == "dark" && localStorage.getItem("current_theme") == "theme5") {
        document.body.style.setProperty("--background", "#131519");
        document.body.style.setProperty("--holder", "#1A1E23");
        document.body.style.setProperty("--text", "#CCE1FF");
    }
    if (document.documentElement.getAttribute("data-theme") == "light" && localStorage.getItem("current_theme") == "theme5") {
        document.body.style.setProperty("--background", "#F5F9FF");
        document.body.style.setProperty("--holder", "#E4EFFF");
        document.body.style.setProperty("--text", "#2C3440");
    }

    // THEME 6
    if (document.documentElement.getAttribute("data-theme") == "dark" && localStorage.getItem("current_theme") == "theme6") {
        document.body.style.setProperty("--background", "#0D0F11");
        document.body.style.setProperty("--holder", "#14161A");
        document.body.style.setProperty("--text", "#FFD458");
    }
    if (document.documentElement.getAttribute("data-theme") == "light" && localStorage.getItem("current_theme") == "theme6") {
        document.body.style.setProperty("--background", "#FFFDF4");
        document.body.style.setProperty("--holder", "#FFF8E1");
        document.body.style.setProperty("--text", "#FFDB57");
    }

    // THEME 7
    if (document.documentElement.getAttribute("data-theme") == "dark" && localStorage.getItem("current_theme") == "theme7") {
        document.body.style.setProperty("--background", "#1A171C");
        document.body.style.setProperty("--holder", "#221D23");
        document.body.style.setProperty("--text", "#E3CEEC");
    }
    if (document.documentElement.getAttribute("data-theme") == "light" && localStorage.getItem("current_theme") == "theme7") {
        document.body.style.setProperty("--background", "#FCF5FF");
        document.body.style.setProperty("--holder", "#F8E8FF");
        document.body.style.setProperty("--text", "#574260");
    }

    // THEME 8
    if (document.documentElement.getAttribute("data-theme") == "dark" && localStorage.getItem("current_theme") == "theme8") {
        document.body.style.setProperty("--background", "#181B19");
        document.body.style.setProperty("--holder", "#1E2320");
        document.body.style.setProperty("--text", "#BEEBD2");
    }
    if (document.documentElement.getAttribute("data-theme") == "light" && localStorage.getItem("current_theme") == "theme8") {
        document.body.style.setProperty("--background", "#F5FFFA");
        document.body.style.setProperty("--holder", "#E6F8EE");
        document.body.style.setProperty("--text", "#5F8873");
    }
}
toggleSwitch.addEventListener("change", switchTheme, false);

// SET THEME ON LOAD
document.addEventListener("DOMContentLoaded", function () {
    let localStorageTheme = localStorage.getItem("data-theme");

    document.documentElement.setAttribute("data-theme", localStorageTheme);
});

// Default theme
document.querySelector(".default_theme").addEventListener("click", function () {
    localStorage.removeItem("current_theme");
    document.body.style.removeProperty("--background");
    document.body.style.removeProperty("--holder");
    document.body.style.removeProperty("--text");
});

// THEME 1
document.querySelector(".theme1").addEventListener("click", function () {
    localStorage.setItem("current_theme", "theme1");
    document.body.style.setProperty("--background", "#0F140F");
    document.body.style.setProperty("--holder", "#1A1F1A");
    document.body.style.setProperty("--text", "#C4EBC1");
});

// THEME 2
document.querySelector(".theme2").addEventListener("click", function () {
    localStorage.setItem("current_theme", "theme2");
    document.body.style.setProperty("--background", "#131315");
    document.body.style.setProperty("--holder", "#1B1C20");
    document.body.style.setProperty("--text", "#C5C8F8");
});

// THEME 3
document.querySelector(".theme3").addEventListener("click", function () {
    localStorage.setItem("current_theme", "theme3");
    document.body.style.setProperty("--background", "#1B1616");
    document.body.style.setProperty("--holder", "#271E1E");
    document.body.style.setProperty("--text", "#EF6666");
});

// THEME 4
document.querySelector(".theme4").addEventListener("click", function () {
    localStorage.setItem("current_theme", "theme4");
    document.body.style.setProperty("--background", "#16120B");
    document.body.style.setProperty("--holder", "#221E17");
    document.body.style.setProperty("--text", "#FFAC45");
});

// THEME 5
document.querySelector(".theme5").addEventListener("click", function () {
    localStorage.setItem("current_theme", "theme5");
    document.body.style.setProperty("--background", "#131519");
    document.body.style.setProperty("--holder", "#1A1E23");
    document.body.style.setProperty("--text", "#CCE1FF");
});

// THEME 6
document.querySelector(".theme6").addEventListener("click", function () {
    localStorage.setItem("current_theme", "theme6");
    document.body.style.setProperty("--background", "#0D0F11");
    document.body.style.setProperty("--holder", "#14161A");
    document.body.style.setProperty("--text", "#FFD458");
});

// THEME 7
document.querySelector(".theme7").addEventListener("click", function () {
    localStorage.setItem("current_theme", "theme7");
    document.body.style.setProperty("--background", "#1A171C");
    document.body.style.setProperty("--holder", "#221D23");
    document.body.style.setProperty("--text", "#E3CEEC");
});

// THEME 8
document.querySelector(".theme8").addEventListener("click", function () {
    localStorage.setItem("current_theme", "theme8");
    document.body.style.setProperty("--background", "#181B19");
    document.body.style.setProperty("--holder", "#1E2320");
    document.body.style.setProperty("--text", "#BEEBD2");
});
