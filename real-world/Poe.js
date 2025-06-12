// ==UserScript==
// @name         Poe
// @namespace    http://tampermonkey.net/
// @version      2024-12-17
// @description  try to take over the world!
// @author       You
// @match        https://poe.com/chat/307o7o51vp4e8m510l6
// @icon         https://www.google.com/s2/favicons?sz=64&domain=poe.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const interval = 15000; // Interval between messages in milliseconds (5000ms = 5 seconds)

    let messages = [];
    let currentIndex = 0; // To keep track of which message is being sent

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
            messages = content.split('\nmanu split\n').filter(msg => msg.trim() !== "");
            console.log("Messages loaded:", messages);
            alert(`Loaded ${messages.length} messages.`);
        };
        reader.readAsText(file);
    }

    // Function to send a message
    function sendMessage() {
        try {
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
            const sendButton = document.querySelector('button[data-button-send="true"]');
            const clearButton = document.querySelector('button[class="button_root__TL8nv button_ghost__YsMI5 button_sm__hWzjK button_center__RsQ_o button_showIconOnly-always__05Gb5"]');

            if (clearButton) {
                clearButton.click();
            }

            if (inputBox && sendButton) {
                const message = messages[currentIndex];
                // Focus on the input box and set the message
                inputBox.focus();
                inputBox.value = message;

                // Trigger input event to notify React/DOM of changes
                const inputEvent = new Event('input', { bubbles: true });
                inputBox.dispatchEvent(inputEvent);

                // Use setTimeout to ensure React processes the value
                setTimeout(() => {
                    sendButton.click();
                    console.log("Message sent:", message);
                    currentIndex++; // Move to the next message
                }, 1000); // Small delay to allow React to sync the value

                // Wait and fetch the response content
                //fetchResponseContent();
            } else if (sendButton.disabled) {
                console.warn("Send button is disabled, waiting...");
            } else {
                console.error("Input box or send button not found.");
            }
        } catch (error) {
            console.error("Error in sendMessage function:", error);
        }
    }

    // Initialization
    function init() {
        addFileInput();
        setInterval(sendMessage, interval);
    }

    init();
})();