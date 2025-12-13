// Quick test to verify getMockCompanyByMemberId works
import { getMockCompanyByMemberId } from './src/data/mockCompanyDetails.ts';

const testIds = ['mem-001', 'mem-002', 'mem-015'];

testIds.forEach(id => {
  const company = getMockCompanyByMemberId(id);
  console.log(`Testing ${id}:`, company ? `✓ Found: ${company.name}` : '✗ Not found');
});
