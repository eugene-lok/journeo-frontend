# Journeo 

---

## About
This is the frontend for Journeo, an LLM-based travel itinerary planner. It allows users to input their travel preferences such as budget, destinations, and duration to generate a personalized travel itinerary with OpenAI's GPT. Locations from this itinerary are displayed on an interactive map. 

### Key Features:
- User-friendly form to input travel preferences. 
- Displays an interactive map using Mapbox, with dynamically generated locations.
---

## Technologies Used 
- **React** 
- **Tailwind CSS** 
- **Mapbox GL JS** 

---

## Setup / Installation 💻

**Note:** This is only the frontend of the application. You will need to set up and run the [backend](https://github.com/eugene-lok/journeo-backend) as well for full functionality.
1. Create a Mapbox account and obtain a [Mapbox access token](https://docs.mapbox.com/help/getting-started/access-tokens/). 

2. Clone the repository:
    ```bash
    git clone https://github.com/eugene-lok/journeo-frontend.git
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Set up environment variables:
    - Create a `.env` file in the root of your project and add your Mapbox access token.
    ```bash
    REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
    ```

5. Start the development server:
    ```bash
    npm start
    ```

6. Visit `http://localhost:3000` in your browser to see the application. Ensure the backend has been setup and is running as well. 

---
