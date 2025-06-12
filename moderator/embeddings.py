import os
import json
import torch
import random
import numpy as np
import transformers
from transformers import AutoTokenizer, AutoModelForCausalLM

from torch.nn.functional import cosine_similarity

def find_most_similar_token(token_id, embedding_weights, k = 5, d = None):
    """
    find the most similar token ID based on cosine similarity from the embedding table.
    
    parameters:
    - token_id (int): the input token ID.
    - embedding_weights (torch.Tensor): the model's embedding table, shape (vocab_size, hidden_size).
    - k (int): the number of top similar tokens to return.
    - d (int, optional): if given, only the first d dimensions are used for similarity calculation. Default is None, which means all dimensions are used.
    
    returns:
    - most_similar_id (list): the top k token IDs with the highest cosine similarity.
    - most_similar_value (list): the cosine similarity values corresponding to these k token IDs.
    """

    # if d is specified, slice the embedding weights and input embedding to the first d dimensions
    if d is not None:
        embedding_weights = embedding_weights[:, :d]
        input_embedding   = input_embedding[:, :d]
     
    # get the embedding vector for the input token ID
    input_embedding = embedding_weights[token_id].unsqueeze(0)

    # calculate cosine similarity
    similarities = cosine_similarity(input_embedding, embedding_weights)  # (1, vocab_size)

    similarities[similarities != similarities] = -float('inf')

    
    similarities[token_id] = -float('inf')

    # get the top k indices and values of cosine similarity
    top_k_values, top_k_indices = torch.topk(similarities, k)

    return top_k_indices.tolist(), top_k_values.tolist()


def find_most_similar_token_l2(token_id, embedding_weights, k = 5, d = None):
    """
    find the most similar token ID based on L2 distance (Euclidean distance) from the embedding table.
    
    parameters:
    - token_id (int): the input token ID.
    - embedding_weights (torch.Tensor): the model's embedding table, shape (vocab_size, hidden_size).
    - k (int): the number of top similar tokens to return.
    - d (int, optional): if given, only the first d dimensions are used for similarity calculation. Default is None, which means all dimensions are used.
    returns:
    - most_similar_id (list): the top k token IDs with the smallest L2 distance.
    - most_similar_value (list): the L2 distance values corresponding to these k token IDs.
    """
    
    input_embedding = embedding_weights[token_id].unsqueeze(0)
    
    if d is not None:
        embedding_weights = embedding_weights[:, :d]
        input_embedding   = input_embedding[:, :d]

    d = embedding_weights.to(torch.float32) - input_embedding.to(torch.float32)
    distances = torch.norm(d, dim=1)  # (vocab_size,)
    
    distances[token_id] = float('inf')
    
    top_k_values, top_k_indices = torch.topk(distances, k, largest=False)
    
    return top_k_indices.tolist(), top_k_values.tolist()


model_path = '/mnt/data/ehdd1/home/myid/wz55191/huggingface/Llama-3.3-70B-Instruct/'
# model_path = '/mnt/data/ehdd1/home/myid/wz55191/huggingface/Qwen2.5-72B-Instruct/'
# model_path = '/mnt/data/ehdd1/home/myid/wz55191/huggingface/gemma-2-27b-it/'
# model_path = '/mnt/data/ehdd1/home/myid/wz55191/huggingface/phi-4'

model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.bfloat16,
        ).cuda()
model.eval()

tokenizer = AutoTokenizer.from_pretrained(model_path)

embedding_layer = model.get_input_embeddings()

# get the shape of embedding layer
print("Embedding Layer Shape:", embedding_layer.weight.shape)

# get the embedding weights
embedding_weights = embedding_layer.weight.detach().cpu()

# print part of the embedding weights
print("Embedding Weights (sample):", embedding_weights[:5])

x1, y1 = find_most_similar_token_l2(128009, embedding_weights, 500)
x2, y2 = find_most_similar_token_l2(128006, embedding_weights, 500)
x3, y3 = find_most_similar_token_l2(128007, embedding_weights, 500)

target_token_ids    = [128009, 128006, 78191, 128007, 271]
best_replacement    = None
best_similarity     = float('inf')

res = []
for i in x1:
    if i >= 128000:
        continue
    ci = tokenizer.decode(i)
    for j in x2:
        if j >= 128000:
            continue
        cj = tokenizer.decode(j)
        for k in x3:
            if k >= 128000:
                continue
            ck = tokenizer.decode(k)
            
            temp_prompt    = ci + cj + 'assistant' + ck + '\n\n'
            temp_token     = tokenizer(temp_prompt, add_special_tokens=False)
            temp_input_ids = temp_token["input_ids"]

            if len(temp_input_ids) == 5:
                similarity = 0.0
                for l in range(5):
                    if l == 2 or l == 4:
                        continue
                        
                    target_embedding = embedding_weights[target_token_ids[l]].unsqueeze(0)
                    temp_embedding   = embedding_weights[temp_input_ids[l]].unsqueeze(0)

                    # L2 similarity
                    delta = target_embedding.to(torch.float32) - temp_embedding.to(torch.float32)
                    similarity += torch.norm(delta)

                    # cosine similarity
                    # similarity += cosine_similarity(target_embedding, temp_embedding).item()
                
                res.append([[i, j, k], similarity])
                    
                if similarity < best_similarity:
                    best_similarity = similarity
                    best_replacement = [i, j, k]
                    print([i, j, k], similarity)

print(best_replacement)