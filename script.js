const searchButton = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');
const videoList = document.querySelector('.video-list');
const pageSwitcher = document.querySelector('.page-switcher');
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');
const pageNumber = document.querySelector('.page-number');
const googleSearch = document.querySelector('.google-search');
const googleSearchBtn = document.querySelector('.google-search-btn');

const url = "https://customsearch.googleapis.com/customsearch/v1"
const apiKey = "AIzaSyA2gkcC7NS2AHiC1p_crOF879p1nVwWW6o";
const cxId = "17a7cf0799f3149fd";

let currentPage = 1;
let totalPages = 0;
const resultsPerPage = 10;

const getData = async () => {

    const params = {
        key: apiKey,
        cx: cxId,
        q: searchInput.value,
        siteSearch: "youtube.com",
        orTerms: "video",
        start: ((currentPage - 1) * resultsPerPage + 1).toString(),
        num: resultsPerPage.toString()
    };

    const response = await fetch(url + "?" + new URLSearchParams(params));
    const data = await response.json();
    totalPages = data.searchInformation.totalResults;
    addItems(data.items);
}

const addItems = (data) => {
    videoList.innerHTML = '';

    data.sort((a, b) => {
        const item1 = a.pagemap?.videoobject?.[0].interactioncount;
        const item2 = b.pagemap?.videoobject?.[0].interactioncount;
        return item2 - item1
    })
    data.forEach((item) => {
        if (item.pagemap?.videoobject) {
            const div = document.createElement("div");
            div.classList.add("item");

            const imgUrl = item.pagemap?.cse_image?.[0]?.src;
            const title = item.title;
            const artist = item.pagemap?.person?.[0]?.name || "Unknown artist"
            const views = getViewsNumber(item.pagemap?.videoobject?.[0]?.interactioncount);
            const link = item.link;

            const customizeDuration = (duration) => {
                if (duration) {
                    const newDuration = duration.slice(2, -1).replace("M", ":");
                    if (newDuration.length === 3) {
                        const array = newDuration.split('')
                        array.splice(-1, 0, "0")
                        return array.join('')
                    }
                    return newDuration
                } else {
                    return "..."
                }

            }
            const duration = customizeDuration(item.pagemap?.videoobject?.[0]?.duration)


            div.innerHTML = `
            <div class="img-block">
                <img class="img" src="${imgUrl}" alt="${title}">
                <span class="duration">${duration}</span>
            </div>
            <div class="info">
                <h4 class='info-title'>${title}</h4>
                <p class='info-artist'>${artist}</p>
                <div class='info-footer'>
                  <img src="./icons/youtube-icon.svg" alt="youtube icon">
                  <span>Youtube.com</span>
                  <p class='info-views'>${views} views</p>
                </div> 
            </div>
        `;

            videoList.appendChild(div);

            div.addEventListener('click', e => {
                e.preventDefault()
                showPreview(imgUrl, title, artist, views, link);
            })

            pageSwitcher.style.display = "flex";
            pageNumber.textContent = currentPage > 1 ? currentPage.toString() : "";
            pageNumber.style.display = currentPage > 1 ? "block" : "none";

            prevBtn.style.display = currentPage > 1 ? "flex" : "none";
            nextBtn.style.display = currentPage < totalPages ? "flex" : "none";

            googleSearch.style.display = 'block';
            googleSearchBtn.innerHTML = `
            <img src="./icons/search-icon.svg" alt="search">
            Search <strong>${searchInput.value}</strong> on Google
        `
        }
    });
}

const getViewsNumber = (num) => {
    if (num === undefined) {
        return "unknown"
    }
    if (num.length > 9) {
        return num.slice(0, -9) + "b"
    }
    if (num.length > 6 &&  num.length <= 9) {
        return num.slice(0, -6) + "m"
    }
    if (num.length > 3 && num.length <= 6) {
        return num.slice(0, -3) + "k"
    }
    if (num.length <= 3 ) {
        return num
    }
}

const showPreview = (imgUrl, title, artist, views, link) => {

    const preview = document.createElement("div");
    preview.classList.add("preview");

    preview.innerHTML = `
     <div class="preview-main">
       <img src="${imgUrl}" alt="${title}">
       <h4 class='preview-title'>${title}</h4>
       <div class='preview-info'>
         <span><img src="./icons/youtube-icon.svg" alt="youtube icon">  Youtube.com</span>
         <img src="./icons/dot.svg" alt="dot">
         <span>${views}</span>
       </div>
     </div>
     <div class="preview-btns">
       <button class="visit-btn">Visit</button>
       <button class="close-btn">Close</button>
     </div>
   `;


    preview.querySelector('.visit-btn').addEventListener("click", () => {
        openVideo(link);
        closePreview();
    });
    preview.querySelector('.close-btn').addEventListener("click", () => {
        closePreview();
    });

    document.body.appendChild(preview);
}

const closePreview = () => {
    const preview = document.querySelector(".preview");
    if (preview) {
        preview.remove();
    }
}

const openVideo = (link) => {
    window.open(link, "_blank");
}


searchButton.addEventListener('click', (e) => {
    e.preventDefault()
    getData();
})

nextBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if (currentPage < totalPages) {
        currentPage++;
        getData();
    }
})

prevBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (currentPage > 1) {
        currentPage--;
        getData();
    }
});

googleSearchBtn.addEventListener("click", (e) => {
    e.preventDefault()
    const url = `https://www.google.com/search?q=${searchInput.value}`;
    window.open(url, "_blank")
});