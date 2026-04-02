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

const requestBox = document.getElementById("requestBox");
const requestSummary = document.getElementById("requestSummary");
const requestCards = document.getElementById("requestCards");
const requestCardItems = document.querySelectorAll(".request-card");

const requestDetail = document.getElementById("requestDetail");
const requestDetailTitle = document.getElementById("requestDetailTitle");
const requestDetailBody = document.getElementById("requestDetailBody");
const requestBackBtn = document.getElementById("requestBackBtn");
const requestAcceptBtn = document.getElementById("requestAcceptBtn");

const selectedRequest = document.getElementById("selectedRequest");
const selectedRequestBtn = document.getElementById("selectedRequestBtn");

let currentRoute = null;

let pendingRoute = null;

const requestInfo = {
    "의뢰1": "의뢰1의 상세 설명입니다.\n여기에 길게 의뢰 내용을 적으면 됨.",
    "의뢰2": "의뢰2의 상세 설명입니다.\n여기에 길게 의뢰 내용을 적으면 됨.",
    "의뢰3": "의뢰3의 상세 설명입니다.\n여기에 길게 의뢰 내용을 적으면 됨.",
    "테스트": "나랑 같이 살던 사람이 학교에 갔다가 사라졌는데, 하루 기다려도 돌아오질 않으니 아마 죽은 것 같아.\n전에 살던 사람과 비슷했으면 좋겠으니 최대한 많은 정보를 모아서 똑같이 만들어 줘."
};

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
                sessionStorage.setItem("visitedBrowserMain", "true");
                
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
            <div class="result-preview">${escapeHtml(item.body.replaceAll("<br>", " "))}</div>
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
    if(!currentRoute) return;

    lastQuery = query;

    searchHeader.classList.add("searched");
    selectedRequest.classList.add("hidden");
    detailView.classList.remove("show");

    const currentArticles = getCurrentArticles();
currentResults = currentArticles.filter(article => matchesQuery(article, query));
    renderResults(currentResults);

    requestAnimationFrame(() => {
        resultsArea.classList.add("show");
    });
}

function openDetail(article){
    detailTitle.textContent = article.title;
    detailBody.innerHTML = article.body;
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
    requestDetail.classList.add("hidden");
    requestCards.classList.add("hidden");
    searchHeader.classList.remove("searched");
    searchInput.value = "";
    lastQuery = "";
    pendingRoute = null;

    if(currentRoute){
        applySelectedRoute(currentRoute);
    }
}

function getCurrentArticles(){
    if(currentRoute === "의뢰1") return route1Articles;
    if(currentRoute === "의뢰2") return route2Articles;
    if(currentRoute === "의뢰3") return route3Articles;
    if(currentRoute === "테스트") return routeTestArticles;
    return [];
}

function saveSelectedRoute(){
    if(currentRoute){
        sessionStorage.setItem("bokguSelectedRoute", currentRoute);
    }else{
        sessionStorage.removeItem("bokguSelectedRoute");
    }
}

function applySelectedRoute(route){
    currentRoute = route;

    if(route){
        selectedRequestBtn.textContent = route;
        selectedRequest.classList.remove("hidden");
    }else{
        selectedRequest.classList.add("hidden");
        selectedRequestBtn.textContent = "";
    }
}

function goDirectToMain(){
    showScreen(main);
    mainWrap.classList.add("show");
    searchHeader.classList.remove("searched");
    resultsArea.classList.remove("show");
    detailView.classList.remove("show");
    requestCards.classList.add("hidden");
    requestDetail.classList.add("hidden");
    searchInput.value = "";
    lastQuery = "";
    pendingRoute = null;
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

function openRequestCards(){
    requestDetail.classList.add("hidden");
    requestCards.classList.toggle("hidden");
}

function openRequestDetail(route){
    pendingRoute = route;
    requestCards.classList.add("hidden");
    requestDetailTitle.textContent = route;
    requestDetailBody.textContent = requestInfo[route] || "임시 의뢰 내용입니다.";
    requestDetail.classList.remove("hidden");
}

function acceptRequest(){
    if(!pendingRoute) return;
    applySelectedRoute(pendingRoute);
    saveSelectedRoute();
    requestDetail.classList.add("hidden");
    searchInput.focus();
}

backBtn.addEventListener("click", goBackToResults);

window.addEventListener("load", () => {
    const visited = sessionStorage.getItem("visitedBrowserMain");
    const savedRoute = sessionStorage.getItem("bokguSelectedRoute");

    if(visited === "true"){
        goDirectToMain();

        if(savedRoute){
            applySelectedRoute(savedRoute);
        }
        requestCards.classList.add("hidden");
        requestDetail.classList.add("hidden");

        return;
    }

    setTimeout(() => {
        startTitle.classList.add("moved");
        formArea.classList.add("show");
        addInput();
    }, 900);
});


requestSummary.addEventListener("click", openRequestCards);

requestCardItems.forEach(item => {
    item.addEventListener("click", () => {
        openRequestDetail(item.dataset.route);
    });
});

requestBackBtn.addEventListener("click", () => {
    requestDetail.classList.add("hidden");
    requestCards.classList.remove("hidden");
});

requestAcceptBtn.addEventListener("click", acceptRequest);

selectedRequestBtn.addEventListener("click", () => {
    requestCards.classList.remove("hidden");
    requestDetail.classList.add("hidden");
});

logoBtn.addEventListener("click", goToMainSearch);
