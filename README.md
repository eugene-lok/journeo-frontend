# Journeo

---

## About
Journeo is a cutting-edge LLM-powered travel itinerary planner designed to help users generate personalized travel plans through an intuitive chatbot interface. By leveraging advanced language models and geolocation services, Journeo transforms travel planning into an interactive and engaging experience.

### Key Features:
- **Intelligent Chatbot Interface**: Interact with an AI to generate personalized travel itineraries based on your preferences.
- **Interactive Mapbox Map**: Visualize your entire trip's locations with detailed, dynamic mapping.
- **Real-time Itinerary Generation**: Dynamically display routes, places, and travel details based on your input.
- **Seamless Frontend-Backend Integration**: Communicates with a [FastAPI backend](https://github.com/eugene-lok/journeo-backend) for intelligent itinerary generation and geolocation services.

---

## Technologies Used 
- **React** (Frontend Framework)
- **Tailwind CSS** (Styling)
- **Mapbox GL JS** (Interactive Mapping)
- **Lucide React** (Icons)
- **Axios** (HTTP Requests)

---

## Setup / Installation 💻

**Note:** This is the frontend component of Journeo. You must also set up the [Journeo Backend](https://github.com/eugene-lok/journeo-backend) for full functionality.

1. Create a Mapbox account and obtain a [Mapbox access token](https://docs.mapbox.com/help/getting-started/access-tokens/). 

2. Clone the repository:
    ```bash
    git clone https://github.com/eugene-lok/journeo-frontend.git
    cd journeo-frontend
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Set up environment variables:
    - Create a `.env` file in the root of your project
    - Add your Mapbox access token:
    ```bash
    REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
    ```

5. Start the development server:
    ```bash
    npm start
    ```

6. Open `http://localhost:3000` in your browser.

## Backend Repository
For the server-side implementation, visit the [Journeo Backend Repository](https://github.com/eugene-lok/journeo-backend).

## Key Components

### Chat Interface
- Allows users to describe their travel preferences
- Extracts key travel details like destination, budget, and duration
- Provides an intuitive way to generate personalized itineraries

### Interactive Map
- Displays locations from generated itineraries
- Shows routes between destinations
- Provides detailed information about each location

### Itinerary Display
- Shows day-by-day breakdown of travel plans
- Includes location details, descriptions, and routes
- Supports day-by-day navigation

---
