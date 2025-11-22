// import fetch from 'node-fetch'; // Native fetch is available in Node 18+

async function testEndpoints() {
  const BASE_URL = 'http://localhost:3000'; // Adjust if your dev server is on a different port

  console.log('--- Testing Persona Endpoint ---');
  try {
    const personaResponse = await fetch(`${BASE_URL}/api/ai/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "A family of 4 going on a 2 week vacation to the mountains, they have a lot of luggage and want safety."
      })
    });

    if (!personaResponse.ok) {
      throw new Error(`Persona endpoint failed: ${personaResponse.status} ${personaResponse.statusText}`);
    }

    const personaData = await personaResponse.json();
    console.log('Persona Response:', JSON.stringify(personaData, null, 2));
  } catch (error) {
    console.error('Error testing Persona endpoint:', error);
  }

  console.log('\n--- Testing Car Profile Endpoint ---');
  try {
    const carResponse = await fetch(`${BASE_URL}/api/ai/car-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle: {
          id: "v123",
          brand: "BMW",
          model: "X5",
          group: "XJAR",
          seats: 5,
          fuelType: "petrol",
          transmission: "automatic",
          acrissCode: "XJAR"
        }
      })
    });

    if (!carResponse.ok) {
      throw new Error(`Car Profile endpoint failed: ${carResponse.status} ${carResponse.statusText}`);
    }

    const carData = await carResponse.json();
    console.log('Car Profile Response:', JSON.stringify(carData, null, 2));
  } catch (error) {
    console.error('Error testing Car Profile endpoint:', error);
  }
}

testEndpoints();

