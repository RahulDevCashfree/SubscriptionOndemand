// Required modules
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Function to load API keys dynamically from api_keys.json
const loadApiKeys = (environment) => {
  try {
    const apiKeysPath = path.join(__dirname, 'api_keys.json');
    const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath, 'utf-8'));
    if (!apiKeys[environment]) {
      throw new Error(`Missing API keys for environment: ${environment}`);
    }
    return apiKeys[environment];
  } catch (error) {
    console.error('Error loading API keys:', error.message);
    process.exit(1);
  }
};

// Function to read the plan ID from plan_data.json
const getPlanId = () => {
  try {
    const planData = JSON.parse(fs.readFileSync('plan_data.json', 'utf8'));
    if (planData.plan_id) {
      console.log(`Fetched Plan ID: ${planData.plan_id}`);
      return planData.plan_id;
    } else {
      throw new Error('Plan ID is missing in plan_data.json');
    }
  } catch (error) {
    console.error('Error reading plan_data.json:', error.message);
    process.exit(1);
  }
};

// Function to save data into a JSON file
const saveDataToFile = (filename, data) => {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`${filename} saved successfully.`);
  } catch (error) {
    console.error(`Error saving ${filename}:`, error.message);
  }
};

// Function to create a subscription
const createSubscription = async (environment) => {
  // Load API keys dynamically
  const keys = loadApiKeys(environment);

  // Determine endpoint based on environment
  const baseUrl =
    environment === 'Test'
      ? 'https://sandbox.cashfree.com/pg/subscriptions'
      : 'https://api.cashfree.com/pg/subscriptions';

  // Current timestamp in milliseconds
  const currentTimestamp = Date.now();

  // Dynamically generate subscription_id
  const subscriptionId = `Sub-${currentTimestamp}`;

  // Fetch the plan ID
  const planId = getPlanId();

  // Set headers using loaded API keys
  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    'x-api-version': '2023-08-01',
    'x-client-id': keys.client_id,
    'x-client-secret': keys.client_secret,
  };

  // Payload for the request
  const data = {
    customer_details: {
      customer_name: 'Rahul Raman',
      customer_email: 'r.rahul@cashfree.com',
      customer_phone: '9988776655',
    },
    plan_details: {
      plan_id: planId, // Use the fetched plan ID here
      plan_note: 'This is test Subscription',
    },
    subscription_id: subscriptionId, // Pass the dynamically generated ID
    subscription_note: 'Created for test Subscription',
    subscription_expiry_time: '2028-01-14T23:00:08+05:30',
  };

  try {
    // Make the API call
    const response = await axios.post(baseUrl, data, { headers });
    console.log('Subscription Created Successfully:', response.data);

    // Save the subscription ID and session ID into respective files
    const subscriptionData = {
      environment,
      subscription_id: response.data.subscription_id,
    };
    saveDataToFile('sub_data.json', subscriptionData);

    const sessionData = {
      environment,
      subscription_session_id: response.data.subscription_session_id,
    };
    saveDataToFile('session_data.json', sessionData);
  } catch (error) {
    console.error(
      'Error Creating Subscription:',
      error.response ? error.response.data : error.message
    );
  }
};

// Set the environment and call the function
const environment = 'Test'; // Pass 'Test' or 'Prod'
createSubscription(environment);
