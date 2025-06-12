# Circumventing Safety Alignment

## Overview

The `local_test.py` script is designed to emulate the behavior of large language model (LLM) applications in a local environment. It allows researchers and developers to experiment with different strategies while maintaining control over input/output and environmental variables.

## Prerequisites

Before using `local_test.py`, ensure that:

1. **Ollama is installed and running on your machine.**
   - Visit [https://ollama.ai](https://ollama.ai) to install and learn more about Ollama.
2. **The target LLM is served via Ollama.**
   - For example, to serve the LLaMA 3.3 70B quantized model:
     ```bash
     ollama run llama3:70b-q8_0
     ```

## Default Test Configuration

By default, `local_test.py` is configured to evaluate the **Turn-masking** method on the **LLaMA-3.3-70B-Q8_0** model. Other Methods' prompts can be seen under folder `prompts/`

### How to Run

```bash
python local_test.py

