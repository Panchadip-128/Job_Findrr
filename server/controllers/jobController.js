import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Job from "../models/JobModel.js";

// Global mock in-memory database to serve as a high-fidelity fallback if MongoDB is offline
let mockJobs = [
  {
    _id: "60d5f5f5f5f5f5f5f5f5f5f1",
    title: "Lead Software Engineer (Next.js & Node)",
    location: "San Francisco, CA (Remote)",
    salary: 145000,
    salaryType: "Year",
    negotiable: true,
    jobType: ["Full-Time"],
    description: "<p>We are looking for a senior full-stack engineer to lead our Next.js and Node.js products. You will work on building scalable real-time systems and beautiful customer interfaces.</p>",
    tags: ["Fullstack", "Next.js", "Node.js"],
    skills: ["Next.js", "React", "Node.js", "MongoDB", "TypeScript"],
    likes: [],
    createdBy: {
      _id: "60d000000000000000000001",
      name: "Developer Admin",
      profilePicture: "https://avatar.iran.liara.run/public/boy"
    },
    applicants: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: "60d5f5f5f5f5f5f5f5f5f5f2",
    title: "Senior UI/UX Designer",
    location: "New York, NY (Hybrid)",
    salary: 120000,
    salaryType: "Year",
    negotiable: false,
    jobType: ["Full-Time", "Contract"],
    description: "<p>Join our design team to craft sleek interfaces, glassmorphism aesthetics, dynamic interactions, and high-converting portals for our user base.</p>",
    tags: ["Design", "UI/UX", "Figma"],
    skills: ["Figma", "UI/UX", "TailwindCSS", "Aesthetics"],
    likes: [],
    createdBy: {
      _id: "60d000000000000000000001",
      name: "Developer Admin",
      profilePicture: "https://avatar.iran.liara.run/public/boy"
    },
    applicants: [],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: "60d5f5f5f5f5f5f5f5f5f5f3",
    title: "DevOps Engineer (Kubernetes & AWS)",
    location: "Austin, TX (Remote)",
    salary: 135000,
    salaryType: "Year",
    negotiable: true,
    jobType: ["Full-Time"],
    description: "<p>Manage our cloud infrastructure. Automate deployment pipelines, scale Kubernetes clusters, and optimize server latency.</p>",
    tags: ["DevOps", "AWS", "Kubernetes"],
    skills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Terraform"],
    likes: [],
    createdBy: {
      _id: "60d000000000000000000001",
      name: "Developer Admin",
      profilePicture: "https://avatar.iran.liara.run/public/boy"
    },
    applicants: [],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Helper to get or dynamically create user in DB if missing
const getOrCreateUser = async (oidcUser) => {
  if (!oidcUser) return null;
  let user = await User.findOne({ 
    $or: [
      { auth0Id: oidcUser.sub },
      { email: oidcUser.email }
    ]
  });

  if (!user) {
    user = new User({
      auth0Id: oidcUser.sub,
      email: oidcUser.email,
      name: oidcUser.name || "Developer Admin",
      role: "jobseeker",
      profilePicture: oidcUser.picture || "https://avatar.iran.liara.run/public/boy",
    });
    await user.save();
    console.log("User dynamically created in DB:", user.email);
  } else if (!user.auth0Id && oidcUser.sub) {
    user.auth0Id = oidcUser.sub;
    await user.save();
  }
  return user;
};

export const createJob = asyncHandler(async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let user = null;

    if (isDbConnected) {
      user = await getOrCreateUser(req.oidc?.user);
    } else {
      user = {
        _id: "60d000000000000000000001",
        name: req.oidc?.user?.name || "Developer Admin",
        profilePicture: req.oidc?.user?.picture || "https://avatar.iran.liara.run/public/boy",
        email: req.oidc?.user?.email || "developer@jobfindrr.local"
      };
    }

    const isAuth = req.oidc?.isAuthenticated?.() || (user && user.email);

    if (!isAuth || !user) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const {
      title,
      description,
      location,
      salary,
      jobType,
      tags,
      skills,
      salaryType,
      negotiable,
    } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!description) return res.status(400).json({ message: "Description is required" });
    if (!location) return res.status(400).json({ message: "Location is required" });
    if (!salary) return res.status(400).json({ message: "Salary is required" });
    if (!jobType || (Array.isArray(jobType) && jobType.length === 0)) return res.status(400).json({ message: "Job Type is required" });
    if (!tags || (Array.isArray(tags) && tags.length === 0)) return res.status(400).json({ message: "Tags are required" });
    if (!skills || (Array.isArray(skills) && skills.length === 0)) return res.status(400).json({ message: "Skills are required" });

    const newJobData = {
      _id: isDbConnected ? undefined : `mock_job_${Date.now()}`,
      title,
      description,
      location,
      salary,
      jobType,
      tags,
      skills,
      salaryType,
      negotiable,
      createdBy: user,
      likes: [],
      applicants: [],
      createdAt: new Date().toISOString()
    };

    if (isDbConnected) {
      const job = new Job({
        ...newJobData,
        createdBy: user._id,
      });
      await job.save();
      const populatedJob = await Job.findById(job._id).populate("createdBy", "name profilePicture");
      return res.status(201).json(populatedJob);
    } else {
      mockJobs.unshift(newJobData);
      console.log("Mock job created in memory successfully:", newJobData.title);
      return res.status(201).json(newJobData);
    }
  } catch (error) {
    console.log("Error in createJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// get jobs
export const getJobs = asyncHandler(async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const jobs = await Job.find({})
        .populate("createdBy", "name profilePicture")
        .sort({ createdAt: -1 }); // sort by latest job
      return res.status(200).json(jobs);
    } else {
      return res.status(200).json(mockJobs);
    }
  } catch (error) {
    console.warn("⚠️ Database is offline. Falling back to mock/seed job listings.");
    return res.status(200).json(mockJobs);
  }
});

// get jobs by user
export const getJobsByUser = asyncHandler(async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const jobs = await Job.find({ createdBy: user._id })
        .populate("createdBy", "name profilePicture")
        .sort({ createdAt: -1 });

      return res.status(200).json(jobs);
    } else {
      const userJobs = mockJobs.filter(
        (job) => job.createdBy?._id === req.params.id
      );
      return res.status(200).json(userJobs);
    }
  } catch (error) {
    console.log("Error in getJobsByUser: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// search jobs
export const searchJobs = asyncHandler(async (req, res) => {
  try {
    const { tags, location, title } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let query = {};

      if (tags) {
        query.tags = { $in: tags.split(",") };
      }

      if (location) {
        query.location = { $regex: location, $options: "i" };
      }

      if (title) {
        query.title = { $regex: title, $options: "i" };
      }

      const jobs = await Job.find(query).populate(
        "createdBy",
        "name profilePicture"
      );

      return res.status(200).json(jobs);
    } else {
      let filteredJobs = [...mockJobs];
      
      if (tags) {
        const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.tags &&
            job.tags.some((tag) => tagList.includes(tag.toLowerCase()))
        );
      }

      if (location) {
        const locQuery = location.toLowerCase();
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.location && job.location.toLowerCase().includes(locQuery)
        );
      }

      if (title) {
        const titleQuery = title.toLowerCase();
        filteredJobs = filteredJobs.filter(
          (job) => job.title && job.title.toLowerCase().includes(titleQuery)
        );
      }

      console.log(`Mock search executed. Found ${filteredJobs.length} jobs.`);
      return res.status(200).json(filteredJobs);
    }
  } catch (error) {
    console.log("Error in searchJobs: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// apply for job
export const applyJob = asyncHandler(async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const user = await getOrCreateUser(req.oidc?.user);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (job.applicants.includes(user._id)) {
        return res.status(400).json({ message: "Already applied for this job" });
      }

      job.applicants.push(user._id);

      await job.save();

      return res.status(200).json(job);
    } else {
      const job = mockJobs.find((j) => j._id === req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const userId = "60d000000000000000000001";
      if (job.applicants.includes(userId)) {
        return res.status(400).json({ message: "Already applied for this job" });
      }

      job.applicants.push(userId);
      console.log(`Mock user applied to mock job: ${job.title}`);
      return res.status(200).json(job);
    }
  } catch (error) {
    console.log("Error in applyJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// liek and unlike job
export const likeJob = asyncHandler(async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const user = await getOrCreateUser(req.oidc?.user);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isLiked = job.likes.includes(user._id);

      if (isLiked) {
        job.likes = job.likes.filter((like) => !like.equals(user._id));
      } else {
        job.likes.push(user._id);
      }

      await job.save();

      return res.status(200).json(job);
    } else {
      const job = mockJobs.find((j) => j._id === req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const userId = "60d000000000000000000001";
      const isLiked = job.likes.includes(userId);
      if (isLiked) {
        job.likes = job.likes.filter((like) => like !== userId);
      } else {
        job.likes.push(userId);
      }
      console.log(`Mock user liked/unliked mock job: ${job.title}`);
      return res.status(200).json(job);
    }
  } catch (error) {
    console.log("Error in likeJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// get job by id
export const getJobById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const job = await Job.findById(id).populate(
        "createdBy",
        "name profilePicture"
      );

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      return res.status(200).json(job);
    } else {
      const job = mockJobs.find((j) => j._id === id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      return res.status(200).json(job);
    }
  } catch (error) {
    console.log("Error in getJobById: ", error);
    const job = mockJobs.find((j) => j._id === req.params.id);
    if (job) return res.status(200).json(job);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// delete job
export const deleteJob = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const job = await Job.findById(id);
      const user = await getOrCreateUser(req.oidc?.user);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await job.deleteOne({
        _id: id,
      });

      return res.status(200).json({ message: "Job deleted successfully" });
    } else {
      const jobIndex = mockJobs.findIndex((j) => j._id === id);
      if (jobIndex === -1) {
        return res.status(404).json({ message: "Job not found" });
      }
      mockJobs.splice(jobIndex, 1);
      console.log(`Mock job deleted in-memory: ${id}`);
      return res.status(200).json({ message: "Job deleted successfully in-memory" });
    }
  } catch (error) {
    console.log("Error in deleteJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});
