const fs = require("fs");
const axios = require("axios");
const path = require('path'); // Import the path module

// Load API keys
const apiKeys = JSON.parse(fs.readFileSync(path.join(__dirname, 'api_keys.json'), 'utf-8'));

// Function to get API keys based on environment
const getApiKeys = (environment) => {
  if (!['Test', 'Production'].includes(environment)) {
    throw new Error('Invalid environment. Must be "Test" or "Production".');
  }
  return apiKeys[environment];
};

// Example usage
const environment = 'Test'; // Change to 'Production' for production keys
const keys = getApiKeys(environment);

const headers = {
  'x-client-id': keys.client_id,
  'x-client-secret': keys.client_secret,
};

console.log('Headers:', headers);

// Base URL Based on Environment
const baseURL =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/plans"
    : "https://sandbox.cashfree.com/pg/plans";

// Generate Dynamic Plan ID Using Current Timestamp
const currentTimestamp = Date.now();
const planId = `PLAN_${currentTimestamp}`;

// Request Data for Plan Creation
const planData = {
  plan_name: "Plan_Test_Cashfree",
  plan_id: planId, // Use the dynamically generated Plan ID
  plan_type: "ON_DEMAND",
  plan_currency: "INR",
  plan_max_amount: 1000,
  plan_max_cycles: 50,
};

// Function to Save the Plan ID to a JSON File
const savePlanId = () => {
  const data = { plan_id: planId };
  fs.writeFileSync("plan_data.json", JSON.stringify(data, null, 2), "utf8");
};

// Function to Create a Plan
const createPlan = async () => {
  try {
    console.log("Request Data:", JSON.stringify(planData, null, 2));

    const response = await axios.post(baseURL, planData, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": Cashfree.XClientId,
        "x-client-secret": Cashfree.XClientSecret,
      },
    });

    console.log("Plan Created Successfully:", response.data);

    // Save the Plan ID After Successful Creation
    savePlanId();
  } catch (error) {
    console.error(
      "Error Creating Plan:",
      error.response?.data || error.message
    );
  }
};

// Call the Function
createPlan();
