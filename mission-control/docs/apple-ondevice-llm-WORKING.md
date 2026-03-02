# Apple On-Device LLM - WORKING

**Status:** ✅ OPERATIONAL  
**Date:** March 2, 2026  
**Model:** mlx-community/SmolLM2-360M-Instruct (~400MB)  
**Framework:** MLX (Apple Machine Learning)  

## Quick Start

```bash
# Run the test
cd /Users/mohlt/.openclaw/workspace
source venv/bin/activate
python3 mission-control/scripts/test-mlx-llm.py
```

## Performance

| Metric | Value |
|--------|-------|
| Load Time | 0.3-0.5s |
| Inference Speed | 60-400 tokens/sec |
| Latency | 100-800ms |
| Cost per inference | $0 |

## Test Results (Mar 2, 2026)

```
✅ Test 1: "List three benefits of local AI inference"
   Response: 1. **Improved Efficiency**: Local AI inference can significantly...
   Tokens/sec: 62.4
   Latency: 801ms

✅ Test 2: "What is 2 + 2?"
   Response: 2 + 2 = 4
   Tokens/sec: 403.5
   Latency: 123ms

✅ Test 3: "Summarize this: The quick brown fox..."
   Response: The quick brown fox jumps over the lazy dog
   Tokens/sec: 303.6
   Latency: 164ms
```

## Installation (Already Done)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install MLX
pip install mlx-lm
```

## Usage from Python

```python
from mlx_lm import load, generate

# Load model (downloads on first run)
model, tokenizer = load("mlx-community/SmolLM2-360M-Instruct")

# Generate
response = generate(
    model, tokenizer,
    prompt="What is the capital of France?",
    max_tokens=50
)
print(response)  # "Paris"
```

## Best Use Cases

✅ **Great for:**
- Text summarization
- Simple Q&A
- Entity extraction
- Format conversion
- Basic classification

❌ **Not suitable for:**
- Complex reasoning
- Code generation
- Multi-step workflows
- Mathematical proofs

## Budget Impact

| Scenario | Monthly Cost |
|----------|--------------|
| Before (100% API) | ~$200 |
| After (60% local) | ~$80-120 |
| **Savings** | **$80-120/month** |

## Files

- `mission-control/scripts/test-mlx-llm.py` - Working test script
- `mission-control/python/apple_llm_bridge.py` - Legacy bridge (needs update)
- `mission-control/lib/ondevice-llm.ts` - TypeScript adapter

## Next Steps

1. [ ] Update `apple_llm_bridge.py` to use MLX instead of placeholder
2. [ ] Add .env flag: `APPLE_ONDEVICE_ENABLED=true`
3. [ ] Wire into Model Router for automatic routing
4. [ ] Add larger models for better quality (Phi-3-mini, Gemma-2B)
