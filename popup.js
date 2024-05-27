document.getElementById("sendButton").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentPageUrl = tabs[0].url;
        document.getElementById("urlDisplay").textContent = currentPageUrl;

        var messageDisplay = document.getElementById("messageDisplay");
        if (!messageDisplay) {
            messageDisplay = document.createElement("div");
            messageDisplay.id = "messageDisplay";
            document.body.appendChild(messageDisplay);
        }

        var supportedDomains = ["velog", "tistory", "medium", "github"];
        var urlDomain = new URL(currentPageUrl).hostname;

        if (!supportedDomains.some(domain => urlDomain.includes(domain))) {
            messageDisplay.textContent = "지원하지 않는 도메인";
            messageDisplay.style.color = "red";
            return;
        }

        chrome.storage.local.get(["authCode"], function(result) {
            const authCode = result.authCode;
            const requestData = {
                code: authCode,
                link: currentPageUrl
            };

            chrome.runtime.sendMessage({ action: "sendApiRequest", data: { code: authCode, link: currentPageUrl, urlDomain: supportedDomains.find(domain => urlDomain.includes(domain))}, }, function(response) {
                if (response.success) {
                    messageDisplay.textContent = "북마크 성공!";
                    messageDisplay.style.color = "green";
                } else {
                    messageDisplay.textContent = "에러: " + response.error;
                    messageDisplay.style.color = "red";
                }
            });
        });
    });
});

document.getElementById("authIcon").addEventListener("click", function () {
    var authPopup = document.getElementById("authPopup");
    if (authPopup.style.display === "block") {
        authPopup.style.display = "none";
        document.body.style.width = "200px";
    } else {
        authPopup.style.display = "block";
        document.body.style.width = "300px";

        chrome.storage.local.get(["authCode"], function (result) {
            if (result.authCode) {
                document.getElementById("authCodeInput").value = result.authCode;
            }
        });
    }
});

document.getElementById("saveAuthCodeButton").addEventListener("click", function () {
    var authCode = document.getElementById("authCodeInput").value;
    var authMessageDisplay = document.getElementById("authMessageDisplay");
    chrome.storage.local.set({ authCode: authCode }, function () {
        console.log("Auth code saved:", authCode);

        chrome.runtime.sendMessage({ action: "executeRequest", authCode: authCode }, function(response) {
            if (response.success) {
                authMessageDisplay.textContent = `선택된 워크스페이스: ${response.data.workspace_name}`;
                authMessageDisplay.style.color = "green";
            } else {
                authMessageDisplay.textContent = "에러:" + response.error;
                authMessageDisplay.style.color = "red";
            }
        });
    });
});

document.getElementById("cancelIcon").addEventListener("click", function() {
    document.getElementById("authPopup").style.display = "none";
    document.body.style.width = "200px";
});

window.onload = function () {
    chrome.storage.local.get(["authCode"], function (result) {
        if (result.authCode) {
            document.getElementById("authCodeInput").value = result.authCode;
        }
    });
};
