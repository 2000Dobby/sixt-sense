import { getRecommendationsForBooking } from '@/lib/recommendations';
import { dataSource } from '@/lib/dataSource.current';

async function testRecommendations() {
  console.log('--- Testing Recommendations Logic ---');

  // Mock a booking ID - in a real scenario, this would exist in the mock data
  const bookingId = 'booking_123';
  
  // Ensure we have some mock data available (implicitly handled by dataSource.mock.ts if active)
  
  try {
    const result = await getRecommendationsForBooking(bookingId);

    console.log('Booking ID:', result.bookingId);
    console.log('Persona:', result.persona.label, `(${result.persona.id})`);
    console.log('User Tags:', result.userTags);
    
    console.log('\n--- Top 3 Car Candidates ---');
    result.carCandidates.slice(0, 3).forEach((c, i) => {
      console.log(`#${i + 1}: ${c.vehicle.brand} ${c.vehicle.model} (Score: ${c.totalScore.toFixed(2)})`);
      console.log(`    Tags: ${c.tags.join(', ')}`);
      console.log(`    Match: ${c.matchScore.toFixed(2)}, Space: ${c.spaceFit}, Eco: ${c.ecoMatch}, Premium: ${c.brandPremium}, PricePenalty: ${c.pricePenalty.toFixed(2)}`);
    });

    console.log('\n--- Top 3 Protection Candidates ---');
    result.protectionCandidates.slice(0, 3).forEach((p, i) => {
      console.log(`#${i + 1}: ${p.protection.name} (Score: ${p.totalScore.toFixed(2)})`);
      console.log(`    Tags: ${p.tags.join(', ')}`);
      console.log(`    RiskScore: ${p.riskCoverageScore}, PricePenalty: ${p.pricePenalty.toFixed(2)}`);
    });

    console.log('\n--- Decision ---');
    console.log('Primary Offer Type:', result.primaryOfferType);

  } catch (error) {
    console.error('Error running recommendations:', error);
  }
}

// Simple polyfill for running in node if needed, though tsx handles env usually.
// This script assumes the environment is set up to allow the imports.
testRecommendations();

