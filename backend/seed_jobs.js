const { Job, User } = require('./models_sql');

const seedJobs = async () => {
  try {
    // Find admin to be the "recruiter" for these sample jobs
    const admin = await User.findOne({ where: { role: 'Admin' } });
    
    if (!admin) {
      console.log('❌ Admin not found. Please run server.js first to seed admin.');
      process.exit(1);
    }

    const sampleJobs = [
      {
        title: 'Senior Full Stack Developer',
        company: 'TechFlow Solutions',
        location: 'Remote',
        description: 'We are looking for an experienced developer to lead our core product team. Must be proficient in Node.js, React, and MySQL.',
        requirements: ['5+ years experience', 'Strong SQL knowledge', 'Excellent communication'],
        salary: '$120k - $150k',
        recruiterId: admin.id
      },
      {
        title: 'HR Manager',
        company: 'Consultancy Hub Partners',
        location: 'Bangalore, India',
        description: 'Join our internal HR team to manage recruitment and employee relations for our growing consultancy network.',
        requirements: ['MBA in HR', '3 years experience', 'Experience in IT recruitment'],
        salary: '₹12L - ₹18L',
        recruiterId: admin.id
      },
      {
        title: 'Project Coordinator',
        company: 'Global Systems Inc.',
        location: 'Chennai, India',
        description: 'Help us streamline our project delivery across multiple international clients. Great growth opportunities.',
        requirements: ['PMP certification preferred', 'Bachelor degree', 'Highly organized'],
        salary: '₹8L - ₹12L',
        recruiterId: admin.id
      }
    ];

    for (const jobData of sampleJobs) {
      await Job.create(jobData);
    }

    console.log('✅ 3 Sample Jobs Seeded Successfully into MySQL!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedJobs();
