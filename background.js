chrome.runtime.onInstalled.addListener(function () {
    console.log("Extension installed");
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendApiRequest") {
        const requestData = request.data;
        const configUrl = chrome.runtime.getURL('config.txt');

        fetch(configUrl)
            .then(response => response.text())
            .then(baseUrl => {
                fetch(`${baseUrl}/api/v1/code/predict`, {
                    method: "POST",
                    mode: "no-cors",
                    body: JSON.stringify(requestData),
                })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('네트워크 응답이 올바르지 않습니다.');
                })
                .then((data) => {
                    sendResponse({ success: true, data: data });
                })
                .catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "executeRequest") {
        var authCode = message.authCode;
        const configUrl = chrome.runtime.getURL('config.txt');

        fetch(configUrl)
            .then(response => response.text())
            .then(baseUrl => {
                var url = `${baseUrl}/api/v1/code?code=${authCode}`;

                fetch(url)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error('네트워크 응답이 올바르지 않습니다.');
                    })
                    .then((data) => {
                        sendResponse({ success: true, data: data });
                    })
                    .catch((error) => {
                        sendResponse({ success: false, error: error.message });
                    });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});
