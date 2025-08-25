import { API_URL } from "./env..js";

function saveArticles(articles) {
    localStorage.setItem("articles", JSON.stringify(articles));
}

function loadArticles() {
    return JSON.parse(localStorage.getItem("articles")) || [];
}

async function fetchFromAPI() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        console.log(data);

        if (data.articles) {
            return data.articles.map(a => ({
                author: a.author || "לא ידוע",
                title: a.title || "",
                description: a.description || "",
                content: a.content || "",
                urlToImage: a.urlToImage || "",
                url: a.url || ""
            }));
        }
    } catch (err) {
        console.error("בעיה בטעינת API:", err);
    }
    return [];
}

function navigate(page, data = null) {
    window.location.hash = page;
    renderPage(page, data);
}

function renderPage(page = "home", data = null) {
    const app = document.getElementById("app");
    app.innerHTML = "";

    const nav = document.createElement("nav");
    nav.innerHTML = `
      <span>חדשות מהעולם</span>
      <div>
      <button id="homeBtn">דף הבית</button>
      <button id="createBtn">צור כתבה</button>
      </div>
    `;
    app.appendChild(nav);

    document.getElementById("homeBtn").onclick = () => navigate("home");
    document.getElementById("createBtn").onclick = () => navigate("create");

    if (page === "home") renderHome(app);
    if (page === "create") renderCreate(app);
    if (page === "article") renderArticle(app, data);
}

function renderHome(app) {
    const articles = loadArticles();

    const grid = document.createElement("div");
    grid.className = "grid";

    articles.forEach(article => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <img src="${article.urlToImage}" alt="">
          <div class="content">
            <h3>${article.title}</h3>
            <p><b>${article.author}</b></p>
            <button class="btn readBtn">קרא כתבה מלאה</button>
          </div>
        `;

        // מעבר לכתבה המלאה
        card.querySelector(".readBtn").onclick = (e) => {
            e.stopPropagation();
            if (article.url) {
                window.open(article.url, "_blank");
            }
        };

        // מעבר למסך הפנימי שלנו
        card.onclick = () => navigate("article", article);

        grid.appendChild(card);
    });

    app.appendChild(grid);
}

function renderCreate(app) {
    const form = document.createElement("form");
    form.innerHTML = `
      <input type="text" placeholder="כותרת" id="title" required>
      <input type="text" placeholder="מחבר" id="author">
      <textarea placeholder="תיאור קצר" id="description"></textarea>
      <textarea placeholder="תוכן מלא" id="content"></textarea>
      <input type="file" id="image">
      <button type="submit">שמור</button>
    `;

    form.onsubmit = (e) => {
        e.preventDefault();

        const reader = new FileReader();
        const file = document.getElementById("image").files[0];

        reader.onload = () => {
            const newArticle = {
                title: document.getElementById("title").value,
                author: document.getElementById("author").value,
                description: document.getElementById("description").value,
                content: document.getElementById("content").value,
                urlToImage: reader.result || "",
                url: ""
            };

            let articles = loadArticles();
            articles.unshift(newArticle);
            saveArticles(articles);

            alert("הכתבה נוספה בהצלחה!");

            navigate("home");
        };

        if (file) {
            reader.readAsDataURL(file);
        } else {
            reader.onload();
        }
    };

    app.appendChild(form);
}

function renderArticle(app, article) {
    const div = document.createElement("div");
    div.className = "article";

    // חותכים את הסיומת המיותרת אם קיימת
    let cleanContent = article.content ? article.content.replace(/\[\+\d+ chars\]/, "") : "";

    div.innerHTML = `
      <h1>${article.title}</h1>
      <p><b>${article.author || "לא ידוע"}</b></p>
      <img src="${article.urlToImage}">
      <p>${article.description || ""}</p>
      <p>${cleanContent}</p>
      ${article.url ? `<a href="${article.url}" target="_blank" class="btn">לקריאת הכתבה המלאה</a>` : ""}
      <button id="backBtn" class="btn">חזור</button>
    `;
    app.appendChild(div);

    document.getElementById("backBtn").onclick = () => navigate("home");
}

window.addEventListener("load", async () => {
    let localArticles = loadArticles();

    if (localArticles.length === 0) {
        const apiArticles = await fetchFromAPI();
        saveArticles(apiArticles);
    }

    renderPage();
});
