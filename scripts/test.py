import torch
import numpy as np

print("Python:", torch.sys.version)
print("CUDA available:", torch.cuda.is_available())
print("CUDA device count:", torch.cuda.device_count())

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

print("NumPy version:", np.__version__)
