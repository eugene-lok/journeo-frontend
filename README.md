# Journeo 

---

## About
Journeo is a cutting-edge LLM-powered travel itinerary planner designed to help users generate personalized travel plans by describing their travel preferences through an intuitive chatbot interface. The frontend of this app is built using React.js and styled with Tailwind CSS, integrating seamlessly with the backend built with FastAPI and LangChain.

### Key Features:
- **Chatbot Interface**: Interact with the LLM to generate personalized travel itineraries based on preferences.
- **Interactive Map**: View travel locations on a Mapbox-powered map.
- **Real-time Visualization**: Dynamic display of itineraries and routes based on user input.
- **Seamless Integration**: Communicates with the backend for itinerary generation and geolocation services.

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
