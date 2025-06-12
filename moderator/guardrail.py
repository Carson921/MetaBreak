import os
import json
import requests
from datetime import datetime

def generate_responses(prompt, output_path, model, assistant_header):
    # Target URL
    url = 'http://localhost:11434/api/chat'

    # Request Header
    headers = {
        'Content-Type': 'application/json'
    }
    
    res = []
    for i in range(450):
        q = prompt[i]
        chat = [  
            {"role": "user", "content": q},
        ]

        data = {
            "model": model,
            "messages": chat,
            "stream": False,
        }

        response = requests.post(url, headers = headers, data = json.dumps(data))
        result   = json.loads(response.text)
        content += result['message']['content'] + ' '

        if 'unsafe' in content:
            res.append(1)
        else:
            res.append(0)

    with open(output_path, 'w') as f:
        f.write(str(res))


if __name__ == "__main__":
    model = 'llama_guard3:8b'
    output_path = '../results/'

    with open('../prompts/Q_TM-1_Llama.txt', 'r') as f:
        Questions = f.read()
    Questions = Questions.split('\ntest split\n')

    generate_responses(Questions, output_path, model)