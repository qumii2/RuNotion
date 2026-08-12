// ============================================================
// Флаг для предотвращения повторного запуска перевода
// ============================================================
let isTranslating = false;

// ============================================================
// БЕЗОПАСНАЯ ВСТАВКА HTML (100% БЕЗ DOMParser и innerHTML)
// ============================================================
function insertSafeHTML(element, templateType, linkHref = '#', linkText = '') {
    while (element.firstChild) element.removeChild(element.firstChild);

    const createLink = (href, text) => {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.style.color = 'inherit';
        a.style.textDecoration = 'underline';
        a.textContent = text;
        return a;
    };

    if (templateType === 'desktopApp') {
        element.appendChild(document.createTextNode('Открывайте ссылки на Notion в десктопном приложении. Это происходит по умолчанию, если у вас установлено '));
        element.appendChild(createLink(linkHref, 'приложение для Windows'));
        element.appendChild(document.createTextNode('.'));
    } 
    else if (templateType === 'shortcuts') {
        element.appendChild(document.createTextNode('Применяется к чату, комментариям и другим полям ввода. Для отправки нажмите '));
        const s1 = document.createElement('strong'); s1.textContent = 'Cmd/Ctrl';
        element.appendChild(s1);
        element.appendChild(document.createTextNode(' + '));
        const s2 = document.createElement('strong'); s2.textContent = 'Enter';
        element.appendChild(s2);
        element.appendChild(document.createTextNode('.'));
    }
    else if (templateType === 'cookieNotice') {
        element.appendChild(document.createTextNode('Дополнительные сведения см. в разделе '));
        element.appendChild(createLink(linkHref, linkText || 'подробнее'));
        element.appendChild(document.createTextNode('.'));
    }
    else if (templateType === 'businessPlan') {
        element.appendChild(document.createTextNode('Агенты отвечают на вопросы, распределяют задачи, пишут отчеты и многое другое. Посмотрите, на что они способны, с бесплатным 14-дневным пробным периодом '));
        element.appendChild(createLink('https://www.notion.so/pricing', 'Notion Business'));
        element.appendChild(document.createTextNode('.'));
    }
    else if (templateType === 'emailDigests') {
        element.appendChild(document.createTextNode('Получайте дайджесты по электронной почте о страницах, для которых вы '));
        element.appendChild(createLink(linkHref, linkText || 'включили уведомления'));
        element.appendChild(document.createTextNode(', и созданных вами страницах.'));
    }
    else if (templateType === 'invitePermission') {
        element.appendChild(document.createTextNode('Просматривать эту ссылку могут только пользователи с правом приглашать участников в это рабочее пространство. Вы также можете '));
        element.appendChild(createLink(linkHref, 'создать новую ссылку'));
        element.appendChild(document.createTextNode('.'));
    }
    else if (templateType === 'noContacts') {
        element.appendChild(document.createTextNode('Контакты не найдены. '));
        element.appendChild(createLink(linkHref, 'Подключите аккаунты'));
        element.appendChild(document.createTextNode(', чтобы импортировать контакты.'));
    }
}

// ============================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПРОВЕРКИ УСЛОВНЫХ ПЕРЕВОДОВ ПО URL
// ============================================================
function getConditionalTranslation(key, rawText) {
    const url = window.location.href;
    const trimmedKey = key.trim();

    if (trimmedKey === 'free' || trimmedKey === 'Free') {
        if (url.includes('calendar.notion.so')) {
            return rawText.replace(trimmedKey, 'Свободно');
        }
        if (url.includes('www.notion.com') || url.includes('app.notion.com')) {
            return rawText.replace(trimmedKey, 'бесплатно');
        }
    }

    if (trimmedKey === 'Create') {
        const replacement = url.includes('www.notion.com') ? 'Создают' : 'Создать';
        return rawText.replace(trimmedKey, replacement);
    }

    return null;
}

// ============================================================
// ОСНОВНАЯ ФУНКЦИЯ ПЕРЕВОДА
// ============================================================
function translateElement(node) {
    if (!node) return;

    // ---- 1. ОБРАБОТКА ТЕКСТОВОГО УЗЛА ----
    if (node.nodeType === Node.TEXT_NODE) {
        const rawText = node.textContent;
        const trimmedText = rawText.trim();
        if (!trimmedText) return;

        const conditionalResult = getConditionalTranslation(trimmedText, rawText);
        if (conditionalResult !== null) {
            node.textContent = conditionalResult;
            return;
        }

        if (typeof dictionary !== 'undefined' && dictionary[trimmedText]) {
            node.textContent = rawText.replace(trimmedText, dictionary[trimmedText]);
            return; 
        }
        if (trimmedText.startsWith("Get answers")) {
            node.textContent = rawText.replace(trimmedText, "Получайте мгновенные ответы — с указанием источников.");
            return;
        }
        const translations = {
            "Preferences": "Настройки",
            "Choose how you want Notion to look and behave": "Выберите внешний вид и поведение Notion",
            "Account": "Аккаунт",
            "Manage your profile, login information, and devices": "Управляйте своим профилем, данными для входа и устройствами",
            "Notifications": "Уведомления",
            "Decide when and how you want to be notified": "Решите, когда и как вы хотите получать уведомления",
            "Mail & Calendar": "Почта и календарь",
            "Manage emails and calendars connected to your Notion account": "Управляйте почтой и календарями, подключенными к вашему аккаунту Notion",
            "General": "Общие",
            "Manage your workspace name, domains, and more": "Управляйте названием рабочего пространства, доменами и многим другим",
            "People": "Люди",
            "Manage people in your workspace and their roles": "Управляйте людьми в вашем рабочем пространстве и их ролями",
            "Import": "Импорт",
            "Import data from other apps and files into Notion": "Импортируйте данные из других приложений и файлов в Notion",
            "Emoji": "Эмодзи",
            "See all workspace emojis and add new ones": "Просматривайте все эмодзи рабочего пространства и добавляйте новые",
            "Developer": "Разработчик",
            "Teamspaces": "Командные пространства",
            "Manage teamspaces in this workspace": "Управляйте командными пространствами в этой рабочей области",
        };

        if (translations[trimmedText]) {
            node.textContent = rawText.replace(trimmedText, translations[trimmedText]);
        }

    // ---- 2. ОБРАБОТКА HTML-ЭЛЕМЕНТА ----
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        
        if (typeof dictionary !== 'undefined' && node.placeholder) {
            if (dictionary[node.placeholder]) {
                node.placeholder = dictionary[node.placeholder];
            }
        }

        const text = node.textContent;

        if (node.tagName === 'P' || node.tagName === 'DIV' || node.tagName === 'SPAN' || node.tagName === 'BUTTON' || node.tagName === 'A') {
            
            if (text.startsWith("Open Notion links in the desktop app")) {
                const linkElement = node.querySelector('a');
                insertSafeHTML(node, 'desktopApp', linkElement ? linkElement.href : '#');
            } 
            
            else if (text.startsWith("Applies to chat, comments")) {
                insertSafeHTML(node, 'shortcuts');
            } 
            
            else if (text.startsWith("See the") && text.includes("for more information")) {
                const linkElement = node.querySelector('a');
                insertSafeHTML(node, 'cookieNotice', linkElement ? linkElement.href : '#', linkElement ? linkElement.textContent : 'cookie notice');
            }
            
            else if (text.startsWith("Let your favorite apps and tools take actions in Notion")) {
                node.textContent = "Позвольте вашим любимым приложениям и инструментам выполнять действия в Notion через наш MCP-сервер.";
            }
            
            else if (text.startsWith("Enable features for developing")) {
                node.textContent = "Включите функции для разработки Workers и подключений.";
            }
            
            else if (text.startsWith("Agents answer questions, route tasks")) {
                insertSafeHTML(node, 'businessPlan');
            }
            
            else if (text.startsWith("Get email digests about pages you")) {
                const linkElement = node.querySelector('a');
                insertSafeHTML(node, 'emailDigests', linkElement ? linkElement.href : '#', linkElement ? linkElement.textContent : 'turned on notifications for');
            }
            
            else if (text.startsWith("Only people with permission to invite members")) {
                const linkElement = node.querySelector('a');
                insertSafeHTML(node, 'invitePermission', linkElement ? linkElement.href : '#');
            }
            
            else if (text.startsWith("No contacts found")) {
                const linkElement = node.querySelector('a');
                insertSafeHTML(node, 'noContacts', linkElement ? linkElement.href : '#');
            }
            else if (text.startsWith("Display 2")) {
                node.textContent = "Показать от 2 до 9 дней";
            }
            
            else if (text.startsWith("Show") && text.endsWith("hide weekends")) {
                node.textContent = "Показать / скрыть выходные";
            }
            
            else if (text.startsWith("Show / hide declined events")) {
                node.textContent = "Показать / скрыть отклоненные события";
            }
            else if (text.startsWith("Show") && text.endsWith("hide declined events")) {
                node.textContent = "Ваш переведенный текст";
            }

            else if (text.startsWith("Expand") && text.endsWith("collapse all-day")) {
                node.textContent = "Ваш переведенный текст";
            }
            
            else if (text.startsWith("Go to next week")) {
                node.textContent = "Перейти к следующей неделе / месяцу";
            }
            
            else if (text.startsWith("Go to previous week")) {
                node.textContent = "Перейти к предыдущей неделе / месяцу";
            }
            else if (text.startsWith("Set theme to") && text.endsWith("dark")) {
                node.textContent = "Переключить светлую / темную тему";
            }
            
            else if (text.startsWith("Add") && text.endsWith("selected")) {
                node.textContent = "Добавить / удалить выбранное";
            }
            else if (text.startsWith("With a cut") && text.endsWith("or hold…")) {
                node.textContent = "С вырезанным / скопированным событием или слотом…";
            }
            else if (text.startsWith("Select") && text.endsWith("highlighted event")) {
                node.textContent = "Выбрать / отменить выбор выделенного события";
            }
            else if (text.includes("With a selected meeting or repeat event")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.includes("With a selected meeting or repeat event")) {
                        textNode.nodeValue = textNode.nodeValue.replace(/With a selected meeting or repeat event.*/, "С выбранной встречей или повторяющимся событием…");
                    }
                }
            }
            else if (text.includes("With a selected event or hold")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.includes("With a selected event or hold")) {
                        textNode.nodeValue = textNode.nodeValue.replace(/With a selected event or hold.*/, "С выбранным событием или слотом…");
                    }
                }
            }
            else if (text.startsWith("With a cut") && text.includes("or hold")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("With a cut")) {
                        textNode.nodeValue = "С вырезанным / скопированным событием или слотом…";
                    }
                }
            }
            else if (text.startsWith("Search") && text.endsWith("Find")) {
                node.textContent = "Поиск";
            }
            else if (text.startsWith("With a selected hold")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("With a selected hold")) {
                        textNode.nodeValue = "С выбранным слотом…";
                    }
                }
            }
            else if (text.startsWith("Copy scheduling link") && text.includes("Create")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("Copy scheduling link")) {
                        textNode.nodeValue = "Скопировать ссылку для планирования (доступно после нажатия «Создать»";
                    }
                }
            }
            else if (text.startsWith("Enabled after") && text.includes("Create")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("Enabled after")) {
                        textNode.nodeValue = "Доступно после нажатия «Создать»";
                    }
                }
            }
            else if (text.startsWith("Copy snippet") && text.includes("Create")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("Copy snippet")) {
                        textNode.nodeValue = "Скопировать сниппет (доступно после нажатия «Создать»";
                    }
                }
            }

            else if (text.startsWith("When moving a meeting") && text.includes("repeat event")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("When moving a meeting")) {
                        textNode.nodeValue = "При перемещении встречи или повторяющегося события…";
                    }
                }
            }
            else if (text.startsWith("Edit calendar") && text.endsWith("color")) {
                node.textContent = "Редактировать календарь или цвет";
            }

            else if (text.startsWith("Show / hide") && text.endsWith("participant overlays")) {
                node.textContent = "Показать / скрыть наложения участников";
            }
            else if (text.startsWith("Editing") && text.includes("Editing")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("Editing")) {
                        textNode.nodeValue = "Редактирование";
                    }
                }
            }

            else if (text.startsWith("With a selected event") && text.includes("event")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("With a selected event")) {
                        textNode.nodeValue = "С выбранным событием…";
                    }
                }
            }

            else if (text.startsWith("With a selected meeting") && text.includes("meeting")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("With a selected meeting")) {
                        textNode.nodeValue = "С выбранной встречей…";
                    }
                }
            }
            else if (text.startsWith("Show") && text.includes("participant overlays")) {
                let walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                let textNode;
                while (textNode = walker.nextNode()) {
                    if (textNode.nodeValue.startsWith("Show")) {
                        textNode.nodeValue = "Показать / скрыть наложения участников";
                    }
                }
            }
        }
        
        for (let child of node.childNodes) {
            translateElement(child);
        }
    }
}

// ============================================================
// ЗАПУСК ПЕРЕВОДА ВСЕЙ СТРАНИЦЫ
// ============================================================
function runTranslation() {
    if (isTranslating) return;
    isTranslating = true;
    translateElement(document.body);
    isTranslating = false;
}

// ============================================================
// 1. ПЕРЕВОД ПРИ ЗАГРУЗКЕ
// ============================================================
runTranslation();

// ============================================================
// 2. ПЕРИОДИЧЕСКИЙ ПРОГОН (СТРАХОВКА)
// ============================================================
setInterval(runTranslation, 1000);

// ============================================================
// 3. НАБЛЮДАТЕЛЬ ЗА ИЗМЕНЕНИЯМИ (MutationObserver) С requestAnimationFrame
// ============================================================
const observer = new MutationObserver((mutations) => {
    requestAnimationFrame(() => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    translateElement(node);
                });
            }
            
            if (mutation.type === 'characterData' || mutation.type === 'attributes') {
                translateElement(mutation.target);
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true    
});