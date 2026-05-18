// Node test script to POST a job to the backend
// Usage: node test_post.js [backendUrl]

const backendUrl = process.argv[2] || process.env.API_URL || 'http://localhost:5000';

const jobData = {
  title: 'Automated Test Job',
  description: 'This is a test job posted by test_post.js',
  location: 'Remote',
  salary: 90000,
  jobType: ['Full-Time'],
  tags: ['test','automation'],
  skills: ['Node.js','React'],
  salaryType: 'Year',
  negotiable: false
};

async function postJob() {
  try {
    const res = await fetch(`${backendUrl}/api/v1/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
      credentials: 'include'
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Request failed:', err.message);
  }
}

postJob();
