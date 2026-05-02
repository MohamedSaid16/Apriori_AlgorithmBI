# Apriori Data Mining Project


A complete academic project that implements the **Apriori algorithm** from scratch in C++,
exposes it via a small Flask API bridge, and provides a clean Next.js front-end
that lets the user upload a dataset, choose the minimum support, and visualize
the frequent itemsets.

## Project structure

```
Apriori/
├── apriori.cpp            # C++ Apriori implementation
├── apriori.exe            # Compiled binary (Windows)
├── dataset.txt            # Sample dataset
├── backend/
│   ├── server.py          # Flask API bridge
│   └── requirements.txt
├── frontend/              # Next.js application
│   ├── package.json
│   ├── next.config.js
│   ├── pages/
│   │   ├── _app.js
│   │   └── index.js
│   └── styles/globals.css
└── README.md
```

## 1. Build the C++ binary

```powershell
g++ -std=c++17 -O2 apriori.cpp -o apriori.exe
```

Quick test:

```powershell
.\apriori.exe dataset.txt 3
```

## 2. Start the Flask bridge (port 5000)

```powershell
cd backend
pip install -r requirements.txt
python server.py
```

## 3. Start the Next.js front-end (port 3000)

```powershell
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

The front-end calls `/api/run`; Next.js rewrites it to `http://127.0.0.1:5000/api/run`,
where Flask invokes `apriori.exe` and returns the JSON.

## Dataset format

One transaction per line. Items separated by spaces or commas.

```
bread milk eggs
bread butter
milk eggs butter
```

## Colors

- Earth Yellow `#E1A95F`
- Delft Blue   `#1F305E`

Authors: **Ghoulam Mohamed Said**, **Ounes Abdelfattah Tahar**

