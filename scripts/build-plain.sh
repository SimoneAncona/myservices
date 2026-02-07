echo "Building the project"
cd client
npm install
npm run build
cd ..
mkdir out > /dev/null
mv ./client/dist ./out
cd server
uv sync
cd ..
cp ./server/.venv/ ./out/ -r
cp ./server/src/ ./out/ -r
cp ./server/main.py ./out/
cp ./server/pyproject.toml ./out
cp ./server/uv.lock ./out
cp ./server/.python-version ./out
cd out
echo "echo \"Not for production environment\"; cd dist; ../.venv/Scripts/python -m http.server 8080" > startui.sh
echo ".venv/Scripts/uvicorn main:app" > start_server.sh