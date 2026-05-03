const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Job = require('./backend/models/Job');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const checkJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const recruiters = await User.find({ role: 'Recruiter' });
    console.log(`Found ${recruiters.length} Recruiters:`);
    recruiters.forEach(r => console.log(`- ${r.name} (${r._id})`));

    const jobs = await Job.find({}).populate('recruiter', 'name');
    console.log(`\nFound ${jobs.length} Jobs:`);
    jobs.forEach(j => {
      console.log(`- Job: ${j.title} | Company: ${j.company} | Recruiter: ${j.recruiter?.name} (${j.recruiter?._id})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkJobs();
