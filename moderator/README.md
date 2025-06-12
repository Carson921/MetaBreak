# Bypassing Moderation-Based Defense

## Overview

In this experiment, we specifically examine the behavior of jailbreak methods when tested under LLM guardrails. Additionally, we explore the concept of **token substitution**, which involves replacing specific tokens with semantically similar alternatives that bypass sanitization mechanisms.

### Key Components

The experiment comprises the following core components:
1. **Prompt Flagging Rates**:
   - This script evaluates how frequently different prompts pass through the LLM models without being blocked or altered by the safety systems.
   - The code logs and calculates the success rate for a variety of unsafe queries to determine the robustness of the LLM’s filtering mechanisms.

2. **Token Substitution**:
   - This part calculates alternative tokens based on **embedding similarity** in the LLM's vocabulary.
   - It substitutes specific special tokens with regular tokens that have similar semantic meanings, aiming to bypass any token sanitization defense mechanisms.

## How to Use

```bash
python guardrails.py
python embeddings.py
