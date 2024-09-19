# API Key Management System [ access-card ]

## Overview

This project is a real-time API Key Management System built with Node.js, Express and Socket.IO. It demonstrates the implementation of  real-time updates, data visualization, and a responsive user interface.

## Features

- **Real-time API Key Generation**: Create new API keys with custom names and automatic expiration.
- **Live Usage Tracking**: Monitor API key usage in real-time with automatic updates.
- **Interactive Data Visualization**: View API usage statistics through a dynamic, real-time updating chart.
- **Key Management**: Revoke or extend the expiration of existing API keys.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing in any environment.
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices.
- **Rate Limiting**: Built-in rate limiting to prevent API abuse.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript
- **Data Visualization**: Chart.js
- **API Security**: Custom middleware for API key validation

## Getting Started

### Prerequisites

- Node.js

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/gtchakama/access-card.git
   cd access-card
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   node app.js
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Generating a New API Key

1. Enter a name for your API key in the input field.
2. Click the "Generate API Key" button.
3. The new key will appear in the list below with its details and usage statistics.

### Managing API Keys

- **View Usage**: The bar chart at the bottom of the page shows real-time usage for all active keys.
- **Revoke Key**: Click the "Revoke" button next to any key to immediately invalidate it.
- **Extend Key**: Click the "Extend" button to add 5 minutes to the key's expiration time.

### Using an API Key

To use an API key to access protected data:

1. Copy the API key you wish to use.
2. Navigate to the "View Data" page (`http://localhost:3000/view-data`).
3. Paste the API key into the input field and click "Fetch Data".
4. If the key is valid, you'll see the protected data along with usage statistics.

### Dark Mode

Toggle between light and dark modes by clicking the "Toggle Theme" button in the top right corner.

## Code Highlights

### Real-time Updates with Socket.IO

```javascript
socket.on('usageUpdate', (data) => {
    const updatedKey = apiKeys.find(key => key.key === data.apiKey);
    if (updatedKey) {
        updatedKey.usage = data.usage;
        updateKeyList();
    }
});
```

This code snippet shows how the frontend listens for real-time usage updates and refreshes the UI accordingly.

### Dynamic Chart Updates

```javascript
function updateChart() {
    const labels = apiKeys.map(key => key.name);
    const data = apiKeys.map(key => key.usage);

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    } else {
        // Initialize chart...
    }
}
```

This function demonstrates how the Chart.js visualization is updated dynamically as API usage changes.

## Learning Outcomes

1. Building real-time applications using Socket.IO
2. Implementing secure API key authentication

## Future Enhancements

- Implement user authentication for managing multiple sets of API keys
- Add more detailed analytics and usage graphs
- Create a mobile app version using React Native
- Store API keys and usage data in a database for persistence
- Add support for multiple rate limits based on key type
- Implement API key rotation for enhanced security
- Add support for custom rate limits per key
- Create a dashboard for administrators to view all key usage at a glance


