# Real-World Performance Evaluation Scripts

## Overview

The goal of this module is to **automatically send test prompts** and **collect responses** from LLMs deployed on real platforms, enabling consistent and large-scale evaluation of attack methods such as MetaBreak.

## Components

### 1. `HuggingChat.js` (Tampermonkey Script)
Automates prompt submission and result collection from [HuggingChat](https://huggingface.co/chat/).

**Features**:
- Loads prompts from a `.txt` file.
- Sends prompts at fixed intervals.
- Captures model responses from `div[data-message-role="assistant"]` and saves them as `.txt` files locally.
- Clears the chat between prompts to isolate each trial.

**Usage**:
1. Install the [Tampermonkey extension](https://www.tampermonkey.net/) in your browser.
2. Load `HuggingChat.js` into Tampermonkey.
3. Visit HuggingChat.
4. Upload a `.txt` file containing one prompt per line.
5. The script will automatically iterate over each prompt, send it, save the result, and move to the next one.

---

### 2. `Poe.js` (Tampermonkey Script)
Automates evaluation on [Poe](https://poe.com), which aggregates several commercial and open-source chat models.

**Features**:
- Uploads and splits prompts using a custom delimiter `manu split`.
- Sends messages sequentially and clears history before each new prompt.
- Automatically triggers the input and submission elements.

**Usage**:
1. Install and configure in Tampermonkey.
2. Load the script while browsing Poe’s chatbot page.
3. Upload your prompt batch file.
4. The script handles prompt injection and interaction.

---

### 3. `OpenAI.py` (Python Script)
Sends prompts to OpenAI's official models using their API (e.g., GPT-4.1) and logs responses.

**Features**:
- Supports multiple models via OpenAI's `chat/completions` endpoint.
- Tracks completion success, safety refusals, and logs JSON responses.
- Can be easily extended for model comparison or batch evaluation.

**Basic Usage**:

```bash
python OpenAI.py