const start = document.getElementById("start");
const loading = document.getElementById("loading");
const welcome = document.getElementById("welcome");
const main = document.getElementById("main");

const startTitle = document.getElementById("startTitle");
const formArea = document.getElementById("formArea");
const inputList = document.getElementById("inputList");
const confirmBtn = document.getElementById("confirmBtn");
const message = document.getElementById("message");
const loadingText = document.getElementById("loadingText");
const welcomeText = document.getElementById("welcomeText");
const mainWrap = document.getElementById("mainWrap");

const searchHeader = document.getElementById("searchHeader");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsArea = document.getElementById("resultsArea");
const detailView = document.getElementById("detailView");
const detailTitle = document.getElementById("detailTitle");
const detailBody = document.getElementById("detailBody");
const backBtn = document.getElementById("backBtn");
const logoBtn = document.getElementById("logoBtn");

let currentResults = [];
let lastQuery = "";

function showScreen(screen){
    [start, loading, welcome, main].forEach(s => {
        s.classList.remove("visible");
        s.classList.add("hidden");
    });

    screen.classList.remove("hidden");
    screen.classList.add("visible");
}

function createInput(){
    const input = document.createElement("input");
    input.type = "text";
    input.className = "name-input";
    input.placeholder = "이름 입력";
    input.addEventListener("input", checkInputs);
    inputList.appendChild(input);
}

function addInput(){
    createInput();
    checkInputs();
}

function removeInput(){
    const inputs = inputList.querySelectorAll("input");
    if(inputs.length <= 1) return;
    inputList.removeChild(inputList.lastElementChild);
    checkInputs();
}

function checkInputs(){
    const inputs = inputList.querySelectorAll("input");
    let allFilled = inputs.length > 0;
    let allEmpty = true;

    inputs.forEach(input => {
        const value = input.value.trim();
        if(value === ""){
            allFilled = false;
        }else{
            allEmpty = false;
        }
    });

    confirmBtn.disabled = !allFilled;
    message.textContent = allEmpty ? "이름을 입력해주세요." : "";
}

function confirmNames(){
    showScreen(loading);

    requestAnimationFrame(() => {
        loadingText.classList.add("show");
    });

    setTimeout(() => {
        loading.classList.add("hidden");
        loading.classList.remove("visible");

        setTimeout(() => {
            showScreen(welcome);

            requestAnimationFrame(() => {
                welcomeText.classList.add("show");
            });

            setTimeout(() => {
                welcomeText.classList.add("fade-out");
            }, 3000);

            setTimeout(() => {
                showScreen(main);

                requestAnimationFrame(() => {
                    mainWrap.classList.add("show");
                });
            }, 4200);
        }, 700);
    }, 1600);
}

function matchesQuery(article, query){
    const lowerQuery = query.toLowerCase();

    const keywordMatch = article.keyword.some(keyword =>
        keyword.toLowerCase().includes(lowerQuery)
    );

    const titleMatch = article.title.toLowerCase().includes(lowerQuery);
    const bodyMatch = article.body.toLowerCase().includes(lowerQuery);

    return keywordMatch || titleMatch || bodyMatch;
}

function renderResults(list){
    if(list.length === 0){
        resultsArea.innerHTML = '<div class="no-result">검색 결과가 없습니다.</div>';
        return;
    }

    resultsArea.innerHTML = list.map((item, index) => `
        <div class="result-card" data-index="${index}">
            <div class="result-title">${escapeHtml(item.title)}</div>
            <div class="result-preview">${escapeHtml(item.body)}</div>
        </div>
    `).join("");

    document.querySelectorAll(".result-card").forEach(card => {
        card.addEventListener("click", () => {
            const index = Number(card.dataset.index);
            openDetail(list[index]);
        });
    });
}

function performSearch(){
    const query = searchInput.value.trim();
    if(query === "") return;

    lastQuery = query;

    searchHeader.classList.add("searched");
    detailView.classList.remove("show");

    currentResults = articles.filter(article => matchesQuery(article, query));

    renderResults(currentResults);

    requestAnimationFrame(() => {
        resultsArea.classList.add("show");
    });
}

function openDetail(article){
    detailTitle.textContent = article.title;
    detailBody.textContent = article.body;
    resultsArea.classList.remove("show");

    setTimeout(() => {
        detailView.classList.add("show");
    }, 120);
}

function goBackToResults(){
    detailView.classList.remove("show");

    setTimeout(() => {
        searchInput.value = lastQuery;
        resultsArea.classList.add("show");
    }, 120);
}

function escapeHtml(text){
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function goToMainSearch(){
    detailView.classList.remove("show");
    resultsArea.classList.remove("show");
    searchHeader.classList.remove("searched");
    searchInput.value = "";
}

searchBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    performSearch();
});

searchInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        performSearch();
    }
});

backBtn.addEventListener("click", goBackToResults);

setTimeout(() => {
    startTitle.classList.add("moved");
    formArea.classList.add("show");
    addInput();
}, 900);

logoBtn.addEventListener("click", goToMainSearch);
