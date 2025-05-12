# ⚡️ EV Charging Trip Planner

https://ev-trip-planner-xi.vercel.app/

A React + Mapbox GL JS web app that helps electric-vehicle drivers plan long-distance trips by automatically inserting charging-station stops along the route. Built with:

- **React** for the UI  
- **Mapbox GL JS** for interactive maps & routing  
- **@turf** for distance calculations  
- **OpenChargeMap API** for finding EV chargers  

---

## 📦 Features

- 🔍 **Geocode** any U.S. city/locality  
- 🗺️ **Draw** the overall driving route on a Mapbox map  
- 🔋 **Compute** your vehicle’s maximum range (battery kWh ÷ consumption kWh/mi)  
- ⚡ **Auto-insert** charging stops within 50 km of each “max-range” point  
- 📍 **Custom markers** for start, end, and charging stations  
- 📐 **Color-coded** route legs:  
  - Grey = overall route  
  - 🟢 Green = “safe” leg (≤ 75 % battery usage)  
  - 🟠 Orange = “near limit” leg (75–100 % battery usage)  
- 🚫 **U.S. only** – prevents planning outside the United States  
- 📄 **Export**:  
  - ➡️ Direct link to Google Maps with all waypoints  
  - 📝 Downloadable turn-by-turn instructions file  

---

## 🛠️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ev-trip-planner.git
cd ev-trip-planner
```

### 2. Install Dependencies 
```bash
npm install
# or
yarn install
```

### 3. Create your environment file
Create a file called .env in the project root:
```bash
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_token_here
REACT_APP_CHARGE_API_KEY=your_openchargemap_api_key_here
```
• Mapbox Token: Get one from https://account.mapbox.com

• OpenChargeMap Key: Sign up at https://openchargemap.org/site/develop/api


### 4. Run the development server
```bash
npm start
# or
yarn start
```
Open http://localhost:3000 in your browser.


### 📂 Project Structure
```bash
ev-trip-planner/
├── public/
│   ├── battery-charging.png      # custom marker icon
│   ├── full-battery.ico          # favicon & PWA icon
│   └── index.html                # root HTML template
├── src/
│   ├── components/
│   │   ├── InputForm.jsx         # “From / To / Battery” form
│   │   ├── MapView.jsx           # Mapbox map & routing logic
│   │   ├── ExportButton.jsx      # “Export to Google Maps” button
│   │   └── ExportStepsButton.jsx # “Download turn-by-turn” file button
│   ├── utils/
│   │   └── api.js                # Mapbox & OpenChargeMap API wrappers
│   ├── App.js                    # main layout & state logic
│   ├── App.css                   # global styles (header, sidebar, legend)
│   └── index.js                  # React entry point
├── .env                          # your API keys (git-ignored)
├── package.json
└── README.md                     # this file
```


### 🚀 Deployment
1. Push your code to GitHub.

2. Connect the repository on [Vercel](https://vercel.com/new).

3. In Vercel’s Project Settings → Environment Variables, add:
   
>  • REACT_APP_MAPBOX_TOKEN

>  • REACT_APP_CHARGE_API_KEY

4. Trigger a deploy or let Vercel auto-deploy on each push to main.

5. Your production URL will be live in seconds!


### 📝 License
This project is licensed under the MIT License.
See the [LICENSE](https://mit-license.org/) file for details.


### ❤️ Acknowledgements
• Mapbox for the GL JS SDK

• OpenChargeMap for providing open EV charger data
