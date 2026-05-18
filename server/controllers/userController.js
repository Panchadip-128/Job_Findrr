import asycHandler from "express-async-handler";
import User from "../models/UserModel.js";

export const getUserProfile = asycHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if we are using the mock developer user and database is offline/empty
    if (id === "auth0|mock_developer_user" || id === "auth0%7Cmock_developer_user") {
      try {
        const user = await User.findOne({ auth0Id: "auth0|mock_developer_user" });
        if (user) {
          return res.status(200).json(user);
        }
      } catch (dbErr) {
        console.warn("⚠️ Database is offline. Falling back to mock user profile.");
      }
      
      // Database offline or user not in DB yet, return the default mock developer profile
      return res.status(200).json({
        _id: "60d000000000000000000001",
        name: "Developer Admin",
        email: "developer@jobfindrr.local",
        auth0Id: "auth0|mock_developer_user",
        role: "jobseeker",
        profilePicture: "https://avatar.iran.liara.run/public/boy",
        bio: "Senior Full-Stack Engineer and Safety Inspector.",
        profession: "Lead Engineer",
        appliedJobs: [],
        savedJobs: []
      });
    }

    // find user by auth0 id
    try {
      const user = await User.findOne({ auth0Id: id });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (dbErr) {
      console.warn("⚠️ Database lookup failed for user profile. Falling back to dynamic mock profile.");
      return res.status(200).json({
        _id: "60d000000000000000000001",
        name: req.oidc?.user?.name || "Developer Admin",
        email: req.oidc?.user?.email || "developer@jobfindrr.local",
        auth0Id: id,
        role: "jobseeker",
        profilePicture: req.oidc?.user?.picture || "https://avatar.iran.liara.run/public/boy",
        bio: "Senior Full-Stack Engineer.",
        profession: "Lead Engineer",
        appliedJobs: [],
        savedJobs: []
      });
    }
  } catch (error) {
    console.log("Error in getUserProfile: ", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
