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

        var supportedDomains = ["velog", "tistory", "medium"];
        var urlDomain = new URL(currentPageUrl).hostname;

        if (!supportedDomains.some(domain => urlDomain.includes(domain))) {
            messageDisplay.textContent = "지원하지 않는 도메인";
            messageDisplay.style.color = "red";
            return;
        }



        fetch(`${baseUrl}/posts`, { // baseUrl 사용
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: currentPageUrl }),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('네트워크 응답이 올바르지 않습니다.');
            })
            .then((data) => {
                console.log("Success:", data);
                messageDisplay.textContent = "북마크 성공!";
                messageDisplay.style.color = "green";
            })
            .catch((error) => {
                console.error("Error:", error);
                messageDisplay.textContent = "에러: " + error.message;
                messageDisplay.style.color = "red";
            });
    });
});

document.getElementById("authIcon").addEventListener("click", function () {
    var authPopup = document.getElementById("authPopup");
    if (authPopup.style.display === "block") {
        authPopup.style.display = "none";
        // 인증 팝업 숨겨질 때 body의 너비를 원래대로 돌려놓음
        document.body.style.width = "200px"; // 원래 크기로 설정
    } else {
        authPopup.style.display = "block";
        // 인증 팝업이 보여질 때 body의 너비를 늘려줌
        document.body.style.width = "300px"; // 예시로 300px로 설정

        chrome.storage.local.get(["authCode"], function (result) {
            if (result.authCode) {
                document.getElementById("authCodeInput").value = result.authCode;
            }
        });
    }
});

document.getElementById("saveAuthCodeButton").addEventListener("click", function () {
    var authCode = document.getElementById("authCodeInput").value;
    chrome.storage.local.set({ authCode: authCode }, function () {
        console.log("Auth code saved:", authCode);
        alert("인증 코드가 저장되었습니다.");
    });
});

document.getElementById("cancelIcon").addEventListener("click", function() {
    document.getElementById("authPopup").style.display = "none";
    // 취소 아이콘이 클릭되면 body의 너비를 원래대로 돌려놓음
    document.body.style.width = "200px"; // 원래 크기로 설정
});

window.onload = function () {
    chrome.storage.local.get(["authCode"], function (result) {
        if (result.authCode) {
            document.getElementById("authCodeInput").value = result.authCode;
        }
    });
};
