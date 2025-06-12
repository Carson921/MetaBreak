// ==UserScript==
// @name         Huggingchat
// @namespace    http://tampermonkey.net/
// @version      2024-12-28
// @description  try to take over the world!
// @author       You
// @match        https://huggingface.co/chat/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=huggingface.co
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let messages = [];
    let currentIndex = -1; // To keep track of which message is being sent
    let coming = false;

    // Configuration
    const interval = 3000; // Interval between messages in milliseconds (5000ms = 5 seconds)
    const targetSelector = 'div[data-message-role="assistant"]'; // Target div selector

    const SCRIPT_KEY = 'tampermonkey_single_execution';

    // Define shared state
    let sharedState = {
        index: -1,
        coming: false,
        messages: [],
    };

    // Initialize state from localStorage (if available)
    function loadState() {
        const stateString = localStorage.getItem(SCRIPT_KEY);
        if (stateString) {
            try {
                sharedState = JSON.parse(stateString);
            } catch (e) {
                console.warn('Failed to parse state:', e);
            }
        }
    }

    // Save state to localStorage
    function saveState() {
        localStorage.setItem(SCRIPT_KEY, JSON.stringify(sharedState));
    }

    // Function to add file input to the page
    function addFileInput() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';
        fileInput.style.position = 'fixed';
        fileInput.style.top = '10px';
        fileInput.style.right = '10px';
        fileInput.style.zIndex = '9999';
        fileInput.title = 'Upload a file with messages';

        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                readFile(file);
            }
        });
    }

    // Function to read the content of the uploaded file
    function readFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            //messages = content.split(' example\n').filter(msg => msg.trim() !== "").map(msg => msg + ' example');
            messages = content.split('\n').filter(msg => msg.trim() !== "");
            console.log("Messages loaded:", messages);
            alert(`Loaded ${messages.length} messages.`);
        };
        reader.readAsText(file);
    }

    // Function to fetch all content from target elements
    function fetchAllContent() {
        const elements = document.querySelectorAll(targetSelector);
        let collectedText = '';
        elements.forEach((element) => {
            collectedText += element.innerText.trim() + '\n';
        });
        return collectedText;
    }

    // Function to save content to a local file
    function saveContentToFile(content, fileName = 'assistant_content.txt') {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('File downloaded:', fileName);
    }

    /*let sleep = function(ms){
        const endTime = Date.now()+ms;
        while(Date.now() <= endTime){}
    }*/

    let sleep = function(ms){
        return new Promise(resolve=>setTimeout(resolve,ms))
    }

    function generateFilename(index) {
        return `${index.toString().padStart(3, '0')}.txt`; // Pads index with leading zeros
    }

    let mutex = {
        locked: false,
        lock: function() {
            return new Promise(resolve => {
                const checkLock = () => {
                    if (!this.locked) {
                        this.locked = true;
                        resolve();
                    } else {
                        setTimeout(checkLock, 100); // Check again after 100ms
                    }
                };
                checkLock();
            });
        },
        unlock: function() {
            this.locked = false;
        }
    };

    // Function to send a message
    async function sendMessage() {
        try {
            const href = window.location.href;
            if (href === 'https://huggingface.co/chat/'){
                //await mutex.lock();

                loadState();
                coming = sharedState.coming;
                messages = sharedState.messages;
                currentIndex = sharedState.index + 1;

                if (coming == true) {
                    return;
                }

                if (messages.length === 0) {
                    console.warn("No messages to send. Upload a file first.");
                    return;
                }

                if (currentIndex >= messages.length) {
                    console.log("All messages have been sent. Stopping iteration.");
                    return;
                }

                // Find the chat input box
                const inputBox = document.querySelector('textarea');
                // Find the send button using its unique attribute
                const sendButton = document.querySelector('button[aria-label="Send message"]');

                if (inputBox && sendButton) {
                    const message = messages[currentIndex];
                    // Focus on the input box and set the message
                    inputBox.focus();
                    inputBox.value = message;

                    // Trigger input event to notify React/DOM of changes
                    const inputEvent = new Event('input', { bubbles: true });
                    inputBox.dispatchEvent(inputEvent);

                    setTimeout(() => {
                        sendButton.click();
                        sharedState.coming = true;
                        sharedState.index = currentIndex;
                        saveState();
                    }, 100); // Small delay to allow React to sync the value
                } else if (sendButton.disabled) {
                    console.warn("Send button is disabled, waiting...");
                } else {
                    console.error("Input box or send button not found.");
                }

                //mutex.unlock();
            } else {
                //await mutex.lock();

                loadState();
                coming = sharedState.coming;
                currentIndex = sharedState.index;

                if (coming == false) {
                    return;
                }

                sharedState.coming = false;
                saveState();

                await sleep(10000)

                const currentContent = fetchAllContent();
                saveContentToFile(currentContent, generateFilename(currentIndex));

                const clearButton = document.querySelector('a[data-svelte-h="svelte-1q3d9ev"]');
                clearButton.click();

                //mutex.unlock();
            }
        } catch (error) {
            console.error("Error in sendMessage function:", error);
        }
    }

    // Initialization
    function init() {
        setInterval(sendMessage, interval);
    }

    init();
})();