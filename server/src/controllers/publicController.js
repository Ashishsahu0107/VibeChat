import Contact from "../model/publicModel.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please provide all required fields (name, email, message)" });
    }

    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();

    res.status(201).json({ message: "Contact message submitted successfully!" });
  } catch (error) {
    console.error("Error in submitContactForm:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
