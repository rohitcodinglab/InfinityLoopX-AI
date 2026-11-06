
/* =====================================================
   INFINITYLOOPX AI CHATBOT V3
   Complete JavaScript
   HTML + CSS + JavaScript + Gemini AI
   Backend: Python FastAPI
===================================================== */


/* =====================================================
   PART 1: CONFIGURATION
===================================================== */

const API_URL = "http://127.0.0.1:8000";


/* =====================================================
   PART 2: HTML ELEMENTS
===================================================== */

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const menuBtn = document.getElementById("menuBtn");
const closeSidebar = document.getElementById("closeSidebar");

const newChatBtn = document.getElementById("newChatBtn");

const chatList = document.getElementById("chatList");

const messages = document.getElementById("messages");

const sendBtn = document.getElementById("sendBtn");

const userInput = document.getElementById("userInput");

const chatTitle = document.getElementById("chatTitle");


/* =====================================================
   PART 3: CHAT DATA
===================================================== */

let chats = [];

try {
    chats = JSON.parse(localStorage.getItem("aiChats")) || [];
    if (!Array.isArray(chats)) chats = [];
} catch (error) {
    console.error("Chat history loading error:", error);
    chats = [];
}

let currentChat = 0;
let dark = false;
let pendingRequests = 0;


/* =====================================================
   PART 4: SAVE CHAT HISTORY
===================================================== */

function saveChats() {

    try {

        localStorage.setItem(
            "aiChats",
            JSON.stringify(chats)
        );

    } catch (error) {

        console.error("Storage error:", error);

        toast("Unable to save chat history");

    }

}


/* =====================================================
   PART 5: TOAST NOTIFICATION
===================================================== */

function toast(message) {

    const t = document.createElement("div");

    t.className = "toast";

    t.textContent = message;

    document.body.appendChild(t);

    setTimeout(() => {

        t.remove();

    }, 2000);

}


/* =====================================================
   PART 6: SIDEBAR
===================================================== */

function openSidebar() {

    sidebar.classList.add("active");

    overlay.classList.add("active");

}


function closeMenu() {

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

}


if (menuBtn) {
    menuBtn.onclick = openSidebar;
}

if (closeSidebar) {
    closeSidebar.onclick = closeMenu;
}

if (overlay) {
    overlay.onclick = closeMenu;
}


/* =====================================================
   PART 7: CREATE NEW CHAT
===================================================== */

function createChat() {

    const chat = {

        id: Date.now().toString() + Math.random().toString(36).slice(2),

        title: "New Chat",

        messages: []

    };

    chats.unshift(chat);

    currentChat = 0;

    addWelcomeMessage();

    saveChats();

    renderChatList();

    renderMessages();

    if (userInput) {
        userInput.focus();
    }

}


/* =====================================================
   PART 8: NEW CHAT BUTTON
===================================================== */

if (newChatBtn) {

    newChatBtn.addEventListener("click", () => {

        createChat();

        closeMenu();

        toast("New Chat Created");

    });

}


/* =====================================================
   PART 9: SIDEBAR CHAT LIST
===================================================== */

function renderChatList() {

    chatList.innerHTML = "";

    chats.forEach((chat, index) => {

        const li = document.createElement("li");

        if (index === currentChat) {

            li.classList.add("active");

        }

        // Chat name

        const name = document.createElement("span");

        name.className = "chat-name";

        name.textContent = "💬 " + chat.title;

        // Actions container

        const actions = document.createElement("div");

        actions.className = "chat-actions";

        // Rename button

        const renameBtn = document.createElement("button");

        renameBtn.className = "rename-btn";

        renameBtn.textContent = "✏️";

        renameBtn.title = "Rename Chat";

        // Delete button

        const deleteBtn = document.createElement("button");

        deleteBtn.className = "delete-btn";

        deleteBtn.textContent = "🗑️";

        deleteBtn.title = "Delete Chat";

        actions.appendChild(renameBtn);

        actions.appendChild(deleteBtn);

        li.appendChild(name);

        li.appendChild(actions);


        // Open Chat

        name.onclick = () => {

            currentChat = index;

            renderChatList();

            renderMessages();

            closeMenu();

        };


        // Rename Chat

        renameBtn.onclick = (e) => {

            e.stopPropagation();

            const newName = prompt(
                "Rename Chat",
                chat.title
            );

            if (newName && newName.trim() !== "") {

                chat.title = newName.trim();

                saveChats();

                renderChatList();

                renderMessages();

                toast("Chat Renamed");

            }

        };


        // Delete Chat

        deleteBtn.onclick = (e) => {

            e.stopPropagation();

            if (confirm("Delete this chat?")) {

                chats.splice(index, 1);

                if (chats.length === 0) {

                    createChat();

                } else {

                    currentChat = Math.min(
                        currentChat,
                        chats.length - 1
                    );

                    saveChats();

                    renderChatList();

                    renderMessages();

                }

                toast("Chat Deleted");

            }

        };


        chatList.appendChild(li);

    });

}


/* =====================================================
   PART 10: SEARCH CHATS
===================================================== */

function searchChats(keyword) {

    keyword = keyword.toLowerCase();

    const items = document.querySelectorAll("#chatList li");

    items.forEach(item => {

        const name = item.querySelector(".chat-name");

        if (name && name.textContent.toLowerCase().includes(keyword)) {

            item.style.display = "flex";

        } else {

            item.style.display = "none";

        }

    });

}


/* =====================================================
   PART 11: MESSAGE TIME
===================================================== */

function getTime() {

    const now = new Date();

    return now.toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

}


/* =====================================================
   PART 12: WELCOME MESSAGE
===================================================== */

function addWelcomeMessage() {

    if (!chats[currentChat]) return;

    if (chats[currentChat].messages.length === 0) {

        chats[currentChat].messages.push({

            sender: "bot",

            text: "👋 Hello! I'm your AI ChatBot InfinityLoopX.\n\nAsk me anything about what you want.",

            time: getTime()

        });

        saveChats();

    }

}


/* =====================================================
   PART 13: TYPING ANIMATION
===================================================== */

function showTyping() {

    const typing = document.createElement("div");

    typing.className = "message bot";

    typing.classList.add("typing-indicator");

    const avatar = document.createElement("div");

    avatar.className = "avatar-box";

    avatar.textContent = "AI";

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    const animation = document.createElement("div");

    animation.className = "typing";

    for (let i = 0; i < 3; i++) {

        const dot = document.createElement("span");

        animation.appendChild(dot);

    }

    bubble.appendChild(animation);

    typing.appendChild(avatar);

    typing.appendChild(bubble);

    messages.appendChild(typing);

    messages.scrollTop = messages.scrollHeight;

    return typing;

}


/* =====================================================
   PART 14: REMOVE TYPING ANIMATION
===================================================== */

function removeTyping(element) {

    if (element && element.parentNode) {

        element.remove();

    }

}


/* =====================================================
   PART 15: CREATE MESSAGE
===================================================== */

function createMessage(sender, text, time) {

    const div = document.createElement("div");

    div.className = `message ${sender}`;

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    // Markdown rendering with safe HTML
const content = document.createElement("div");

content.className = "message-text";

if (sender === "bot") {
    const rawHTML = marked.parse(text || "");
    content.innerHTML = DOMPurify.sanitize(rawHTML);
} else {
    content.textContent = text;
}

bubble.appendChild(content);


    // Message time

    const timeElement = document.createElement("div");

    timeElement.className = "time";

    timeElement.textContent = time;

    bubble.appendChild(timeElement);


    if (sender === "user") {

        const avatar = document.createElement("div");

        avatar.className = "avatar-box";

        avatar.textContent = "You";

        div.appendChild(bubble);

        div.appendChild(avatar);

    } else {

        const avatar = document.createElement("div");

        avatar.className = "avatar-box";

        avatar.textContent = "AI";

        div.appendChild(avatar);

        div.appendChild(bubble);


        // Message action buttons

        const actions = document.createElement("div");

        actions.className = "actions";

        const copy = document.createElement("button");

        copy.className = "copy-btn";

        copy.textContent = "📋";

        copy.title = "Copy response";


        const like = document.createElement("button");

        like.className = "like-btn";

        like.textContent = "👍";

        like.title = "Like";


        const dislike = document.createElement("button");

        dislike.className = "dislike-btn";

        dislike.textContent = "👎";

        dislike.title = "Dislike";


        actions.appendChild(copy);

        actions.appendChild(like);

        actions.appendChild(dislike);

        bubble.appendChild(actions);


        copy.onclick = () => {

            copyMessage(text);

        };


        like.onclick = likeMessage;

        dislike.onclick = dislikeMessage;

    }


    messages.appendChild(div);

}


/* =====================================================
   PART 16: RENDER ALL MESSAGES
===================================================== */

function renderMessages() {

    messages.innerHTML = "";

    if (!chats[currentChat]) return;

    chatTitle.textContent = chats[currentChat].title;

    chats[currentChat].messages.forEach(msg => {

        createMessage(

            msg.sender,

            msg.text,

            msg.time

        );

    });

    messages.scrollTop = messages.scrollHeight;

}


/* =====================================================
   PART 17: GEMINI AI CONNECTION
===================================================== */

async function getBotReply(message) {

    const response = await fetch(`${API_URL}/chat`,  {

        method: "POST",

        headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
},

        body: JSON.stringify({

            message: message

        })

    });


    let data;

    try {

        data = await response.json();

    } catch (error) {

        throw new Error("Invalid response from backend");

    }


    if (!response.ok) {

        throw new Error(
            data.detail || "Gemini API request failed"
        );

    }


    if (!data.reply) {

        throw new Error("Gemini returned an empty response");

    }

    return data.reply;

}


/* =====================================================
   PART 18: SEND MESSAGE
===================================================== */

async function sendMessage() {

    const text = userInput.value.trim();

    if (text === "") return;

    if (!chats[currentChat]) return;


    // Save current chat reference

    const activeChat = chats[currentChat];


    // Save user message

    activeChat.messages.push({

        sender: "user",

        text: text,

        time: getTime()

    });


    // Set first user message as chat title

    if (activeChat.title === "New Chat") {

        activeChat.title = text.length > 30

            ? text.substring(0, 30) + "..."

            : text;

    }


    saveChats();

    renderChatList();

    renderMessages();


    // Clear input

    userInput.value = "";

    userInput.focus();


    // Show typing

    const typingElement = showTyping();

    pendingRequests++;

    if (sendBtn) sendBtn.disabled = true;


    try {

        // Get actual Gemini AI response

        const reply = await getBotReply(text);


        // Save AI response

        activeChat.messages.push({

            sender: "bot",

            text: reply,

            time: getTime()

        });


        saveChats();

    }

    catch (error) {

        console.error("Gemini Error:", error);

        let errorMessage = "Sorry! Something went wrong.";

        if (error.message.includes("Failed to fetch")) {

            errorMessage = "Cannot connect to backend. Please start your FastAPI server.";

        } else {

            errorMessage = "AI Error: " + error.message;

        }

        activeChat.messages.push({

            sender: "bot",

            text: errorMessage,

            time: getTime()

        });


        saveChats();

        toast("AI Connection Error");

    }

    finally {

        pendingRequests--;

        removeTyping(typingElement);

        if (sendBtn) {
            sendBtn.disabled = pendingRequests > 0;
        }

        // Refresh currently selected chat

        renderChatList();

        renderMessages();

    }

}


/* =====================================================
   PART 19: SEND BUTTON
===================================================== */

if (sendBtn) {

    sendBtn.addEventListener("click", sendMessage);

}


/* =====================================================
   PART 20: ENTER KEY
===================================================== */

if (userInput) {

    userInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter" && !e.shiftKey) {

            e.preventDefault();

            sendMessage();

        }

    });

}


/* =====================================================
   PART 21: COPY MESSAGE
===================================================== */

async function copyMessage(text) {

    try {

        await navigator.clipboard.writeText(text);

        toast("Copied Successfully");

    }

    catch (error) {

        console.error("Copy error:", error);

        toast("Unable to Copy");

    }

}


/* =====================================================
   PART 22: LIKE BUTTON
===================================================== */

function likeMessage() {

    toast("Thanks for your feedback 👍");

}


/* =====================================================
   PART 23: DISLIKE BUTTON
===================================================== */

function dislikeMessage() {

    toast("Feedback received 👎");

}


/* =====================================================
   PART 24: DARK MODE
===================================================== */

const themeBtn = document.querySelector(
    ".header-actions button"
);

if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        dark = !dark;

        document.body.classList.toggle("dark", dark);

        toast(dark ? "Dark Mode Enabled" : "Light Mode Enabled");

    });

}


/* =====================================================
   PART 25: CLEAR ALL CHATS
===================================================== */

function clearChats() {

    if (confirm("Delete all chats?")) {

        chats = [];

        createChat();

        toast("All Chats Deleted");

    }

}


/* =====================================================
   PART 26: KEYBOARD SHORTCUTS
===================================================== */

document.addEventListener("keydown", (e) => {

    // Ctrl + N = New Chat

    if (e.ctrlKey && e.key.toLowerCase() === "n") {

        e.preventDefault();

        createChat();

        toast("New Chat Created");

    }


    // Ctrl + / = Focus Input

    if (e.ctrlKey && e.key === "/") {

        e.preventDefault();

        if (userInput) userInput.focus();

    }

});


/* =====================================================
   PART 27: AUTO FOCUS
===================================================== */

window.addEventListener("load", () => {

    if (userInput) {

        userInput.focus();

    }

});


/* =====================================================
   PART 28: INITIALIZE CHATBOT
===================================================== */

function initializeChatbot() {

    if (chats.length === 0) {

        createChat();

    } else {

        currentChat = 0;

        addWelcomeMessage();

        renderChatList();

        renderMessages();

    }

}


// Start chatbot

initializeChatbot();


/* =====================================================
   INFINITYLOOPX AI CHATBOT
   VERSION 3 - GEMINI POWERED
===================================================== */


// ======================================
// INFINITYLOOPX AI - AUTHENTICATION
// ======================================



const authScreen = document.getElementById("authScreen");
const chatApp = document.getElementById("chatApp");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authMessage = document.getElementById("authMessage");

// Switch to Signup
document.getElementById("showSignup").addEventListener("click", () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";

    authTitle.textContent = "Create Account";
    authSubtitle.textContent = "Join InfinityLoopX AI today.";
    authMessage.textContent = "";
});

// Switch to Login
document.getElementById("showLogin").addEventListener("click", () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";

    authTitle.textContent = "Welcome Back!";
    authSubtitle.textContent = "Login to continue to your AI assistant.";
    authMessage.textContent = "";
});

// Signup API
signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    const button = signupForm.querySelector(".auth-submit");
    button.disabled = true;
    button.textContent = "Creating Account...";

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
},
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Signup failed");
        }

        authMessage.style.color = "#5ee6a8";
        authMessage.textContent = "Account created! Please login.";

        signupForm.reset();

        setTimeout(() => {
            document.getElementById("showLogin").click();
        }, 1200);

    } catch (error) {
        authMessage.style.color = "#ff8585";
        authMessage.textContent = error.message;
    } finally {
        button.disabled = false;
        button.textContent = "Create Account";
    }
});

// Login API
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const button = loginForm.querySelector(".auth-submit");
    button.disabled = true;
    button.textContent = "Signing In...";

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Login failed");
        }

        if (!data.access_token) {
            throw new Error("Login token was not received");
        }

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_name", data.user.name);

        authMessage.style.color = "#5ee6a8";
        authMessage.textContent = "Login successful!";

        authScreen.style.display = "none";
        chatApp.style.display = "flex";

        // Update sidebar profile
        const profileName = document.querySelector(".profile-info h3");
        if (profileName) {
            profileName.textContent = data.user.name;
        }

    } catch (error) {
        authMessage.style.color = "#ff8585";
        authMessage.textContent = error.message;
    } finally {
        button.disabled = false;
        button.textContent = "Sign In";
    }
});
