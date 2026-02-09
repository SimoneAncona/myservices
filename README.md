# My Service self-hosting solutions

## Installation

Run the `./build.sh` script to build the project  
Available options:
- **none**: build the project for no specific targe
- **win**: build standalone application for Windows (client only)
- **linux**: build standalone application for Linux (client only)
- **docker**: build the service for Docker (WIP)

### Additional dependencies required:
The python server uses `llama-cpp` in order to run, see https://llama-cpp-python.readthedocs.io/en/latest/ to set the environment variables **before building** the project

UV package manager for python is required


## Configuration
In order to run, the server needs several environment variables:
- `MYFILES_ROOT_DIR`: the root directory, required
- `MYFILES_ORIGINS`: accepted origins
- `MYFILES_AI_MODEL_PATH`: the path to a GGUF ai model