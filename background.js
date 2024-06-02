chrome.runtime.onInstalled.addListener(function () {
    console.log("Extension installed");
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendApiRequest") {
        const requestData = request.data;
        const configUrl = chrome.runtime.getURL('config.txt');

        console.log(requestData)

        fetch(configUrl)
            .then(response => response.text())
            .then(baseUrl => {
                fetch(`${baseUrl}/api/v1/code/predict`, {
                    method: "POST",
                    mode: "cors",
                    body: JSON.stringify({code: requestData.code, link: requestData.link})
                })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return response.json().then((errorData) => {
                            throw new Error(errorData.msg || '네트워크 응답이 올바르지 않습니다.');
                        });
                    }
                })
                .then(responseData => {console.log(responseData); return responseData;})
                .then(data => sendResponse({success: true, data: data}))
                .catch((error) => {
                    console.error("Error in sendApiRequest:", error);
                    sendResponse({ success: false, error: error.message });
                });
            })
            .catch(error => {
                console.error("Error in sendApiRequest:", error);
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
                fetch( `${baseUrl}/api/v1/code?code=${authCode}`)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            return response.json().then((errorData) => {
                                throw new Error(errorData.msg || '네트워크 응답이 올바르지 않습니다.');
                            });
                        }
                    })
                    .then((data) => {
                        sendResponse({ success: true, data: data });
                    })
                    .catch((error) => {
                        console.error("Error in executeRequest:", error);
                        sendResponse({ success: false, error: error.message });
                    });
            })
            .catch(error => {
                console.error("Error in executeRequest:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});
